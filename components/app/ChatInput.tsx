'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '@/lib/api';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import axios from 'axios';
import { Citation, decodeCitationHref, rewriteSourcesAsLinks } from '@/lib/citations';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInputProps {
  onCitationClick: (citation: Citation) => void;
}

const passthroughUrlTransform = (url: string) => url;

interface CitationLinkProps {
  href?: string;
  children?: React.ReactNode;
  onCitationClick: (citation: Citation) => void;
}

const CitationLink = ({ href, children, onCitationClick }: CitationLinkProps) => {
  const citation = href ? decodeCitationHref(href) : null;
  if (!citation) {
    return <a href={href}>{children}</a>;
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onCitationClick(citation);
      }}
      className="inline text-left text-secondary hover:text-[#B56A5C] underline decoration-dotted underline-offset-2 cursor-pointer break-words"
    >
      {children}
    </button>
  );
};

interface StarRatingProps {
  onRate: (rating: number, reviewText?: string) => void;
  currentRating: number | null;
  messageIndex: number;
  userPrompt?: string;
}

const StarRating = ({ onRate, currentRating, userPrompt }: StarRatingProps) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [showThanks, setShowThanks] = useState(false);
  const reviewContainerRef = useRef<HTMLDivElement>(null);

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
  };

  useEffect(() => {
    if (selectedRating !== null && reviewContainerRef.current) {
      setTimeout(() => {
        reviewContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
    }
  }, [selectedRating]);

  const handleSubmitReview = async () => {
    if (selectedRating) {
      try {
        await api.submitFeedback({
          stars: selectedRating,
          message: reviewText.trim() || null,
          convo: userPrompt || null,
        });

        onRate(selectedRating, reviewText.trim() || undefined);
        setShowThanks(true);
        setTimeout(() => setShowThanks(false), 3000);
      } catch (error) {
        console.error('Failed to submit chat feedback:', error);
        onRate(selectedRating, reviewText.trim() || undefined);
        setShowThanks(true);
        setTimeout(() => setShowThanks(false), 3000);
      }
    }
  };

  if (currentRating !== null && showThanks) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-secondary">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-medium">Mulțumim pentru feedback!</span>
      </div>
    );
  }

  if (currentRating !== null) return null;

  return (
    <div className="flex flex-col items-center gap-3 py-3 border-t border-accent/15 mt-4">
      <span className="text-xs text-gray-500">Cât de util a fost acest răspuns?</span>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(null)}
            className="transition-transform hover:scale-110"
          >
            <svg
              className="w-6 h-6"
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

      {selectedRating !== null && (
        <div ref={reviewContainerRef} className="w-full flex flex-col gap-2 animate-fade-in">
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Comentariu suplimentar (opțional)..."
            className="w-full px-3 py-2 text-sm border border-accent/30 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-none"
            rows={2}
          />
          <button
            onClick={handleSubmitReview}
            className="self-end px-4 py-1.5 text-sm font-medium text-white bg-secondary hover:bg-[#B56A5C] rounded-md transition-colors"
          >
            Trimite
          </button>
        </div>
      )}
    </div>
  );
};

