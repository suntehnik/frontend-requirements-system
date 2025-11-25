// Runtime configuration that can be set at Docker container startup

interface AppConfig {
  API_BASE_URL: string
  APP_TITLE: string
  APP_VERSION: string
  API_VERSION: string
}

// Default configuration (fallback)
const defaultConfig: AppConfig = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://spexus.msk.avito.ru',
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Requirements Management System',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  API_VERSION: import.meta.env.VITE_API_VERSION || 'v1',
}

// Runtime config loaded from window.APP_CONFIG (set by Docker entrypoint)
declare global {
  interface Window {
    APP_CONFIG?: AppConfig
  }
}

// Get configuration with runtime override support
export function getConfig(): AppConfig {
  // In production Docker container, config.js will set window.APP_CONFIG
  if (typeof window !== 'undefined' && window.APP_CONFIG) {
    return {
      ...defaultConfig,
      ...window.APP_CONFIG,
    }
  }

  // Fallback to build-time environment variables
  return defaultConfig
}

// Export individual config values
export const config = getConfig()

export const API_BASE_URL = config.API_BASE_URL
export const APP_TITLE = config.APP_TITLE
export const APP_VERSION = config.APP_VERSION
export const API_VERSION = config.API_VERSION

// Full API URL helper
export const getApiUrl = (endpoint: string = ''): string => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  const apiPath = `/api/${API_VERSION}`
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  return `${baseUrl}${apiPath}${cleanEndpoint}`
}
