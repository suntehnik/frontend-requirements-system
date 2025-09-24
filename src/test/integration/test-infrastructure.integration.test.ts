/**
 * Test Infrastructure Validation
 * 
 * Tests the test environment infrastructure components
 */

import { describe, it, expect, beforeAll } from 'vitest'
import {
  loadIntegrationTestConfig,
  validateEnvironmentSetup,
  shouldSkipIntegrationTests,
  logEnvironmentInfo,
  validateBackend,
  TestDataManager
} from '../utils'

describe('Test Infrastructure', () => {
  beforeAll(() => {
    // Skip integration tests in CI environment unless explicitly enabled
    if (shouldSkipIntegrationTests()) {
      console.log('⏭️ Skipping infrastructure tests - environment not configured or CI mode')
      return
    }

    logEnvironmentInfo()
  })

  it.skipIf(shouldSkipIntegrationTests())('should load integration test configuration', () => {
    const config = loadIntegrationTestConfig()
    
    expect(config).toBeDefined()
    expect(config.serverUrl).toBeDefined()
    expect(config.adminUser).toBeDefined()
    expect(config.adminPassword).toBeDefined()
    expect(config.timeout).toBeGreaterThan(0)
    expect(config.retryAttempts).toBeGreaterThan(0)
    expect(typeof config.cleanupAfterTests).toBe('boolean')

    console.log('✅ Configuration loaded successfully')
  })

  it.skipIf(shouldSkipIntegrationTests())('should validate environment setup', () => {
    const isValid = validateEnvironmentSetup()
    expect(isValid).toBe(true)
    console.log('✅ Environment setup is valid')
  })

  it.skipIf(shouldSkipIntegrationTests())('should validate backend availability and authentication', async () => {
    const validation = await validateBackend()
    
    expect(validation).toBeDefined()
    expect(validation.healthCheck).toBeDefined()
    expect(validation.authCheck).toBeDefined()
    
    // Backend should be healthy for integration tests to run
    expect(validation.healthy).toBe(true)
    expect(validation.healthCheck.available).toBe(true)
    expect(validation.authCheck.successful).toBe(true)
    expect(validation.authCheck.token).toBeDefined()

    console.log('✅ Backend validation successful')
  }, 30000) // 30 second timeout for backend validation

  it.skipIf(shouldSkipIntegrationTests())('should initialize test data manager', async () => {
    const validation = await validateBackend()
    
    if (!validation.healthy || !validation.authCheck.token) {
      throw new Error('Backend validation failed - cannot test data manager')
    }

    const config = loadIntegrationTestConfig()
    const testDataManager = new TestDataManager({
      token: validation.authCheck.token,
      baseUrl: config.serverUrl,
      trackCreatedEntities: true
    })

    expect(testDataManager).toBeDefined()
    expect(testDataManager.getCreatedEntities()).toEqual([])

    console.log('✅ Test data manager initialized successfully')
  })
})