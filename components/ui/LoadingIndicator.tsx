'use client';

import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  'Analizez întrebarea ta',
  'Caut în documentele legislative',
  'Identific secțiunile relevante',
  'Extrag informațiile necesare',
  'Verific sursele',
  'Formulez răspunsul',
  'Adaug referințele',
];

const MESSAGE_DURATION = 2500;
const DOT_INTERVAL = 400;

export const LoadingIndicator = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      setDotCount(0);
    }, MESSAGE_DURATION);

    return () => clearInterval(messageTimer);
  }, []);

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, DOT_INTERVAL);

    return () => clearInterval(dotTimer);
  }, []);

  const currentMessage = LOADING_MESSAGES[messageIndex];
  const dots = '.'.repeat(dotCount);

  return (
    <div className="flex items-center justify-center py-8">
      <p className="text-primary italic text-base">
        {currentMessage}
        <span className="inline-block w-6 text-left">{dots}</span>
      </p>
    </div>
  );
};
