import { TocItem } from './types';

export interface Citation {
  document: string;
  segments: string[];
  raw: string;
}

const SCHEME = 'epiassist:';

export const encodeCitationHref = (raw: string): string => SCHEME + encodeURIComponent(raw);

export const decodeCitationHref = (href: string): Citation | null => {
  if (!href.startsWith(SCHEME)) return null;
  try {
    return parseCitation(decodeURIComponent(href.slice(SCHEME.length)));
  } catch {
    return null;
  }
};

export const parseCitation = (raw: string): Citation | null => {
  const parts = raw.split('/').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const [document, ...segments] = parts;
  return { document, segments, raw };
};

const normalize = (s: string): string => s.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Walks the TOC consuming one segment per matching heading. Returns the
 * heading-N id of the deepest matched section, or null if no match.
 */
export const resolveHeadingId = (toc: TocItem[], segments: string[]): string | null => {
  if (segments.length === 0) return null;

  let segIdx = 0;
  let lastMatchPosition = -1;

  for (let i = 0; i < toc.length && segIdx < segments.length; i++) {
    if (normalize(toc[i].name) === normalize(segments[segIdx])) {
      lastMatchPosition = i;
      segIdx++;
    }
  }

  if (segIdx !== segments.length) return null;
  return `heading-${lastMatchPosition}`;
};

const SOURCES_HEADER_RE = /(^|\n)Surse:\s*\n/;

/**
 * Detects the `Surse:` block at the end of an assistant message and rewrites
 * each citation line into a markdown link with the `epiassist:` scheme.
 * Returns the original text unchanged if no `Surse:` block is found.
 */
export const rewriteSourcesAsLinks = (text: string): string => {
  const match = SOURCES_HEADER_RE.exec(text);
  if (!match) return text;

  const headerStart = match.index + match[1].length;
  const before = text.slice(0, headerStart).replace(/\s+$/, '');
  const after = text.slice(match.index + match[0].length);

  const lines = after.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return text;

  const linkLines = lines.map((line) => {
    if (!line.includes('/')) return `- ${line}`;
    return `- [${line}](${encodeCitationHref(line)})`;
  });

  return `${before}\n\n**Surse:**\n\n${linkLines.join('\n')}`;
};
