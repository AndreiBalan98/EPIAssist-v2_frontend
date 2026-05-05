'use client';

import { useEffect, useState } from 'react';
import { api, type Conversation, type ChunkRef } from '@/lib/api';

type DetailState =
  | { kind: 'text'; title: string; text: string }
  | { kind: 'chunks'; title: string; chunks: ChunkRef[] }
  | null;

export default function ConvosPage() {
  const [convos, setConvos] = useState<Conversation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailState>(null);

  useEffect(() => {
    api.listConversations()
      .then(setConvos)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load');
      });
  }, []);

  if (error) {
    return (
      <div className="p-6 text-sm text-red-600">Error: {error}</div>
    );
  }

  if (!convos) {
    return (
      <div className="p-6 text-sm text-gray-400">Loading…</div>
    );
  }

  const openText = (title: string, text: string | null | undefined) => {
    if (!text) return;
    setDetail({ kind: 'text', title, text });
  };
  const openChunks = (title: string, chunks: ChunkRef[] | null | undefined) => {
    if (!chunks || chunks.length === 0) return;
    setDetail({ kind: 'chunks', title, chunks });
  };

  return (
    <div className="min-h-screen bg-bg-warm p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-dark">Conversations</h1>
        <span className="text-xs text-gray-400">{convos.length} total</span>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-orange-100 shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-warm-light text-gray-500 uppercase text-[10px] tracking-wide">
            <tr>
              <th className="px-3 py-2 w-10">ID</th>
              <th className="px-3 py-2 w-32">Created</th>
              <th className="px-3 py-2">User prompt</th>
              <th className="px-3 py-2">Enhanced prompt</th>
              <th className="px-3 py-2 w-24">Candidates</th>
              <th className="px-3 py-2 w-24">Context</th>
              <th className="px-3 py-2">Final answer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-50">
            {convos.map(c => (
              <tr key={c.id} className="hover:bg-bg-warm-light/40 align-top">
                <td className="px-3 py-2 text-gray-400">{c.id}</td>
                <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                  {formatDate(c.createdAt)}
                </td>
                <td className="px-3 py-2">
                  <TextCell text={c.userPrompt} onOpen={() => openText('User prompt', c.userPrompt)} />
                </td>
                <td className="px-3 py-2">
                  <TextCell text={c.enhancedPrompt} onOpen={() => openText('Enhanced prompt', c.enhancedPrompt)} />
                </td>
                <td className="px-3 py-2">
                  <ChunksCell chunks={c.candidateChunks} onOpen={() => openChunks('Candidate chunks', c.candidateChunks)} />
                </td>
                <td className="px-3 py-2">
                  <ChunksCell chunks={c.contextChunks} onOpen={() => openChunks('Context chunks', c.contextChunks)} />
                </td>
                <td className="px-3 py-2">
                  <TextCell text={c.finalAnswer} onOpen={() => openText('Final answer', c.finalAnswer)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ro-RO', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TextCell({ text, onOpen }: { text: string | null | undefined; onOpen: () => void }) {
  if (!text) return <span className="text-gray-300">—</span>;
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onOpen}
        className="line-clamp-1 text-left w-full text-gray-700 hover:text-primary transition-colors cursor-pointer"
      >
        {text}
      </button>
      <div className="hidden group-hover:block absolute z-20 left-0 top-full mt-1 max-w-2xl w-max bg-dark text-white text-xs rounded-lg shadow-xl p-3 whitespace-pre-wrap break-words pointer-events-none">
        {text}
      </div>
    </div>
  );
}

function ChunksCell({ chunks, onOpen }: { chunks: ChunkRef[] | null | undefined; onOpen: () => void }) {
  if (!chunks || chunks.length === 0) {
    return <span className="text-gray-300">—</span>;
  }
  return (
    <div className="group relative inline-block">
      <button
        type="button"
        onClick={onOpen}
        className="text-gray-700 hover:text-primary transition-colors cursor-pointer"
      >
        {chunks.length}
      </button>
      <div className="hidden group-hover:block absolute z-20 left-0 top-full mt-1 w-max max-w-xl bg-dark text-white text-xs rounded-lg shadow-xl p-3 pointer-events-none">
        <ul className="space-y-1">
          {chunks.map((c, i) => (
            <li key={i} className="flex gap-3 font-mono">
              <span className="text-orange-300 w-12 flex-shrink-0">
                {c.similarity?.toFixed(3)}
              </span>
              <span className="break-all">{c.url}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DetailModal({ detail, onClose }: { detail: DetailState; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!detail) return;
    document.body.style.overflow = 'hidden';
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [detail, onClose]);

  useEffect(() => {
    setCopied(false);
  }, [detail]);

  if (!detail) return null;

  const handleCopy = async () => {
    const payload = detail.kind === 'text'
      ? detail.text
      : detail.chunks.map(c => `${c.similarity?.toFixed(3) ?? '—'}\t${c.url}`).join('\n');
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-orange-100">
          <h2 className="text-sm font-semibold text-dark">{detail.title}</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-gray-500 hover:text-primary px-2 py-1 rounded transition-colors"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto p-4 text-sm">
          {detail.kind === 'text' ? (
            <pre className="whitespace-pre-wrap break-words font-sans text-gray-800">{detail.text}</pre>
          ) : (
            <ul className="space-y-2">
              {detail.chunks.map((c, i) => (
                <li key={i} className="flex gap-3 font-mono text-xs">
                  <span className="text-orange-500 w-14 flex-shrink-0">
                    {c.similarity?.toFixed(3) ?? '—'}
                  </span>
                  <span className="break-all text-gray-700">{c.url}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
