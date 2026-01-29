import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  AuthResponse,
  Document,
  DocumentType,
  DocumentListResponse,
  PollResponse,
} from '@/types';

// API base URL - uses environment variable or defaults to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Backend wraps responses in { success: true, data: {...} }
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token to requests
  client.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // Unwrap the response data from { success, data } format
  client.interceptors.response.use((response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  });

  return client;
};

const apiClient = createApiClient();

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  me: async (): Promise<{ id: string; username: string }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export const documentsApi = {
  getAll: async (): Promise<DocumentListResponse> => {
    const response = await apiClient.get<DocumentListResponse>('/documents');
    return response.data;
  },

  upload: async (file: File, documentType: DocumentType): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await apiClient.post<Document>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  poll: async (): Promise<PollResponse> => {
    const response = await apiClient.get<PollResponse>('/documents/poll');
    return response.data;
  },

  getResult: async (documentId: string): Promise<Document> => {
    const response = await apiClient.get<Document>(`/documents/${documentId}/result`);
    return response.data;
  },

  delete: async (documentId: string): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}`);
  },
};

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; code?: string }>;

    // Handle specific error codes
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    // Handle HTTP status codes
    if (axiosError.response?.status === 401) {
      return 'Invalid credentials. Please try again.';
    }
    if (axiosError.response?.status === 409) {
      return 'You have already uploaded this document type.';
    }
    if (axiosError.response?.status === 404) {
      return 'Resource not found.';
    }
    if (axiosError.response?.status === 400) {
      return axiosError.response.data?.message || 'Invalid request. Please check your input.';
    }
    if (axiosError.response?.status === 500) {
      return 'Server error. Please try again later.';
    }

    // Network errors
    if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ERR_NETWORK') {
      return 'Unable to connect to server. Please check your connection.';
    }

    return axiosError.message || 'An error occurred. Please try again.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}

export default apiClient;
