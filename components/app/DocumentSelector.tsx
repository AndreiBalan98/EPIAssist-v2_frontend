'use client';

import { useState, useRef, useEffect } from 'react';

interface DocumentSelectorProps {
  documents: string[];
  selectedDocument: string | null;
  onSelect: (filename: string) => void;
  isMobileMode?: boolean;
  onMobileSelect?: () => void;
}

export const DocumentSelector = ({
  documents,
  selectedDocument,
  onSelect,
  isMobileMode = false,
  onMobileSelect,
}: DocumentSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    if (isMobileMode) return;
    clearTimer();
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (isMobileMode) return;
    closeTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 1000);
  };

  const handleDocumentSelect = (filename: string) => {
    onSelect(filename);

    if (isMobileMode) {
      onMobileSelect?.();
    } else {
      clearTimer();
      closeTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 500);
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  if (isMobileMode) {
    return (
      <div className="p-4">
        <div className="space-y-1">
          {documents.map((doc) => (
            <button
              key={doc}
              onClick={() => handleDocumentSelect(doc)}
              className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors ${
                selectedDocument === doc
                  ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                  : 'text-gray-700 hover:bg-bg-warm-light active:bg-bg-warm-light'
              }`}
            >
              {doc}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed top-6 left-6 z-30 hidden lg:block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`transition-all duration-300 ease-out bg-bg-warm shadow-lg rounded-lg overflow-hidden border border-primary/10 ${
          isExpanded ? 'w-64' : 'w-auto'
        }`}
      >
        {isExpanded ? (
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Documente
            </h2>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {documents.map((doc) => (
                <button
                  key={doc}
                  onClick={() => handleDocumentSelect(doc)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedDocument === doc
                      ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                      : 'text-gray-700 hover:bg-bg-warm-light'
                  }`}
                >
                  {doc}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 py-2 cursor-pointer flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">Documente</span>
          </div>
        )}
      </div>
    </div>
  );
};
