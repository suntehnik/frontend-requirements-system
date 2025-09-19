import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/auth-service'
import type { User, UserRole, LoginRequest, LoginResponse, ChangePasswordRequest } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const expiresAt = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => {
    if (!token.value || !expiresAt.value) return false
    return new Date(expiresAt.value) > new Date()
  })

  // Actions
  async function login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await authService.login(credentials)

      // Update store state
      user.value = response.user
      token.value = response.token
      expiresAt.value = response.expires_at

      // Store in localStorage (already handled by authService/httpClient)
      return response
    } catch (error) {
      // Clear any partial state on error
      user.value = null
      token.value = null
      expiresAt.value = null
      throw error
    }
  }

  async function logout(): Promise<void> {
    try {
      await authService.logout()
    } catch (error) {
      // Log error but don't re-throw - we still want to clear local state
      console.warn('Logout API call failed:', error)
    } finally {
      // Always clear state regardless of API call success
      user.value = null
      token.value = null
      expiresAt.value = null
    }
  }

  async function getCurrentUser(): Promise<User> {
    const currentUser = await authService.getCurrentUser()
    user.value = currentUser
    return currentUser
  }

  async function changePassword(request: ChangePasswordRequest): Promise<void> {
    await authService.changePassword(request)
  }

  function hasRole(requiredRole: UserRole): boolean {
    if (!user.value) return false
    return authService.hasRole(user.value.role, requiredRole)
  }

  function checkTokenExpiry(): boolean {
    if (!expiresAt.value) return false
    return new Date(expiresAt.value) > new Date()
  }

  // Initialize store from localStorage on app start
  function initializeAuth(): void {
    try {
      const authData = localStorage.getItem('auth')
      if (authData) {
        const parsed = JSON.parse(authData)
        if (parsed.token && parsed.expires_at) {
          token.value = parsed.token
          expiresAt.value = parsed.expires_at

          // Check if token is still valid
          if (checkTokenExpiry()) {
            // Try to get current user info
            getCurrentUser().catch(() => {
              // If getting user fails, clear auth data
              logout()
            })
          } else {
            // Token expired, clear auth data
            logout()
          }
        }
      }
    } catch (error) {
      console.warn('Failed to initialize auth from localStorage:', error)
      logout()
    }
  }

  return {
    // State
    user,
    token,
    expiresAt,

    // Computed
    isAuthenticated,

    // Actions
    login,
    logout,
    getCurrentUser,
    changePassword,
    hasRole,
    checkTokenExpiry,
    initializeAuth,
  }
})
