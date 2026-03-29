'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

export const FeedbackButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [showThanks, setShowThanks] = useState(false);
  const [shouldBounce, setShouldBounce] = useState(false);
  const [isMouseInside, setIsMouseInside] = useState(false);
  const [canClose, setCanClose] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const bounceIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minimumOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const startBouncing = () => {
      const randomDelay = Math.random() * 15000 + 15000;

      bounceIntervalRef.current = setTimeout(() => {
        if (!isExpanded && !showThanks) {
          setShouldBounce(true);
          setTimeout(() => setShouldBounce(false), 1000);
        }
        startBouncing();
      }, randomDelay);
    };

    startBouncing();

    return () => {
      if (bounceIntervalRef.current) {
        clearTimeout(bounceIntervalRef.current);
      }
    };
  }, [isExpanded, showThanks]);

  const clearMinimumOpenTimer = () => {
    if (minimumOpenTimerRef.current) {
      clearTimeout(minimumOpenTimerRef.current);
      minimumOpenTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearMinimumOpenTimer();
  }, []);

  const handleSubmitReview = async () => {
    if (selectedRating) {
      try {
        await api.submitFeedback({
          stars: selectedRating,
          message: reviewText.trim() || null,
        });

        setShowThanks(true);
        setTimeout(() => {
          setShowThanks(false);
          setIsExpanded(false);
          setSelectedRating(null);
          setReviewText('');
        }, 3000);
      } catch (error) {
        console.error('Failed to submit feedback:', error);
        setShowThanks(true);
        setTimeout(() => {
          setShowThanks(false);
          setIsExpanded(false);
          setSelectedRating(null);
          setReviewText('');
        }, 3000);
      }
    }
  };

  const handleMouseEnter = () => {
    if (!showThanks) {
      setIsMouseInside(true);
      setIsExpanded(true);
      setShouldBounce(false);
      setCanClose(false);

      clearMinimumOpenTimer();
      minimumOpenTimerRef.current = setTimeout(() => {
        setCanClose(true);
      }, 1000);
    }
  };

  const handleMouseLeave = () => {
    setIsMouseInside(false);
  };

  useEffect(() => {
    if (!isMouseInside && canClose && isExpanded) {
      setIsExpanded(false);
      setCanClose(false);
    }
  }, [isMouseInside, canClose, isExpanded]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 left-6 z-30"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isExpanded && !showThanks && (
        <div className="absolute bottom-full left-0 mb-3 bg-bg-warm-alt rounded-lg shadow-xl p-4 border-2 border-secondary/30 w-72 animate-fade-in">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2 pb-2 border-b border-accent/20">
              <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <h3 className="text-sm font-semibold text-dark-light">Oferă-ne feedback!</h3>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-500">Cum ți se pare aplicația?</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="transition-transform hover:scale-110"
                  >
                    <svg
                      className="w-7 h-7"
                      fill={
                        (hoveredRating !== null && star <= hoveredRating) ||
                        (hoveredRating === null && selectedRating !== null && star <= selectedRating)
                          ? '#C67B6B'
                          : 'none'
                      }
                      stroke="#C67B6B"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {selectedRating !== null && (
              <div className="flex flex-col gap-2">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Spune-ne mai multe (opțional)..."
                  className="w-full px-3 py-2 text-sm border border-accent/30 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-none"
                  rows={3}
                />
                <button
                  onClick={handleSubmitReview}
                  className="self-end px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-[#B56A5C] rounded-md transition-colors"
                >
                  Trimite
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showThanks && (
        <div className="absolute bottom-full left-0 mb-3 bg-bg-warm-alt rounded-lg shadow-xl p-4 border-2 border-secondary w-72 animate-fade-in">
          <div className="flex items-center gap-2 text-secondary">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Mulțumim pentru feedback!</span>
          </div>
        </div>
      )}

      <button
        className={`
          w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-primary
          shadow-lg hover:shadow-xl transition-all duration-300
          flex items-center justify-center text-white
          hover:scale-110
          ${shouldBounce ? 'animate-bounce-attention' : ''}
          ${isExpanded ? 'ring-4 ring-secondary/20' : ''}
        `}
        aria-label="Oferă feedback"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
      </button>

      {!isExpanded && !showThanks && (
        <div className="absolute inset-0 rounded-full bg-secondary opacity-0 animate-ping-slow pointer-events-none" />
      )}
    </div>
  );
};
