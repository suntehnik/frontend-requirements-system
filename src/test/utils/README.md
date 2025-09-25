# Test Infrastructure Utilities

This directory contains utilities for backend integration testing, implementing the test environment infrastructure as specified in the backend API integration testing requirements.

## Components

### 1. Environment Configuration Loader (`test-environment.ts`)

Loads and validates environment configuration from `.env.integration.local` file.

**Required Environment Variables:**

- `SERVER_URL` - Backend server URL (e.g., `http://localhost:8080`)
- `ADMIN_USER` - Administrator username for authentication
- `ADMIN_PASSWORD` - Administrator password for authentication

**Optional Environment Variables:**

- `TEST_TIMEOUT` - Request timeout in milliseconds (default: 30000)
- `TEST_RETRY_ATTEMPTS` - Number of retry attempts (default: 3)
- `CLEANUP_AFTER_TESTS` - Whether to cleanup test data (default: true)

**Usage:**

```typescript
import { getTestConfig, shouldSkipIntegrationTests } from '../utils'

// Check if tests should be skipped
if (shouldSkipIntegrationTests()) {
  return
}

// Get configuration
const config = getTestConfig()
console.log(`Testing against: ${config.serverUrl}`)
```

### 2. Backend Availability Validator (`backend-validator.ts`)

Validates that the backend API is available and responding correctly before running tests.

**Features:**

- Health check with fallback to root endpoint
- Authentication validation
- API endpoint accessibility validation
- Retry logic with exponential backoff

**Usage:**

```typescript
import { validateBackend, waitForBackend } from '../utils'

// Validate backend is available and authenticate
const validation = await validateBackend()
if (!validation.healthy) {
  throw new Error('Backend not available')
}

// Wait for backend to become available (with retries)
const isAvailable = await waitForBackend()
```

### 3. Test Data Management (`test-data-manager.ts`)

Manages creation and cleanup of test data for integration tests.

**Features:**

- Creates test entities with unique identifiers
- Tracks created entities for cleanup
- Automatic cleanup after tests
- Support for creating complete test hierarchies
- Cleanup of old test data

**Usage:**

```typescript
import { TestDataManager } from '../utils'

const testDataManager = new TestDataManager({
  token: authToken,
  baseUrl: config.serverUrl,
  trackCreatedEntities: true,
})

// Create test data
const epic = await testDataManager.createTestEpic({
  title: 'My Test Epic',
  priority: 1,
})

// Create complete hierarchy
const hierarchy = await testDataManager.createTestHierarchy(requirementTypeId)

// Cleanup (automatic in afterAll hook)
await testDataManager.cleanupTestData()
```

## Setup

### 1. Environment Configuration

Create `.env.integration.local` file in the project root:

```bash
# Backend Server Configuration
SERVER_URL=http://localhost:8080
ADMIN_USER=admin
ADMIN_PASSWORD=your_admin_password

# Test Configuration
TEST_TIMEOUT=30000
TEST_RETRY_ATTEMPTS=3
CLEANUP_AFTER_TESTS=true
```

### 2. Test Structure

Integration tests should follow this pattern:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  shouldSkipIntegrationTests,
  logEnvironmentInfo,
  validateBackend,
  TestDataManager,
} from '../utils'

describe('My Integration Tests', () => {
  let testDataManager: TestDataManager | null = null
  let authToken: string | null = null

  beforeAll(async () => {
    if (shouldSkipIntegrationTests()) {
      console.log('⏭️ Skipping integration tests')
      return
    }

    logEnvironmentInfo()

    const validation = await validateBackend()
    if (!validation.healthy) {
      console.log('❌ Backend not available')
      return
    }

    authToken = validation.authCheck.token
    const config = getTestConfig()
    testDataManager = new TestDataManager({
      token: authToken,
      baseUrl: config.serverUrl,
    })
  })

  afterAll(async () => {
    if (testDataManager) {
      await testDataManager.cleanupTestData()
    }
  })

  it.skipIf(shouldSkipIntegrationTests())('should test something', async () => {
    if (!testDataManager || !authToken) {
      throw new Error('Test infrastructure not initialized')
    }

    // Your test logic here
  })
})
```

## Running Tests

### Local Development

```bash
# Run all integration tests
npm run test -- --run src/test/integration/

# Run specific test file
npm run test -- --run src/test/integration/my-test.integration.test.ts

# Run with verbose output
npm run test -- --run --reporter=verbose src/test/integration/
```

### CI/CD Environment

Integration tests are automatically skipped in CI environments unless `RUN_INTEGRATION_TESTS=true` is set.

```bash
# Enable integration tests in CI
export RUN_INTEGRATION_TESTS=true
npm run test -- --run src/test/integration/
```

## Error Handling

The infrastructure handles various error scenarios:

- **Missing Environment Variables**: Tests are skipped with clear error messages
- **Backend Unavailable**: Tests are skipped, no failures
- **Authentication Failures**: Tests are skipped with error details
- **Network Timeouts**: Automatic retries with exponential backoff
- **Test Data Cleanup Failures**: Logged but don't fail tests

## Best Practices

1. **Always use `shouldSkipIntegrationTests()`** to check if tests should run
2. **Initialize test data manager in `beforeAll`** hook
3. **Clean up test data in `afterAll`** hook
4. **Use unique test data identifiers** to avoid conflicts
5. **Handle backend unavailability gracefully** - don't fail tests
6. **Log meaningful information** for debugging
7. **Use proper TypeScript types** throughout

## Troubleshooting

### Tests Always Skipped

- Check that `.env.integration.local` file exists and has required variables
- Verify backend is running on the specified URL
- Check that `RUN_INTEGRATION_TESTS=true` is set in CI environments

### Authentication Failures

- Verify admin credentials in `.env.integration.local`
- Check that backend authentication endpoint is working
- Ensure user has proper permissions

### Test Data Not Cleaned Up

- Check that `CLEANUP_AFTER_TESTS=true` in environment
- Verify that `afterAll` hook is properly configured
- Check for network issues preventing cleanup requests

### Network Timeouts

- Increase `TEST_TIMEOUT` value in environment
- Check backend performance and availability
- Verify network connectivity to backend server
