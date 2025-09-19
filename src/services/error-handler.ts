import type { AxiosError } from 'axios'

// Error types
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

export interface ApiError {
  code: string
  message: string
  status: number
  type: ErrorType
  originalError?: AxiosError
}

export class ErrorHandler {
  static handle(error: AxiosError): ApiError {
    const status = error.response?.status || 0
    const errorData = error.response?.data as Record<string, unknown>
    const errorInfo = errorData?.error as Record<string, unknown> | undefined

    switch (status) {
      case 400:
        return {
          code: (errorInfo?.code as string) || 'VALIDATION_ERROR',
          message: (errorInfo?.message as string) || 'Ошибка валидации данных',
          status,
          type: ErrorType.VALIDATION,
          originalError: error,
        }

      case 401:
        return {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Требуется авторизация',
          status,
          type: ErrorType.AUTHORIZATION,
          originalError: error,
        }

      case 403:
        return {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Недостаточно прав доступа',
          status,
          type: ErrorType.AUTHORIZATION,
          originalError: error,
        }

      case 404:
        return {
          code: 'ENTITY_NOT_FOUND',
          message: 'Запрашиваемый объект не найден',
          status,
          type: ErrorType.VALIDATION,
          originalError: error,
        }

      case 409:
        return {
          code: 'DELETION_CONFLICT',
          message: (errorInfo?.message as string) || 'Невозможно удалить объект из-за зависимостей',
          status,
          type: ErrorType.VALIDATION,
          originalError: error,
        }

      case 500:
        return {
          code: 'INTERNAL_ERROR',
          message: 'Внутренняя ошибка сервера',
          status,
          type: ErrorType.SERVER,
          originalError: error,
        }

      default:
        if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR') {
          return {
            code: 'NETWORK_ERROR',
            message: 'Превышено время ожидания запроса',
            status: 0,
            type: ErrorType.NETWORK,
            originalError: error,
          }
        }

        return {
          code: 'NETWORK_ERROR',
          message: 'Ошибка сети или сервер недоступен',
          status,
          type: ErrorType.NETWORK,
          originalError: error,
        }
    }
  }

  static getUserFriendlyMessage(error: ApiError): string {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return error.message

      case ErrorType.AUTHORIZATION:
        if (error.status === 401) {
          return 'Сессия истекла. Пожалуйста, войдите в систему заново.'
        }
        return 'У вас недостаточно прав для выполнения этого действия.'

      case ErrorType.NETWORK:
        return 'Проблемы с подключением к серверу. Проверьте интернет-соединение и повторите попытку.'

      case ErrorType.SERVER:
        return 'Произошла ошибка на сервере. Попробуйте позже или обратитесь к администратору.'

      default:
        return 'Произошла неожиданная ошибка. Попробуйте обновить страницу.'
    }
  }

  static shouldRetry(error: ApiError): boolean {
    return error.type === ErrorType.NETWORK && error.status === 0
  }

  static logError(error: ApiError, context?: string): void {
    const logData = {
      code: error.code,
      message: error.message,
      status: error.status,
      type: error.type,
      context,
      timestamp: new Date().toISOString(),
      url: error.originalError?.config?.url,
      method: error.originalError?.config?.method?.toUpperCase(),
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('API Error:', logData)
    }

    // In production, you would send this to your logging service (e.g., Sentry)
    // Example: Sentry.captureException(error.originalError, { extra: logData });
  }
}
