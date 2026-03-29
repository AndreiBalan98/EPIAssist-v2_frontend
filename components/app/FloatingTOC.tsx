'use client';

import { useState, useRef, useEffect } from 'react';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface FloatingTOCProps {
  headings: HeadingItem[];
  onHeadingClick: (id: string) => void;
  isMobileMode?: boolean;
  onMobileSelect?: () => void;
}

export const FloatingTOC = ({
  headings,
  onHeadingClick,
  isMobileMode = false,
  onMobileSelect,
}: FloatingTOCProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleHeadingClick = (id: string) => {


    setActiveHeading(id);
    onHeadingClick(id);

    if (isMobileMode) {
      onMobileSelect?.();
    }
  };

  const clearAutoCloseTimer = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  };

  const handleBarMouseEnter = () => {
    clearAutoCloseTimer();
    setIsExpanded(true);

    autoCloseTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 1000);
  };

  const handlePanelMouseEnter = () => {
    clearAutoCloseTimer();
    setIsExpanded(true);
  };

  const handlePanelMouseLeave = () => {
    clearAutoCloseTimer();
    setIsExpanded(false);
  };

  useEffect(() => {
    return () => clearAutoCloseTimer();
  }, []);

  if (headings.length === 0) return null;

  if (isMobileMode) {
    return (
      <div className="p-4">
        <nav className="space-y-1">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => handleHeadingClick(heading.id)}
              className={`w-full text-left text-sm transition-colors rounded px-3 py-2.5 ${
                activeHeading === heading.id
                  ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                  : 'text-gray-600 hover:bg-bg-warm-light active:bg-bg-warm-light'
              }`}
              style={{
                paddingLeft: `${(heading.level - 1) * 12 + 12}px`,
              }}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="fixed top-1/2 -translate-y-1/2 right-3 z-20 hidden lg:block">
      <div
        ref={barRef}
        onMouseEnter={handleBarMouseEnter}
        className={`absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-300 ${
          isExpanded ? 'opacity-0 w-0' : 'opacity-100 w-6'
        }`}
        style={{ height: 'min(400px, 60vh)' }}
      >
        <div className="h-full w-full bg-bg-warm rounded-lg shadow-lg border border-primary/10" />
      </div>

      <div
        ref={panelRef}
        onMouseEnter={handlePanelMouseEnter}
        onMouseLeave={handlePanelMouseLeave}
        className={`absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-300 ${
          isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
        }`}
      >
        <div className="bg-bg-warm rounded-lg shadow-2xl w-80 overflow-hidden border border-primary/10" style={{ maxHeight: '70vh' }}>
          <div className="p-4 border-b border-primary/10">
            <h2 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Cuprins
            </h2>
          </div>
          <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 60px)' }}>
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => handleHeadingClick(heading.id)}
                className={`w-full text-left text-xs transition-colors rounded px-2 py-1.5 ${
                  activeHeading === heading.id
                    ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                    : 'text-gray-600 hover:bg-bg-warm-light'
                }`}
                style={{
                  paddingLeft: `${(heading.level - 1) * 12 + 8}px`,
                }}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};
