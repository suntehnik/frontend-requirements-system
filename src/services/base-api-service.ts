import { httpClient } from './http-client'
import { ErrorHandler, type ApiError } from './error-handler'
import { API_VERSION } from '@/config/runtime'

export abstract class BaseApiService {
  protected baseUrl: string = `/api/${API_VERSION}`

  protected async apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    try {
      return await httpClient.get<T>(`${this.baseUrl}${url}`, params)
    } catch (error) {
      this.handleError(error as ApiError, 'GET', url)
      throw error
    }
  }

  protected async apiPost<T>(url: string, data?: unknown): Promise<T> {
    try {
      return await httpClient.post<T>(`${this.baseUrl}${url}`, data)
    } catch (error) {
      this.handleError(error as ApiError, 'POST', url)
      throw error
    }
  }

  protected async apiPut<T>(url: string, data?: unknown): Promise<T> {
    try {
      return await httpClient.put<T>(`${this.baseUrl}${url}`, data)
    } catch (error) {
      this.handleError(error as ApiError, 'PUT', url)
      throw error
    }
  }

  protected async apiPatch<T>(url: string, data?: unknown): Promise<T> {
    try {
      return await httpClient.patch<T>(`${this.baseUrl}${url}`, data)
    } catch (error) {
      this.handleError(error as ApiError, 'PATCH', url)
      throw error
    }
  }

  protected async apiDelete<T>(url: string): Promise<T> {
    try {
      return await httpClient.delete<T>(`${this.baseUrl}${url}`)
    } catch (error) {
      this.handleError(error as ApiError, 'DELETE', url)
      throw error
    }
  }

  private handleError(error: ApiError, method: string, url: string): void {
    const context = `${method} ${this.baseUrl}${url}`
    ErrorHandler.logError(error, context)
  }

  // Utility method to build query parameters
  protected buildQueryParams(params: Record<string, unknown>): Record<string, unknown> {
    const cleanParams: Record<string, unknown> = {}

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value
      }
    })

    return cleanParams
  }

  // Utility method to handle include parameters
  protected buildIncludeParam(include?: string | string[]): string | undefined {
    if (!include) return undefined

    if (Array.isArray(include)) {
      return include.join(',')
    }

    return include
  }
}
