import { httpClient } from './http-client';
import { ErrorHandler, type ApiError } from './error-handler';

export abstract class BaseApiService {
  protected baseUrl: string = '/api/v1';

  protected async apiGet<T>(url: string, params?: any): Promise<T> {
    try {
      return await httpClient.get<T>(`${this.baseUrl}${url}`, params);
    } catch (error) {
      this.handleError(error as ApiError, 'GET', url);
      throw error;
    }
  }

  protected async apiPost<T>(url: string, data?: any): Promise<T> {
    try {
      return await httpClient.post<T>(`${this.baseUrl}${url}`, data);
    } catch (error) {
      this.handleError(error as ApiError, 'POST', url);
      throw error;
    }
  }

  protected async apiPut<T>(url: string, data?: any): Promise<T> {
    try {
      return await httpClient.put<T>(`${this.baseUrl}${url}`, data);
    } catch (error) {
      this.handleError(error as ApiError, 'PUT', url);
      throw error;
    }
  }

  protected async apiPatch<T>(url: string, data?: any): Promise<T> {
    try {
      return await httpClient.patch<T>(`${this.baseUrl}${url}`, data);
    } catch (error) {
      this.handleError(error as ApiError, 'PATCH', url);
      throw error;
    }
  }

  protected async apiDelete<T>(url: string): Promise<T> {
    try {
      return await httpClient.delete<T>(`${this.baseUrl}${url}`);
    } catch (error) {
      this.handleError(error as ApiError, 'DELETE', url);
      throw error;
    }
  }

  private handleError(error: ApiError, method: string, url: string): void {
    const context = `${method} ${this.baseUrl}${url}`;
    ErrorHandler.logError(error, context);
  }

  // Utility method to build query parameters
  protected buildQueryParams(params: Record<string, any>): Record<string, any> {
    const cleanParams: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });

    return cleanParams;
  }

  // Utility method to handle include parameters
  protected buildIncludeParam(include?: string | string[]): string | undefined {
    if (!include) return undefined;
    
    if (Array.isArray(include)) {
      return include.join(',');
    }
    
    return include;
  }
}