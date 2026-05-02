/**
 * API service for backend communication.
 * Works automatically in both development (proxied) and production (direct URL).
 */
import axios, { AxiosInstance } from 'axios';

export interface DocumentResponse {
  content: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  message: string;
}

export interface FeedbackRequest {
  convo?: string | null;
  stars?: number | null;
  message?: string | null;
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

  async listDocuments(): Promise<string[]> {
    const { data } = await this.client.get<Array<{ name: string }>>('/documents');
    return data.map((d: { name: string }) => d.name);
  }

  async getDocument(name: string): Promise<DocumentResponse> {
    const { data } = await this.client.get<DocumentResponse>(`/documents/${name}`);
    return data;
  }

  async getDocumentTOC(name: string): Promise<Array<{ position: number; name: string; level: number }>> {
    const { data } = await this.client.get(`/documents/toc/${name}`);
    return data;
  }

  async sendChatMessage(message: string): Promise<ChatResponse> {
    const requestData: ChatRequest = { message };
    const { data } = await this.client.post<ChatResponse>('/chat', requestData);
    return data;
  }

  async submitFeedback(feedbackData: FeedbackRequest): Promise<void> {
    await this.client.post('/feedback', feedbackData);
  }

  async uploadDocument(name: string, file: File): Promise<{ name: string }> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    const { data } = await this.client.post<{ name: string }>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return data;
  }

  async deleteDocument(name: string): Promise<void> {
    await this.client.delete(`/documents/${encodeURIComponent(name)}`);
  }
}

export const api = new ApiService();
