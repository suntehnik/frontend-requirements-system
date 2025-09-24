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
  SERVER_URL?: string
  ADMIN_USER?: string
  ADMIN_PASSWORD?: string
  TEST_TIMEOUT?: string
  TEST_RETRY_ATTEMPTS?: string
  CLEANUP_AFTER_TESTS?: string
}

/**
 * Loads integration test configuration from environment variables
 * Expected to be loaded from .env.integration.local file
 */
export function loadIntegrationTestConfig(): IntegrationTestConfig {
  // Get environment variables (should be loaded from .env.integration.local)
  const env: EnvironmentVariables = {
    SERVER_URL: process.env.SERVER_URL,
    ADMIN_USER: process.env.ADMIN_USER,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    TEST_TIMEOUT: process.env.TEST_TIMEOUT,
    TEST_RETRY_ATTEMPTS: process.env.TEST_RETRY_ATTEMPTS,
    CLEANUP_AFTER_TESTS: process.env.CLEANUP_AFTER_TESTS
  }

  // Validate required environment variables
  const requiredVars = ['SERVER_URL', 'ADMIN_USER', 'ADMIN_PASSWORD']
  const missingVars = requiredVars.filter(varName => !env[varName as keyof EnvironmentVariables])
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please ensure .env.integration.local file is properly configured.'
    )
  }

  // Parse and validate configuration
  const config: IntegrationTestConfig = {
    serverUrl: env.SERVER_URL!,
    adminUser: env.ADMIN_USER!,
    adminPassword: env.ADMIN_PASSWORD!,
    timeout: parseInt(env.TEST_TIMEOUT || '30000', 10),
    retryAttempts: parseInt(env.TEST_RETRY_ATTEMPTS || '3', 10),
    cleanupAfterTests: env.CLEANUP_AFTER_TESTS?.toLowerCase() !== 'false'
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
  if (process.env.CI && !process.env.RUN_INTEGRATION_TESTS) {
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