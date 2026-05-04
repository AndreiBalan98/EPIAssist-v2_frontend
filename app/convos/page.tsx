'use client';

import { useEffect, useState } from 'react';
import { api, type Conversation, type ChunkRef } from '@/lib/api';

export default function ConvosPage() {
  const [convos, setConvos] = useState<Conversation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
                <td className="px-3 py-2"><TextCell text={c.userPrompt} /></td>
                <td className="px-3 py-2"><TextCell text={c.enhancedPrompt} /></td>
                <td className="px-3 py-2"><ChunksCell chunks={c.candidateChunks} /></td>
                <td className="px-3 py-2"><ChunksCell chunks={c.contextChunks} /></td>
                <td className="px-3 py-2"><TextCell text={c.finalAnswer} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

function TextCell({ text }: { text: string | null | undefined }) {
  if (!text) return <span className="text-gray-300">—</span>;
  return (
    <div className="group relative">
      <div className="line-clamp-1 text-gray-700 cursor-help">{text}</div>
      <div className="hidden group-hover:block absolute z-20 left-0 top-full mt-1 max-w-2xl w-max bg-dark text-white text-xs rounded-lg shadow-xl p-3 whitespace-pre-wrap break-words">
        {text}
      </div>
    </div>
  );
}

function ChunksCell({ chunks }: { chunks: ChunkRef[] | null | undefined }) {
  if (!chunks || chunks.length === 0) {
    return <span className="text-gray-300">—</span>;
  }
  return (
    <div className="group relative">
      <span className="text-gray-700 cursor-help">{chunks.length}</span>
      <div className="hidden group-hover:block absolute z-20 left-0 top-full mt-1 w-max max-w-xl bg-dark text-white text-xs rounded-lg shadow-xl p-3">
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
