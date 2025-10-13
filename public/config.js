// Runtime configuration for development
// This file will be overwritten by Docker entrypoint in production
window.APP_CONFIG = {
  API_BASE_URL: 'http://localhost:8080',
  APP_TITLE: 'Requirements Management System (Dev)',
  APP_VERSION: '1.0.0-dev',
  API_VERSION: 'v1'
};