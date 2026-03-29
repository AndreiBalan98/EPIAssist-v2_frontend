/**
 * API service for backend communication.
 * Works automatically in both development (proxied) and production (direct URL).
 */
import axios, { AxiosInstance } from 'axios';

export interface StatusResponse {
  status: string;
  message: string;
}

export interface DocumentResponse {
  filename: string;
  content: string;
}

export interface DocumentListResponse {
  documents: string[];
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
}

export interface FeedbackRequest {
  origin: 'landing_page' | 'footer' | 'application' | 'chat';
  rating?: number;
  feedback_text?: string;
  chat_prompt?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedback_id?: number;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    const isDev = process.env.NODE_ENV === 'development';
    const baseURL = isDev
      ? '/api'
      : (process.env.NEXT_PUBLIC_API_URL || 'https://epiassist.onrender.com/api');

    console.log('API Service initialized');
    console.log('  Environment:', isDev ? 'development' : 'production');
    console.log('  Base URL:', baseURL);

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (isDev) {
      this.client.interceptors.request.use(request => {
        console.log('API Request:', request.method?.toUpperCase(), request.url);
        return request;
      });

      this.client.interceptors.response.use(
        response => {
          console.log('API Response:', response.status, response.config.url);
          return response;
        },
        error => {
          console.error('API Error:', error.message);
          if (error.response) {
            console.error('  Status:', error.response.status);
            console.error('  Data:', error.response.data);
          }
          return Promise.reject(error);
        }
      );
    }
  }

  async getStatus(): Promise<StatusResponse> {
    const { data } = await this.client.get<StatusResponse>('/status');
    return data;
  }

  async listDocuments(): Promise<string[]> {
    const { data } = await this.client.get<DocumentListResponse>('/documents');
    return data.documents;
  }

  async getDocument(filename: string): Promise<DocumentResponse> {
    const { data } = await this.client.get<DocumentResponse>(`/documents/${filename}`);
    return data;
  }

  async sendChatMessage(message: string): Promise<ChatResponse> {
    const requestData: ChatRequest = { message };
    const { data } = await this.client.post<ChatResponse>('/chat', requestData);
    return data;
  }

  async submitFeedback(feedbackData: FeedbackRequest): Promise<FeedbackResponse> {
    const { data } = await this.client.post<FeedbackResponse>('/feedback', feedbackData);
    return data;
  }
}

export const api = new ApiService();
