import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import { authService } from '@/services/auth-service'
import type { LoginRequest, LoginResponse, User } from '@/types'

// Mock the auth service
vi.mock('@/services/auth-service', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    changePassword: vi.fn(),
    hasRole: vi.fn(),
  },
}))

describe('AuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const authStore = useAuthStore()

      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.expiresAt).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('Login', () => {
    it('should login successfully', async () => {
      const authStore = useAuthStore()
      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'User',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockLoginResponse: LoginResponse = {
        token: 'mock-jwt-token',
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        user: mockUser,
      }

      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123',
      }

      vi.mocked(authService.login).mockResolvedValue(mockLoginResponse)

      const result = await authStore.login(credentials)

      expect(authService.login).toHaveBeenCalledWith(credentials)
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe('mock-jwt-token')
      expect(authStore.expiresAt).toBe(mockLoginResponse.expires_at)
      expect(authStore.isAuthenticated).toBe(true)
      expect(result).toEqual(mockLoginResponse)
    })

    it('should handle login failure and clear state', async () => {
      const authStore = useAuthStore()
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'wrongpassword',
      }

      const mockError = new Error('Invalid credentials')
      vi.mocked(authService.login).mockRejectedValue(mockError)

      await expect(authStore.login(credentials)).rejects.toThrow('Invalid credentials')

      // State should be cleared on error
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.expiresAt).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should clear partial state on login error', async () => {
      const authStore = useAuthStore()

      // Set some initial state
      authStore.user = {
        id: '1',
        username: 'olduser',
        email: 'old@example.com',
        role: 'User',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      authStore.token = 'old-token'
      authStore.expiresAt = new Date(Date.now() + 3600000).toISOString()

      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'wrongpassword',
      }

      vi.mocked(authService.login).mockRejectedValue(new Error('Login failed'))

      await expect(authStore.login(credentials)).rejects.toThrow('Login failed')

      // All state should be cleared
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.expiresAt).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const authStore = useAuthStore()

      // Set some initial state
      authStore.user = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'User',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      authStore.token = 'mock-token'
      authStore.expiresAt = new Date(Date.now() + 3600000).toISOString()

      vi.mocked(authService.logout).mockResolvedValue()

      await authStore.logout()

      expect(authService.logout).toHaveBeenCalled()
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.expiresAt).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should clear state even if logout API fails', async () => {
      const authStore = useAuthStore()

      // Set some initial state
      authStore.user = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'User',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      authStore.token = 'mock-token'
      authStore.expiresAt = new Date(Date.now() + 3600000).toISOString()

      vi.mocked(authService.logout).mockRejectedValue(new Error('Logout API failed'))

      // Mock console.warn to avoid noise in test output
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // The logout function should handle errors gracefully and not throw
      await authStore.logout()

      expect(authService.logout).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('Logout API call failed:', expect.any(Error))

      // State should still be cleared even if API fails
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.expiresAt).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)

      consoleSpy.mockRestore()
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user and update store', async () => {
      const authStore = useAuthStore()
      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'Administrator',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      const result = await authStore.getCurrentUser()

      expect(authService.getCurrentUser).toHaveBeenCalled()
      expect(authStore.user).toEqual(mockUser)
      expect(result).toEqual(mockUser)
    })

    it('should handle getCurrentUser failure', async () => {
      const authStore = useAuthStore()
      const mockError = new Error('Unauthorized')

      vi.mocked(authService.getCurrentUser).mockRejectedValue(mockError)

      await expect(authStore.getCurrentUser()).rejects.toThrow('Unauthorized')
      expect(authStore.user).toBeNull()
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const authStore = useAuthStore()
      const changePasswordRequest = {
        current_password: 'oldpassword',
        new_password: 'newpassword123',
      }

      vi.mocked(authService.changePassword).mockResolvedValue()

      await authStore.changePassword(changePasswordRequest)

      expect(authService.changePassword).toHaveBeenCalledWith(changePasswordRequest)
    })

    it('should handle change password failure', async () => {
      const authStore = useAuthStore()
      const changePasswordRequest = {
        current_password: 'wrongpassword',
        new_password: 'newpassword123',
      }
      const mockError = new Error('Current password is incorrect')

      vi.mocked(authService.changePassword).mockRejectedValue(mockError)

      await expect(authStore.changePassword(changePasswordRequest)).rejects.toThrow(
        'Current password is incorrect',
      )
    })
  })

  describe('Role Checking', () => {
    it('should return false when no user is logged in', () => {
      const authStore = useAuthStore()

      expect(authStore.hasRole('User')).toBe(false)
      expect(authStore.hasRole('Administrator')).toBe(false)
      expect(authStore.hasRole('Commenter')).toBe(false)
    })

    it('should check user roles correctly when user is logged in', () => {
      const authStore = useAuthStore()

      // Set user
      authStore.user = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'Administrator',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      vi.mocked(authService.hasRole).mockReturnValue(true)

      expect(authStore.hasRole('User')).toBe(true)
      expect(authService.hasRole).toHaveBeenCalledWith('Administrator', 'User')
    })

    it('should handle different role levels', () => {
      const authStore = useAuthStore()

      authStore.user = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'User',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      // Mock different role check results
      vi.mocked(authService.hasRole)
        .mockReturnValueOnce(true) // User has User role
        .mockReturnValueOnce(false) // User doesn't have Administrator role

      expect(authStore.hasRole('User')).toBe(true)
      expect(authStore.hasRole('Administrator')).toBe(false)
    })
  })

  describe('Token Expiry', () => {
    it('should return false when no expiry date is set', () => {
      const authStore = useAuthStore()

      expect(authStore.checkTokenExpiry()).toBe(false)
    })

    it('should return true for valid (non-expired) token', () => {
      const authStore = useAuthStore()

      // Set token that expires in 1 hour
      authStore.expiresAt = new Date(Date.now() + 3600000).toISOString()

      expect(authStore.checkTokenExpiry()).toBe(true)
    })

    it('should return false for expired token', () => {
      const authStore = useAuthStore()

      // Set token that expired 1 hour ago
      authStore.expiresAt = new Date(Date.now() - 3600000).toISOString()

      expect(authStore.checkTokenExpiry()).toBe(false)
    })
  })

  describe('isAuthenticated computed', () => {
    it('should return false when no token or expiry', () => {
      const authStore = useAuthStore()

      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should return false when token exists but no expiry', () => {
      const authStore = useAuthStore()
      authStore.token = 'some-token'

      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should return false when expiry exists but no token', () => {
      const authStore = useAuthStore()
      authStore.expiresAt = new Date(Date.now() + 3600000).toISOString()

      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should return true when both token and valid expiry exist', () => {
      const authStore = useAuthStore()
      authStore.token = 'some-token'
      authStore.expiresAt = new Date(Date.now() + 3600000).toISOString()

      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should return false when token exists but is expired', () => {
      const authStore = useAuthStore()
      authStore.token = 'some-token'
      authStore.expiresAt = new Date(Date.now() - 3600000).toISOString()

      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('initializeAuth', () => {
    it('should initialize auth from valid localStorage data', () => {
      const mockAuthData = {
        token: 'stored-token',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      }

      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'User',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      // Mock localStorage
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockAuthData))
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      const authStore = useAuthStore()
      authStore.initializeAuth()

      expect(localStorage.getItem).toHaveBeenCalledWith('auth')
      expect(authStore.token).toBe('stored-token')
      expect(authStore.expiresAt).toBe(mockAuthData.expires_at)
    })

    it('should handle invalid JSON in localStorage', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid-json')

      const authStore = useAuthStore()

      // Mock console.warn to avoid noise in test output
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      authStore.initializeAuth()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to initialize auth from localStorage:',
        expect.any(SyntaxError),
      )

      // State should be cleared
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.expiresAt).toBeNull()

      consoleSpy.mockRestore()
    })

    it('should handle expired token in localStorage', async () => {
      const expiredAuthData = {
        token: 'expired-token',
        expires_at: new Date(Date.now() - 3600000).toISOString(), // Expired 1 hour ago
      }

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(expiredAuthData))
      vi.mocked(authService.logout).mockResolvedValue()

      const authStore = useAuthStore()

      authStore.initializeAuth()

      // Wait for async logout to complete
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Should clear expired token
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.expiresAt).toBeNull()
    })

    it('should handle getCurrentUser failure during initialization', async () => {
      const mockAuthData = {
        token: 'stored-token',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      }

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockAuthData))
      vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Unauthorized'))

      const authStore = useAuthStore()

      authStore.initializeAuth()

      // Wait for the async getCurrentUser call to complete
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Should have cleared auth data after getCurrentUser failure
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.expiresAt).toBeNull()
    })

    it('should handle missing localStorage data', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)

      const authStore = useAuthStore()
      authStore.initializeAuth()

      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.expiresAt).toBeNull()
    })
  })
})
