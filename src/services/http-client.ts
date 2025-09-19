import axios, { type AxiosInstance, type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { ErrorResponse } from '@/types';
import { ErrorHandler } from './error-handler';

// HTTP Client Configuration
interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
}

class HttpClient {
  private axiosInstance: AxiosInstance;
  private config: ApiClientConfig;

  constructor(config?: Partial<ApiClientConfig>) {
    this.config = {
      baseUrl: 'http://localhost:8080',
      timeout: 30000,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...config,
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: this.config.defaultHeaders,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add JWT token if available
        const token = this.getStoredToken();
        if (token && this.isTokenValid(token)) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        const handledError = ErrorHandler.handle(error);
        
        // Handle specific status codes
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }

        return Promise.reject(handledError);
      }
    );
  }

  private getStoredToken(): string | null {
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.token || null;
      }
    } catch (error) {
      console.warn('Failed to parse stored auth data:', error);
    }
    return null;
  }

  private isTokenValid(token: string): boolean {
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        const expiresAt = parsed.expires_at;
        if (expiresAt) {
          return new Date(expiresAt) > new Date();
        }
      }
    } catch (error) {
      console.warn('Failed to validate token:', error);
    }
    return false;
  }

  private handleUnauthorized(): void {
    // Clear stored auth data
    localStorage.removeItem('auth');
    
    // Redirect to login page
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Public HTTP methods
  async get<T = any>(url: string, params?: any): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, { params });
    return response.data;
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data);
    return response.data;
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data);
    return response.data;
  }

  async delete<T = any>(url: string): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url);
    return response.data;
  }

  // Utility methods
  setAuthToken(token: string, expiresAt: string): void {
    const authData = {
      token,
      expires_at: expiresAt,
    };
    localStorage.setItem('auth', JSON.stringify(authData));
  }

  clearAuthToken(): void {
    localStorage.removeItem('auth');
  }

  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  // Get the underlying axios instance for advanced usage
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Create and export a singleton instance
export const httpClient = new HttpClient();
export { HttpClient };