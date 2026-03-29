'use client';

import React, { useEffect, useRef } from 'react';

interface DocumentViewerProps {
  content: string;
  filename: string;
  onHeadingsExtracted: (headings: Array<{ id: string; text: string; level: number }>) => void;
  scrollToHeading?: string | null;
}

interface ParsedElement {
  type: 'heading' | 'paragraph' | 'list' | 'hr' | 'empty';
  level?: number;
  content?: string;
  items?: string[];
  id?: string;
}

const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
};

const parseInline = (text: string): React.JSX.Element[] => {
  const parts: React.JSX.Element[] = [];
  let currentIndex = 0;
  let keyCounter = 0;

  const pattern = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_)/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > currentIndex) {
      parts.push(<span key={keyCounter++}>{text.slice(currentIndex, match.index)}</span>);
    }

    if (match[2]) {
      parts.push(
        <strong key={keyCounter++} className="font-bold italic">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <strong key={keyCounter++} className="font-bold">
          {match[3]}
        </strong>
      );
    } else if (match[4] || match[5]) {
      parts.push(
        <em key={keyCounter++} className="italic">
          {match[4] || match[5]}
        </em>
      );
    }

    currentIndex = match.index + match[0].length;
  }

  if (currentIndex < text.length) {
    parts.push(<span key={keyCounter++}>{text.slice(currentIndex)}</span>);
  }

  return parts.length > 0 ? parts : [<span key={0}>{text}</span>];
};

const parseMarkdown = (content: string): ParsedElement[] => {
  const lines = content.split('\n');
  const elements: ParsedElement[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      elements.push({ type: 'empty' });
      i++;
      continue;
    }

    if (/^-{3,}$/.test(trimmedLine)) {
      elements.push({ type: 'hr' });
      i++;
      continue;
    }

    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = generateId(text);
      elements.push({ type: 'heading', level, content: text, id });
      i++;
      continue;
    }

    const listMatch = trimmedLine.match(/^(\s*)([-•]|[a-z]\)|[0-9]+\)|[a-z]\.|[0-9]+\.)\s+(.+)$/i);
    if (listMatch) {
      const items: string[] = [];

      while (i < lines.length) {
        const currentLine = lines[i].trim();
        const currentMatch = currentLine.match(/^([-•]|[a-z]\)|[0-9]+\)|[a-z]\.|[0-9]+\.)\s+(.+)$/i);

        if (!currentMatch) break;

        items.push(currentMatch[2]);
        i++;
      }

      elements.push({ type: 'list', items });
      continue;
    }

    let paragraphText = trimmedLine;
    i++;

    while (i < lines.length && lines[i].trim() &&
           !lines[i].trim().match(/^#{1,6}\s/) &&
           !lines[i].trim().match(/^([-•]|[a-z]\)|[0-9]+\)|[a-z]\.|[0-9]+\.)\s+/i) &&
           !lines[i].trim().match(/^-{3,}$/)) {
      paragraphText += ' ' + lines[i].trim();
      i++;
    }

    elements.push({ type: 'paragraph', content: paragraphText });
  }

  return elements;
};

export const DocumentViewer = ({
  content,
  onHeadingsExtracted,
  scrollToHeading,
}: DocumentViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const headings: Array<{ id: string; text: string; level: number }> = [];
    const lines = content.split('\n');

    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = generateId(text);
        headings.push({ id, text, level });
      }
    });

    onHeadingsExtracted(headings);
  }, [content, onHeadingsExtracted]);

  useEffect(() => {
    if (!scrollToHeading || !containerRef.current) return;

    const performScroll = () => {
      const element = document.getElementById(scrollToHeading);

      if (element && containerRef.current) {
        const offset = window.innerWidth < 1024 ? 64 : 80;
        containerRef.current.scrollTo({
          top: element.offsetTop - offset,
          behavior: 'smooth',
        });
      } else {
        setTimeout(() => {
          const retryElement = document.getElementById(scrollToHeading);
          if (retryElement && containerRef.current) {
            const offset = window.innerWidth < 1024 ? 64 : 80;
            containerRef.current.scrollTo({
              top: retryElement.offsetTop - offset,
              behavior: 'smooth',
            });
          }
        }, 200);
      }
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(performScroll);
    });
  }, [scrollToHeading]);

  const elements = parseMarkdown(content);

  const headingClasses: Record<number, string> = {
    1: 'text-3xl sm:text-4xl font-serif font-bold text-center text-dark mt-8 mb-6 break-words',
    2: 'text-2xl sm:text-3xl font-serif font-bold text-center text-dark mt-7 mb-5 break-words',
    3: 'text-xl sm:text-2xl font-serif font-semibold text-center text-[#4A4543] mt-6 mb-4 break-words',
    4: 'text-lg sm:text-xl font-sans font-semibold text-[#4A4543] mt-5 mb-3 break-words',
    5: 'text-base sm:text-lg font-sans font-semibold text-dark-light mt-4 mb-2 break-words',
    6: 'text-sm sm:text-base font-sans font-semibold text-dark-light mt-3 mb-2 break-words',
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 h-screen overflow-y-auto overflow-x-hidden pt-12 lg:pt-0 pb-24"
    >
      <div className="mx-auto lg:px-8 lg:py-8 lg:max-w-4xl">
        <div className="bg-white lg:bg-white/80 lg:rounded-lg lg:shadow-sm px-4 py-4 sm:px-6 sm:py-6 lg:p-12">
          <article className="document-content overflow-x-hidden">
            {elements.map((element, index) => {
              switch (element.type) {
                case 'heading': {
                  const HeadingTag = `h${element.level}` as keyof React.JSX.IntrinsicElements;
                  return (
                    <HeadingTag
                      key={index}
                      id={element.id}
                      className={headingClasses[element.level || 1]}
                    >
                      {parseInline(element.content || '')}
                    </HeadingTag>
                  );
                }

                case 'paragraph':
                  return (
                    <p key={index} className="text-dark-light leading-relaxed mb-4 text-base break-words overflow-wrap-anywhere">
                      {parseInline(element.content || '')}
                    </p>
                  );

                case 'list':
                  return (
                    <ul key={index} className="mb-4 ml-8 space-y-2.5 overflow-x-hidden">
                      {element.items?.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-dark-light leading-relaxed text-base marker:text-primary break-words">
                          {parseInline(item)}
                        </li>
                      ))}
                    </ul>
                  );

                case 'hr':
                  return (
                    <hr key={index} className="my-8 border-t-2 border-[#E5E1DD]" />
                  );

                case 'empty':
                  return <div key={index} className="h-2" />;

                default:
                  return null;
              }
            })}
          </article>
        </div>
      </div>
    </div>
  );
};
