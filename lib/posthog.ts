/**
 * PostHog Analytics Service
 * Centralized tracking for all user events
 */
import posthog from 'posthog-js';

export const initPostHog = () => {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!apiKey || apiKey === 'YOUR_POSTHOG_API_KEY_HERE') {
    console.warn('PostHog API key not configured. Analytics disabled.');
    return;
  }

  posthog.init(apiKey, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    disable_session_recording: true,
    autocapture: false,
  });

  console.log('PostHog initialized');
};

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (typeof posthog !== 'undefined' && posthog.__loaded) {
    posthog.capture(eventName, properties);
  }
};

export const trackPageView = (pageName: string, properties?: Record<string, unknown>) => {
  trackEvent('$pageview', {
    $current_url: window.location.href,
    page_name: pageName,
    ...properties,
  });
};

export const trackAppOpened = () => {
  trackEvent('app_opened', {
    timestamp: new Date().toISOString(),
  });
};

export const trackHeaderNavClick = (section: string) => {
  trackEvent('header_nav_click', {
    section,
    timestamp: new Date().toISOString(),
  });
};

export const trackCTAClick = (location: 'header' | 'mobile_menu' | 'hero' | 'cta_section') => {
  trackEvent('cta_button_click', {
    button_text: 'Deschide legislația',
    location,
    timestamp: new Date().toISOString(),
  });
};

export const trackFeedbackSubmitted = (
  origin: 'landing_page' | 'footer' | 'application' | 'chat',
  rating?: number,
  hasText?: boolean
) => {
  trackEvent('feedback_submitted', {
    origin,
    rating,
    has_text: hasText,
    timestamp: new Date().toISOString(),
  });
};

export const trackDocumentSelected = (filename: string) => {
  trackEvent('document_selected', {
    filename,
    timestamp: new Date().toISOString(),
  });
};

export const trackTOCItemClicked = (sectionName: string, documentName?: string) => {
  trackEvent('toc_item_clicked', {
    section_name: sectionName,
    document_name: documentName,
    timestamp: new Date().toISOString(),
  });
};

export const trackAIPromptSent = (promptLength: number) => {
  trackEvent('ai_prompt_sent', {
    prompt_length: promptLength,
    timestamp: new Date().toISOString(),
  });
};

export const trackSourceClick = (documentName: string, sectionName: string | null, fullPath: string) => {
  trackEvent('source_clicked', {
    document_name: documentName,
    section_name: sectionName,
    full_path: fullPath,
    timestamp: new Date().toISOString(),
  });
};

export const trackAICost = (
  totalTokens: number,
  inputTokens: number,
  outputTokens: number,
  costUSD: number
) => {
  trackEvent('ai_cost', {
    total_tokens: totalTokens,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: costUSD,
    timestamp: new Date().toISOString(),
  });
};

export default posthog;
