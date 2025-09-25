/**
 * Test Environment Configuration Loader
 * 
 * Loads and validates environment configuration for integration tests
 * from .env.integration.local file
 */

export interface IntegrationTestConfig {
  serverUrl: string
  adminUser: string
  adminPassword: string
  timeout: number
  retryAttempts: number
  cleanupAfterTests: boolean
}

interface EnvironmentVariables {
  VITE_SERVER_URL?: string
  VITE_ADMIN_USER?: string
  VITE_ADMIN_PASSWORD?: string
  VITE_TEST_TIMEOUT?: string
  VITE_TEST_RETRY_ATTEMPTS?: string
  VITE_CLEANUP_AFTER_TESTS?: string
}

/**
 * Loads integration test configuration from environment variables
 * Expected to be loaded from .env.integration.local file
 */
export function loadIntegrationTestConfig(): IntegrationTestConfig {
  // Get environment variables (should be loaded from .env.integration.local)
  const env: EnvironmentVariables = {
    VITE_SERVER_URL: import.meta.env.VITE_SERVER_URL,
    VITE_ADMIN_USER: import.meta.env.VITE_ADMIN_USER,
    VITE_ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD,
    VITE_TEST_TIMEOUT: import.meta.env.VITE_TEST_TIMEOUT,
    VITE_TEST_RETRY_ATTEMPTS: import.meta.env.VITE_TEST_RETRY_ATTEMPTS,
    VITE_CLEANUP_AFTER_TESTS: import.meta.env.VITE_CLEANUP_AFTER_TESTS
  }

  // Validate required environment variables
  const requiredVars = ['VITE_SERVER_URL', 'VITE_ADMIN_USER', 'VITE_ADMIN_PASSWORD']
  const missingVars = requiredVars.filter(varName => !env[varName as keyof EnvironmentVariables])
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please ensure .env.integration.local file is properly configured.'
    )
  }

  // Parse and validate configuration
  const config: IntegrationTestConfig = {
    serverUrl: env.VITE_SERVER_URL!,
    adminUser: env.VITE_ADMIN_USER!,
    adminPassword: env.VITE_ADMIN_PASSWORD!,
    timeout: parseInt(env.VITE_TEST_TIMEOUT || '30000', 10),
    retryAttempts: parseInt(env.VITE_TEST_RETRY_ATTEMPTS || '3', 10),
    cleanupAfterTests: env.VITE_CLEANUP_AFTER_TESTS?.toLowerCase() !== 'false'
  }

  // Validate server URL format
  try {
    new URL(config.serverUrl)
  } catch {
    throw new Error(`Invalid SERVER_URL format: ${config.serverUrl}`)
  }

  // Validate timeout and retry attempts
  if (config.timeout < 1000 || config.timeout > 300000) {
    throw new Error(`TEST_TIMEOUT must be between 1000 and 300000 ms, got: ${config.timeout}`)
  }

  if (config.retryAttempts < 1 || config.retryAttempts > 10) {
    throw new Error(`TEST_RETRY_ATTEMPTS must be between 1 and 10, got: ${config.retryAttempts}`)
  }

  return config
}

/**
 * Validates that all required environment variables are present
 * without loading the full configuration
 */
export function validateEnvironmentSetup(): boolean {
  try {
    loadIntegrationTestConfig()
    return true
  } catch (error) {
    console.error('Environment validation failed:', error)
    return false
  }
}

/**
 * Gets the current test configuration or throws if not properly configured
 */
export function getTestConfig(): IntegrationTestConfig {
  return loadIntegrationTestConfig()
}

/**
 * Checks if integration tests should be skipped based on environment
 */
export function shouldSkipIntegrationTests(): boolean {
  // Skip in CI environment unless explicitly enabled
  if (process.env.CI && !import.meta.env.VITE_RUN_INTEGRATION_TESTS) {
    return true
  }

  // Skip if environment is not properly configured
  if (!validateEnvironmentSetup()) {
    return true
  }

  return false
}

/**
 * Logs environment configuration (without sensitive data)
 */
export function logEnvironmentInfo(): void {
  try {
    const config = loadIntegrationTestConfig()
    console.log('🔧 Integration Test Environment:')
    console.log(`   Server URL: ${config.serverUrl}`)
    console.log(`   Admin User: ${config.adminUser}`)
    console.log(`   Timeout: ${config.timeout}ms`)
    console.log(`   Retry Attempts: ${config.retryAttempts}`)
    console.log(`   Cleanup After Tests: ${config.cleanupAfterTests}`)
  } catch (error) {
    console.error('❌ Environment configuration error:', error)
  }
}