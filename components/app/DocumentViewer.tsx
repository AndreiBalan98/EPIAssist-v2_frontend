'use client';

import React, { useEffect, useRef } from 'react';

interface DocumentViewerProps {
  content: string;
  name: string;
  scrollToHeading?: string | null;
}

interface ListItem {
  content: string;
  children: ListItem[];
}

interface ParsedElement {
  type: 'heading' | 'paragraph' | 'list' | 'hr' | 'empty' | 'facsimil';
  level?: number;
  content?: string;
  items?: ListItem[];
  id?: string;
}

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
      parts.push(<strong key={keyCounter++} className="font-bold italic">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<strong key={keyCounter++} className="font-bold">{match[3]}</strong>);
    } else if (match[4] || match[5]) {
      parts.push(<em key={keyCounter++} className="italic">{match[4] || match[5]}</em>);
    }

    currentIndex = match.index + match[0].length;
  }

  if (currentIndex < text.length) {
    parts.push(<span key={keyCounter++}>{text.slice(currentIndex)}</span>);
  }

  return parts.length > 0 ? parts : [<span key={0}>{text}</span>];
};

function dedent(text: string): string {
  const lines = text.split('\n');
  const nonEmpty = lines.filter(l => l.trim().length > 0);
  if (nonEmpty.length === 0) return text;
  const minIndent = Math.min(...nonEmpty.map(l => l.match(/^(\s*)/)![1].length));
  return lines.map(l => l.slice(minIndent)).join('\n').replace(/^\n+|\n+$/g, '');
}

function getIndent(line: string): number {
  let count = 0;
  for (const ch of line) {
    if (ch === ' ') count++;
    else if (ch === '\t') count += 4;
    else break;
  }
  return count;
}

const LIST_RE = /^\s*-\s+(.+)$/;

// Skips blank/whitespace-only lines starting at index, returns next non-blank index.
function skipBlanks(lines: string[], i: number): number {
  while (i < lines.length && !lines[i].trim()) i++;
  return i;
}

function parseListAtDepth(
  lines: string[],
  startIndex: number,
  depth: number
): { items: ListItem[]; endIndex: number } {
  const items: ListItem[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines, but only if the next non-blank line continues this list level.
    if (!line.trim()) {
      const j = skipBlanks(lines, i);
      if (j < lines.length && LIST_RE.test(lines[j]) && getIndent(lines[j]) >= depth) {
        i = j;
        continue;
      }
      break;
    }

    if (!LIST_RE.test(line)) break;

    const indent = getIndent(line);
    if (indent < depth) break;
    if (indent > depth) break;

    const content = line.match(LIST_RE)![1].trim();
    i++;

    // Look past blank lines for deeper children.
    const j = skipBlanks(lines, i);
    let children: ListItem[] = [];
    if (j < lines.length && LIST_RE.test(lines[j]) && getIndent(lines[j]) > depth) {
      i = j;
      const result = parseListAtDepth(lines, i, getIndent(lines[i]));
      children = result.items;
      i = result.endIndex;
    }

    items.push({ content, children });
  }

  return { items, endIndex: i };
}

const parseMarkdown = (content: string): ParsedElement[] => {
  const lines = content.split(/\r?\n/);
  const elements: ParsedElement[] = [];
  let i = 0;
  let headingIndex = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      elements.push({ type: 'empty' });
      i++;
      continue;
    }

    if (trimmedLine === ':::facsimil') {
      i++;
      const facsimilLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== ':::') {
        facsimilLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing :::
      elements.push({ type: 'facsimil', content: facsimilLines.join('\n') });
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
      const id = `heading-${headingIndex}`;
      headingIndex++;
      elements.push({ type: 'heading', level, content: text, id });
      i++;
      continue;
    }

    if (LIST_RE.test(line)) {
      const result = parseListAtDepth(lines, i, getIndent(line));
      elements.push({ type: 'list', items: result.items });
      i = result.endIndex;
      continue;
    }

    // Each line is its own paragraph — preserves signature blocks, short labels, etc.
    elements.push({ type: 'paragraph', content: trimmedLine });
    i++;
  }

  return elements;
};

const renderListItems = (items: ListItem[], depth: number = 0): React.JSX.Element => (
  <ul
    className={depth === 0 ? 'mb-4 space-y-2' : 'mt-2 ml-6 space-y-1'}
    style={{ listStyle: 'none', padding: 0 }}
  >
    {items.map((item, idx) => (
      <li key={idx} className="text-dark-light leading-relaxed text-base break-words">
        {parseInline(item.content)}
        {item.children.length > 0 && renderListItems(item.children, depth + 1)}
      </li>
    ))}
  </ul>
);

export const DocumentViewer = ({
  content,
  scrollToHeading,
}: DocumentViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
                    <p key={index} className="text-dark-light leading-relaxed mb-2 text-base break-words overflow-wrap-anywhere">
                      {parseInline(element.content || '')}
                    </p>
                  );

                case 'list':
                  return (
                    <div key={index} className="overflow-x-hidden">
                      {renderListItems(element.items || [])}
                    </div>
                  );

                case 'hr':
                  return (
                    <hr key={index} className="my-8 border-t-2 border-[#E5E1DD]" />
                  );

                case 'empty':
                  return <div key={index} className="h-2" />;

                case 'facsimil':
                  return (
                    <div key={index} className="my-4 overflow-x-auto rounded-md border border-[#E5E1DD] bg-[#F8F6F4]">
                      <pre className="text-xs font-mono p-4 text-dark-light leading-snug whitespace-pre">
                        {dedent(element.content || '')}
                      </pre>
                    </div>
                  );

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