export const ChatInput = ({ onCitationClick }: ChatInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [ratings, setRatings] = useState<Record<number, number | null>>({});

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  const handleMouseEnter = () => {
    if (isTouchDevice()) return;
    clearCloseTimer();
    setIsOpen(true);
    if (!hasInteracted) setHasInteracted(true);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice()) return;
    if (loading) return;
    if (message.trim() !== '') return;

    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  };

  const handleBubbleTap = () => {
    if (!isTouchDevice()) return;

    if (!isOpen) {
      setIsOpen(true);
      if (!hasInteracted) setHasInteracted(true);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  };

  useEffect(() => {
    if (!isTouchDevice()) return;

    const handleTouchOutside = (e: TouchEvent) => {
      if (!isOpen) return;
      if (loading) return;
      if (message.trim() !== '') return;

      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('touchstart', handleTouchOutside);
    return () => document.removeEventListener('touchstart', handleTouchOutside);
  }, [isOpen, loading, message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setLoading(true);
    setError(null);
    clearCloseTimer();
    setShowWelcome(false);

    const newConversation: Message[] = [
      ...conversation,
      { role: 'user', content: userMessage },
    ];
    setConversation(newConversation);
    setMessage('');

    try {
      const result = await api.sendChatMessage(userMessage);

      setConversation([
        ...newConversation,
        { role: 'assistant', content: result.message },
      ]);
    } catch (err) {
      console.error('Chat error:', err);

      if (axios.isAxiosError(err)) {
        if (err.response) {
          const statusCode = err.response.status;
          const detail = err.response.data?.detail || 'Unknown error';
          setError(`Server error (${statusCode}): ${detail}`);
        } else if (err.request) {
          setError('No response from server. Is the backend running?');
        } else {
          setError(`Request error: ${err.message}`);
        }
      } else {
        setError('Failed to get response. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  const lastAssistantMessage = conversation
    .slice()
    .reverse()
    .find(msg => msg.role === 'assistant');

  const lastAssistantIndex = conversation
    .map((msg, idx) => (msg.role === 'assistant' ? idx : -1))
    .filter(idx => idx !== -1)
    .pop();

  const handleRating = (rating: number) => {
    if (lastAssistantIndex !== undefined) {
      setRatings({ ...ratings, [lastAssistantIndex]: rating });
    }
  };

  const lastUserPrompt = lastAssistantIndex !== undefined && lastAssistantIndex > 0
    ? conversation[lastAssistantIndex - 1]?.content
    : undefined;

  const showResponseArea = isOpen && (loading || lastAssistantMessage || error || (showWelcome && hasInteracted));

  const welcomeContent =
`## Bine ai venit la Asistentul EPIAssist!

Sunt aici să te ajut să navighezi prin documentele legislative medicale. Iată ce mă poți întreba:

**Exemple de întrebări:**
- "Care sunt atribuțiile medicului șef de secție?"
- "În cazul infecțiilor asociate asistenței medicale, ce măsuri de dezinfecție trebuie luate?"
- "Cum se face compartimentarea secției de pediatrie în funcție de vârstă?"

**Sfaturi:**
- Fii specific în întrebări pentru răspunsuri mai exacte
- Pot căuta în toate documentele disponibile
- Voi indica sursa informațiilor din legislație
- Dacă nu sunt sigur, îți voi spune

**Pune-mi o întrebare pentru a începe!**`;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center
        w-[calc(100%-2rem)] sm:w-auto
        max-w-2xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showResponseArea && (
        <div className="mb-4 w-full bg-bg-warm-alt rounded-lg shadow-lg p-4 sm:p-6 max-h-80 sm:max-h-96 overflow-y-auto border border-accent/20">
          {loading ? (
            <LoadingIndicator />
          ) : error ? (
            <div>
              <p className="text-red-600 text-sm font-medium mb-1">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          ) : showWelcome && !lastAssistantMessage ? (
            <div className="prose prose-sm max-w-none prose-headings:text-dark-light prose-strong:text-secondary">
              <ReactMarkdown>{welcomeContent}</ReactMarkdown>
            </div>
          ) : lastAssistantMessage ? (
            <div>
              <div className="prose prose-sm max-w-none prose-headings:text-dark-light prose-strong:text-secondary prose-a:text-secondary">
                <ReactMarkdown
                  urlTransform={passthroughUrlTransform}
                  components={{
                    a: ({ href, children }) => (
                      <CitationLink href={href} onCitationClick={onCitationClick}>
                        {children}
                      </CitationLink>
                    ),
                  }}
                >
                  {rewriteSourcesAsLinks(lastAssistantMessage.content)}
                </ReactMarkdown>
              </div>
              <StarRating
                onRate={handleRating}
                currentRating={lastAssistantIndex !== undefined ? ratings[lastAssistantIndex] || null : null}
                messageIndex={lastAssistantIndex || 0}
                userPrompt={lastUserPrompt}
              />
            </div>
          ) : null}
        </div>
      )}

      <div
        onClick={handleBubbleTap}
        className={`transition-all duration-300 ease-out ${
          isOpen
            ? 'w-full sm:w-[500px] h-12 bg-bg-warm-alt rounded-full border border-accent/30'
            : 'w-14 h-14 bg-accent hover:bg-secondary rounded-full'
        } shadow-lg cursor-pointer flex items-center ${
          loading ? 'opacity-70' : ''
        }`}
      >
        {isOpen ? (
          <form onSubmit={handleSubmit} className="w-full px-4 sm:px-6">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={loading ? 'Se procesează...' : 'Pune o întrebare...'}
              className="w-full outline-none text-gray-700 placeholder-accent/50 text-sm sm:text-base bg-transparent"
              disabled={loading}
              autoFocus={typeof window !== 'undefined' && !isTouchDevice()}
            />
          </form>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
