export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export type {
  StatusResponse,
  DocumentResponse,
  DocumentListResponse,
  ChatRequest,
  ChatResponse,
  FeedbackRequest,
  FeedbackResponse,
} from './api';
