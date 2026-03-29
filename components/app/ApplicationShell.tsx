'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/app/Header';
import { MobileDrawer } from '@/components/app/MobileDrawer';
import { DocumentSelector } from '@/components/app/DocumentSelector';
import { FloatingTOC } from '@/components/app/FloatingTOC';
import { DocumentViewer } from '@/components/app/DocumentViewer';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ChatInput } from '@/components/app/ChatInput';
import { FeedbackButton } from '@/components/app/FeedbackButton';
import { useDocuments } from '@/hooks/useDocuments';

export const ApplicationShell = () => {
  const { documents, currentDocument, toc, loading, error, selectDocument } = useDocuments();
  const [scrollToHeading, setScrollToHeading] = useState<string | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);

  const tocHeadings = toc.map(item => ({
    id: `heading-${item.position}`,
    text: item.name,
    level: item.level,
  }));

  const handleHeadingClick = useCallback((headingId: string) => {
    setScrollToHeading(headingId);
    setTimeout(() => setScrollToHeading(null), 1000);
  }, []);

  const handleDocumentSelect = useCallback(async (name: string) => {
    setScrollToHeading(null);
    await selectDocument(name);
  }, [selectDocument]);

  if (error && !currentDocument) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-warm">
        <div className="text-center px-4">
          <svg
            className="w-12 h-12 mx-auto text-primary mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-primary text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden overflow-x-hidden bg-white lg:bg-gradient-to-br lg:from-bg-warm lg:to-bg-warm-light">
      <Header
        onMenuClick={() => setIsMenuOpen(true)}
        onTocClick={() => setIsTocOpen(true)}
        showTocButton={tocHeadings.length > 0}
      />

      <MobileDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        side="left"
        title="Documente"
      >
        <DocumentSelector
          documents={documents}
          selectedDocument={currentDocument?.name || null}
          onSelect={handleDocumentSelect}
          isMobileMode={true}
          onMobileSelect={() => setIsMenuOpen(false)}
        />
      </MobileDrawer>

      <MobileDrawer
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        side="right"
        title="Cuprins"
      >
        <FloatingTOC
          headings={tocHeadings}
          onHeadingClick={handleHeadingClick}
          isMobileMode={true}
          onMobileSelect={() => setIsTocOpen(false)}
        />
      </MobileDrawer>

      <DocumentSelector
        documents={documents}
        selectedDocument={currentDocument?.name || null}
        onSelect={handleDocumentSelect}
      />

      {currentDocument && (
        <FloatingTOC
          headings={tocHeadings}
          onHeadingClick={handleHeadingClick}
        />
      )}

      {loading ? (
        <SkeletonLoader />
      ) : currentDocument ? (
        <DocumentViewer
          content={currentDocument.content}
          name={currentDocument.name}
          scrollToHeading={scrollToHeading}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center pt-12 lg:pt-0">
          <p className="text-gray-500">Select a document to view</p>
        </div>
      )}

      <ChatInput />

      <FeedbackButton />
    </div>
  );
};
