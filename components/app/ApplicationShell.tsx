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

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export const ApplicationShell = () => {
  const { documents, currentDocument, loading, error, selectDocument } = useDocuments();
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [scrollToHeading, setScrollToHeading] = useState<string | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);

  const handleHeadingsExtracted = useCallback((extractedHeadings: HeadingItem[]) => {
    setHeadings(extractedHeadings);
  }, []);

  const handleHeadingClick = useCallback((headingId: string) => {
    setScrollToHeading(headingId);
    setTimeout(() => setScrollToHeading(null), 1000);
  }, []);

  const handleDocumentSelect = useCallback(async (filename: string) => {
    setHeadings([]);
    setScrollToHeading(null);
    await selectDocument(filename);
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
        showTocButton={headings.length > 0}
      />

      <MobileDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        side="left"
        title="Documente"
      >
        <DocumentSelector
          documents={documents}
          selectedDocument={currentDocument?.filename || null}
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
          headings={headings}
          onHeadingClick={handleHeadingClick}
          isMobileMode={true}
          onMobileSelect={() => setIsTocOpen(false)}
        />
      </MobileDrawer>

      <DocumentSelector
        documents={documents}
        selectedDocument={currentDocument?.filename || null}
        onSelect={handleDocumentSelect}
      />

      {currentDocument && (
        <FloatingTOC
          headings={headings}
          onHeadingClick={handleHeadingClick}
        />
      )}

      {loading ? (
        <SkeletonLoader />
      ) : currentDocument ? (
        <DocumentViewer
          content={currentDocument.content}
          filename={currentDocument.filename}
          onHeadingsExtracted={handleHeadingsExtracted}
          scrollToHeading={scrollToHeading}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center pt-12 lg:pt-0">
          <p className="text-gray-500">Select a document to view</p>
        </div>
      )}

      <ChatInput
        onNavigateToSource={async (documentName: string, sectionName: string | null) => {
          const filename = `${documentName}.md`;
          const isCurrentDocument = currentDocument?.filename === filename;

          if (!isCurrentDocument) {
            await handleDocumentSelect(filename);
            await new Promise(resolve => setTimeout(resolve, 300));
          }

          if (sectionName) {
            const sectionId = sectionName
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .substring(0, 50);

            await new Promise(resolve => setTimeout(resolve, 100));
            setScrollToHeading(sectionId);

            setTimeout(() => {
              setScrollToHeading(null);
            }, 1000);
          }
        }}
      />

      <FeedbackButton />
    </div>
  );
};
