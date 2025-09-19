// Development utility to test authentication flow
// This file should be removed in production

import { useAuthStore } from '@/stores/auth'
import type { LoginRequest } from '@/types'

export const testAuthFlow = async () => {
  const authStore = useAuthStore()

  console.log('🧪 Testing Auth Flow')
  console.log('Initial state:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    token: authStore.token ? '***' : null,
  })

  // Test login with mock credentials
  const testCredentials: LoginRequest = {
    username: 'testuser',
    password: 'password123',
  }

  try {
    console.log('🔐 Attempting login...')
    const response = await authStore.login(testCredentials)
    console.log('✅ Login successful:', {
      user: response.user.username,
      role: response.user.role,
      tokenExists: !!response.token,
      expiresAt: response.expires_at,
    })
  } catch (error) {
    console.log('❌ Login failed:', error)
  }

  console.log('Final state:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user?.username,
    role: authStore.user?.role,
    hasAdminRole: authStore.hasRole('Administrator'),
    hasUserRole: authStore.hasRole('User'),
    hasCommenterRole: authStore.hasRole('Commenter'),
  })
}

// Test role checking
export const testRoleChecking = () => {
  const authStore = useAuthStore()

  console.log('🔒 Testing Role Checking')
  console.log('Current user role:', authStore.user?.role)
  console.log('Has Administrator role:', authStore.hasRole('Administrator'))
  console.log('Has User role:', authStore.hasRole('User'))
  console.log('Has Commenter role:', authStore.hasRole('Commenter'))
}

// Test logout
export const testLogout = async () => {
  const authStore = useAuthStore()

  console.log('🚪 Testing Logout')
  console.log('Before logout - isAuthenticated:', authStore.isAuthenticated)

  try {
    await authStore.logout()
    console.log('✅ Logout successful')
  } catch (error) {
    console.log('❌ Logout failed:', error)
  }

  console.log('After logout - isAuthenticated:', authStore.isAuthenticated)
  console.log('User cleared:', authStore.user === null)
  console.log('Token cleared:', authStore.token === null)
}

// Make functions available in browser console for manual testing
if (import.meta.env.DEV) {
  ;(window as typeof window & { testAuth: unknown }).testAuth = {
    testAuthFlow,
    testRoleChecking,
    testLogout,
  }

  console.log('🛠️ Dev Auth Testing utilities available:')
  console.log('- window.testAuth.testAuthFlow()')
  console.log('- window.testAuth.testRoleChecking()')
  console.log('- window.testAuth.testLogout()')
}
