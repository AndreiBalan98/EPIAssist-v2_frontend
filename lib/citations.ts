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

const normalize = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const segmentMatches = (tocName: string, segment: string): boolean => {
  const t = normalize(tocName);
  const s = normalize(segment);
  if (!t || !s) return false;
  if (t === s) return true;
  // Tolerate LLM truncation/expansion: prefix match on either side.
  return (
    t.startsWith(s + ' ') ||
    s.startsWith(t + ' ') ||
    t.split(' ')[0] === s ||
    s.split(' ')[0] === t
  );
};

/**
 * Walks the TOC consuming one segment per matching heading. Returns the
 * heading-N id of the deepest matched section. Falls back to the deepest
 * partial match if not all segments resolve.
 */
export const resolveHeadingId = (toc: TocItem[], segments: string[]): string | null => {
  if (segments.length === 0) return null;

  let segIdx = 0;
  let lastMatchPosition = -1;

  for (let i = 0; i < toc.length && segIdx < segments.length; i++) {
    if (segmentMatches(toc[i].name, segments[segIdx])) {
      lastMatchPosition = i;
      segIdx++;
    }
  }

  if (lastMatchPosition < 0) return null;
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
