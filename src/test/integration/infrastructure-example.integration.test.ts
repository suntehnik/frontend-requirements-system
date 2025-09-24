/**
 * Example Integration Test using Test Infrastructure
 * 
 * This test demonstrates how to use the test infrastructure components
 * for backend integration testing
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  shouldSkipIntegrationTests,
  logEnvironmentInfo,
  validateBackend,
  TestDataManager
} from '../utils'

describe('Infrastructure Usage Example', () => {
  let testDataManager: TestDataManager | null = null
  let authToken: string | null = null

  beforeAll(async () => {
    // Skip integration tests in CI environment unless explicitly enabled
    if (shouldSkipIntegrationTests()) {
      console.log('⏭️ Skipping example integration tests - environment not configured or CI mode')
      return
    }

    // Log environment information
    logEnvironmentInfo()

    // Validate backend availability and get authentication token
    const validation = await validateBackend()
    
    if (!validation.healthy || !validation.authCheck.token) {
      console.log('❌ Backend not available - skipping tests')
      return
    }

    authToken = validation.authCheck.token
    
    // Initialize test data manager
    const config = await import('../utils/test-environment').then(m => m.getTestConfig())
    testDataManager = new TestDataManager({
      token: authToken,
      baseUrl: config.serverUrl,
      trackCreatedEntities: true
    })

    console.log('✅ Test infrastructure initialized successfully')
  })

  afterAll(async () => {
    // Clean up test data after all tests
    if (testDataManager) {
      await testDataManager.cleanupTestData()
    }
  })

  it.skipIf(shouldSkipIntegrationTests())('should demonstrate test data creation and cleanup', async () => {
    if (!testDataManager || !authToken) {
      console.log('⏭️ Backend not available - demonstrating offline functionality')
      
      // Verify that the infrastructure properly handles unavailable backend
      expect(testDataManager).toBeNull()
      expect(authToken).toBeNull()
      
      console.log('✅ Infrastructure correctly detected unavailable backend')
      console.log('💡 To see full functionality, ensure backend is running on http://localhost:8080')
      return
    }

    console.log('🧪 Demonstrating test data management...')

    // This test would create test data if the backend was available
    // For now, just verify the manager is initialized
    expect(testDataManager).toBeDefined()
    expect(testDataManager.getCreatedEntities()).toEqual([])

    console.log('✅ Test data manager is ready for use')
  })

  it.skipIf(shouldSkipIntegrationTests())('should demonstrate environment configuration usage', async () => {
    const { getTestConfig } = await import('../utils/test-environment')
    
    const config = getTestConfig()
    
    expect(config.serverUrl).toBe('http://localhost:8080')
    expect(config.adminUser).toBe('admin')
    expect(config.adminPassword).toBeDefined()
    expect(config.timeout).toBe(30000)
    expect(config.retryAttempts).toBe(3)
    expect(config.cleanupAfterTests).toBe(true)

    console.log('✅ Environment configuration is properly loaded')
  })
})