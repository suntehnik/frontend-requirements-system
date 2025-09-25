/**
 * Backend Availability Validator
 *
 * Validates that the backend API is available and responding correctly
 * before running integration tests
 */

import { getTestConfig } from './test-environment'

interface BackendHealthCheck {
  available: boolean
  responseTime: number
  version?: string
  error?: string
}

interface AuthenticationCheck {
  successful: boolean
  token?: string
  error?: string
}

/**
 * Performs a basic health check on the backend API
 */
export async function checkBackendAvailability(): Promise<BackendHealthCheck> {
  const config = getTestConfig()
  const startTime = Date.now()

  try {
    // Try to reach the API health endpoint first, fallback to root if not available
    let response: Response
    try {
      response = await fetch(`${config.serverUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(config.timeout),
      })
    } catch {
      // If health endpoint fails, try the root endpoint
      response = await fetch(`${config.serverUrl}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(config.timeout),
      })
    }

    const responseTime = Date.now() - startTime

    if (response.ok) {
      let version: string | undefined
      try {
        const data = await response.json()
        version = data.version || data.api_version
      } catch {
        // Health endpoint might not return JSON, that's okay
      }

      return {
        available: true,
        responseTime,
        version,
      }
    } else {
      return {
        available: false,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return {
      available: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Attempts to authenticate with the backend using test credentials
 */
export async function checkAuthentication(): Promise<AuthenticationCheck> {
  const config = getTestConfig()

  try {
    const response = await fetch(`${config.serverUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: config.adminUser,
        password: config.adminPassword,
      }),
      signal: AbortSignal.timeout(config.timeout),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        successful: true,
        token: data.token,
      }
    } else {
      const errorText = await response.text().catch(() => 'Unknown error')
      return {
        successful: false,
        error: `Authentication failed: HTTP ${response.status} - ${errorText}`,
      }
    }
  } catch (error) {
    return {
      successful: false,
      error: error instanceof Error ? error.message : 'Unknown authentication error',
    }
  }
}

/**
 * Performs comprehensive backend validation
 */
export async function validateBackend(): Promise<{
  healthy: boolean
  healthCheck: BackendHealthCheck
  authCheck: AuthenticationCheck
}> {
  console.log('🔍 Validating backend availability...')

  const healthCheck = await checkBackendAvailability()
  console.log(
    `   Health check: ${healthCheck.available ? '✅' : '❌'} (${healthCheck.responseTime}ms)`,
  )

  if (healthCheck.error) {
    console.log(`   Error: ${healthCheck.error}`)
  }

  if (healthCheck.version) {
    console.log(`   API Version: ${healthCheck.version}`)
  }

  let authCheck: AuthenticationCheck = { successful: false }

  if (healthCheck.available) {
    console.log('🔐 Validating authentication...')
    authCheck = await checkAuthentication()
    console.log(`   Authentication: ${authCheck.successful ? '✅' : '❌'}`)

    if (authCheck.error) {
      console.log(`   Error: ${authCheck.error}`)
    }
  } else {
    console.log('⏭️ Skipping authentication check (backend not available)')
  }

  const healthy = healthCheck.available && authCheck.successful

  if (healthy) {
    console.log('✅ Backend validation successful')
  } else {
    console.log('❌ Backend validation failed')
  }

  return {
    healthy,
    healthCheck,
    authCheck,
  }
}

/**
 * Waits for backend to become available with retry logic
 */
export async function waitForBackend(maxAttempts?: number): Promise<boolean> {
  const config = getTestConfig()
  const attempts = maxAttempts || config.retryAttempts

  console.log(`⏳ Waiting for backend to become available (max ${attempts} attempts)...`)

  for (let attempt = 1; attempt <= attempts; attempt++) {
    console.log(`   Attempt ${attempt}/${attempts}`)

    const healthCheck = await checkBackendAvailability()

    if (healthCheck.available) {
      console.log('✅ Backend is now available')
      return true
    }

    if (attempt < attempts) {
      const delay = Math.min(1000 * attempt, 5000) // Exponential backoff, max 5s
      console.log(`   Waiting ${delay}ms before next attempt...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  console.log('❌ Backend did not become available within the timeout period')
  return false
}

/**
 * Validates specific API endpoints are accessible
 */
export async function validateApiEndpoints(token: string): Promise<{
  accessible: boolean
  results: Array<{ endpoint: string; status: number; accessible: boolean }>
}> {
  const config = getTestConfig()
  const baseUrl = `${config.serverUrl}/api/v1`

  const endpoints = [
    '/epics',
    '/user-stories',
    '/acceptance-criteria',
    '/requirements',
    '/search',
    '/hierarchy',
  ]

  console.log('🔍 Validating API endpoints accessibility...')

  const results = []
  let allAccessible = true

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}?limit=1`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(config.timeout),
      })

      const accessible = response.status < 500 // 4xx is okay, 5xx is not
      results.push({
        endpoint,
        status: response.status,
        accessible,
      })

      if (!accessible) {
        allAccessible = false
      }

      console.log(`   ${endpoint}: ${accessible ? '✅' : '❌'} (${response.status})`)
    } catch (error) {
      results.push({
        endpoint,
        status: 0,
        accessible: false,
      })
      allAccessible = false
      console.log(
        `   ${endpoint}: ❌ (${error instanceof Error ? error.message : 'Unknown error'})`,
      )
    }
  }

  return {
    accessible: allAccessible,
    results,
  }
}
