'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { TocItem } from '@/lib/types';

interface UseDocumentsReturn {
  documents: string[];
  currentDocument: { name: string; content: string } | null;
  toc: TocItem[];
  loading: boolean;
  error: string | null;
  selectDocument: (name: string) => Promise<TocItem[] | null>;
}

export const useDocuments = (): UseDocumentsReturn => {
  const [documents, setDocuments] = useState<string[]>([]);
  const [currentDocument, setCurrentDocument] = useState<{ name: string; content: string } | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await api.listDocuments();
        setDocuments(docs);

        if (docs.length > 0) {
          await selectDocument(docs[0]);
        }
      } catch (err) {
        setError('Failed to load documents');
        console.error('Error loading documents:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectDocument = async (name: string): Promise<TocItem[] | null> => {
    setLoading(true);
    setError(null);
    setToc([]);

    try {
      const [doc, tocData] = await Promise.all([
        api.getDocument(name),
        api.getDocumentTOC(name),
      ]);
      setCurrentDocument({ name, content: doc.content });
      setToc(tocData);
      return tocData;
    } catch (err) {
      setError(`Failed to load document: ${name}`);
      console.error('Error loading document:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    documents,
    currentDocument,
    toc,
    loading,
    error,
    selectDocument,
  };
};
