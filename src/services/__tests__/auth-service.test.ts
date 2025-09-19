import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '../auth-service'
import { httpClient } from '../http-client'
import type { LoginRequest, LoginResponse, User, UserRole, ChangePasswordRequest } from '@/types'

// Mock the http client
vi.mock('../http-client', () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    setAuthToken: vi.fn(),
    clearAuthToken: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService()
    vi.clearAllMocks()
  })

  describe('Login', () => {
    it('should login successfully and store token', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123',
      }

      const mockResponse: LoginResponse = {
        token: 'jwt-token',
        expires_at: '2024-12-31T23:59:59Z',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'User',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      }

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse)

      const result = await authService.login(credentials)

      expect(httpClient.post).toHaveBeenCalledWith('/auth/login', credentials)
      expect(httpClient.setAuthToken).toHaveBeenCalledWith('jwt-token', '2024-12-31T23:59:59Z')
      expect(result).toEqual(mockResponse)
    })

    it('should not store token if login response is incomplete', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123',
      }

      const mockResponse = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'User',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        // Missing token and expires_at
      }

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse)

      const result = await authService.login(credentials)

      expect(httpClient.post).toHaveBeenCalledWith('/auth/login', credentials)
      expect(httpClient.setAuthToken).not.toHaveBeenCalled()
      expect(result).toEqual(mockResponse)
    })

    it('should handle login failure', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'wrongpassword',
      }

      const mockError = new Error('Invalid credentials')
      vi.mocked(httpClient.post).mockRejectedValue(mockError)

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials')
      expect(httpClient.setAuthToken).not.toHaveBeenCalled()
    })
  })

  describe('Logout', () => {
    it('should logout successfully and clear token', async () => {
      vi.mocked(httpClient.post).mockResolvedValue(undefined)

      await authService.logout()

      expect(httpClient.post).toHaveBeenCalledWith('/auth/logout')
      expect(httpClient.clearAuthToken).toHaveBeenCalled()
    })

    it('should clear token even if logout API fails', async () => {
      const mockError = new Error('Logout API failed')
      vi.mocked(httpClient.post).mockRejectedValue(mockError)

      // Should not throw error
      await authService.logout()

      expect(httpClient.post).toHaveBeenCalledWith('/auth/logout')
      expect(httpClient.clearAuthToken).toHaveBeenCalled()
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'Administrator',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      vi.mocked(httpClient.get).mockResolvedValue(mockUser)

      const result = await authService.getCurrentUser()

      expect(httpClient.get).toHaveBeenCalledWith('/auth/profile')
      expect(result).toEqual(mockUser)
    })

    it('should handle getCurrentUser failure', async () => {
      const mockError = new Error('Unauthorized')
      vi.mocked(httpClient.get).mockRejectedValue(mockError)

      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized')
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const request: ChangePasswordRequest = {
        current_password: 'oldpassword',
        new_password: 'newpassword123',
      }

      vi.mocked(httpClient.post).mockResolvedValue(undefined)

      await authService.changePassword(request)

      expect(httpClient.post).toHaveBeenCalledWith('/auth/change-password', request)
    })

    it('should handle change password failure', async () => {
      const request: ChangePasswordRequest = {
        current_password: 'wrongpassword',
        new_password: 'newpassword123',
      }

      const mockError = new Error('Current password is incorrect')
      vi.mocked(httpClient.post).mockRejectedValue(mockError)

      await expect(authService.changePassword(request)).rejects.toThrow(
        'Current password is incorrect',
      )
    })
  })

  describe('User Management (Admin)', () => {
    describe('createUser', () => {
      it('should create user successfully', async () => {
        const userData = {
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'User' as UserRole,
        }

        const mockUser: User = {
          id: '2',
          username: 'newuser',
          email: 'newuser@example.com',
          role: 'User',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }

        vi.mocked(httpClient.post).mockResolvedValue(mockUser)

        const result = await authService.createUser(userData)

        expect(httpClient.post).toHaveBeenCalledWith('/auth/users', userData)
        expect(result).toEqual(mockUser)
      })
    })

    describe('getUsers', () => {
      it('should get users list successfully', async () => {
        const mockUsers: User[] = [
          {
            id: '1',
            username: 'user1',
            email: 'user1@example.com',
            role: 'User',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            username: 'admin',
            email: 'admin@example.com',
            role: 'Administrator',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ]

        vi.mocked(httpClient.get).mockResolvedValue(mockUsers)

        const result = await authService.getUsers()

        expect(httpClient.get).toHaveBeenCalledWith('/auth/users')
        expect(result).toEqual(mockUsers)
      })
    })

    describe('getUser', () => {
      it('should get specific user successfully', async () => {
        const mockUser: User = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'User',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        }

        vi.mocked(httpClient.get).mockResolvedValue(mockUser)

        const result = await authService.getUser('1')

        expect(httpClient.get).toHaveBeenCalledWith('/auth/users/1')
        expect(result).toEqual(mockUser)
      })
    })

    describe('updateUser', () => {
      it('should update user successfully', async () => {
        const userData = {
          username: 'updateduser',
          email: 'updated@example.com',
          role: 'Administrator' as UserRole,
        }

        const mockUser: User = {
          id: '1',
          username: 'updateduser',
          email: 'updated@example.com',
          role: 'Administrator',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        }

        vi.mocked(httpClient.put).mockResolvedValue(mockUser)

        const result = await authService.updateUser('1', userData)

        expect(httpClient.put).toHaveBeenCalledWith('/auth/users/1', userData)
        expect(result).toEqual(mockUser)
      })
    })

    describe('deleteUser', () => {
      it('should delete user successfully', async () => {
        vi.mocked(httpClient.delete).mockResolvedValue(undefined)

        await authService.deleteUser('1')

        expect(httpClient.delete).toHaveBeenCalledWith('/auth/users/1')
      })
    })
  })

  describe('Role Checking', () => {
    it('should check Administrator role correctly', () => {
      expect(authService.hasRole('Administrator', 'Commenter')).toBe(true)
      expect(authService.hasRole('Administrator', 'User')).toBe(true)
      expect(authService.hasRole('Administrator', 'Administrator')).toBe(true)
    })

    it('should check User role correctly', () => {
      expect(authService.hasRole('User', 'Commenter')).toBe(true)
      expect(authService.hasRole('User', 'User')).toBe(true)
      expect(authService.hasRole('User', 'Administrator')).toBe(false)
    })

    it('should check Commenter role correctly', () => {
      expect(authService.hasRole('Commenter', 'Commenter')).toBe(true)
      expect(authService.hasRole('Commenter', 'User')).toBe(false)
      expect(authService.hasRole('Commenter', 'Administrator')).toBe(false)
    })
  })

  describe('Authentication Status', () => {
    it('should return true for valid authentication', () => {
      const authData = {
        token: 'valid-token',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(authData))

      expect(authService.isAuthenticated()).toBe(true)
    })

    it('should return false for expired authentication', () => {
      const authData = {
        token: 'expired-token',
        expires_at: new Date(Date.now() - 3600000).toISOString(),
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(authData))

      expect(authService.isAuthenticated()).toBe(false)
    })

    it('should return false when no auth data', () => {
      localStorageMock.getItem.mockReturnValue(null)

      expect(authService.isAuthenticated()).toBe(false)
    })

    it('should return false for invalid auth data', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')

      expect(authService.isAuthenticated()).toBe(false)
    })

    it('should return false when no expires_at', () => {
      const authData = {
        token: 'token-without-expiry',
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(authData))

      expect(authService.isAuthenticated()).toBe(false)
    })
  })

  describe('getCurrentUserRole', () => {
    it('should return null (not implemented)', () => {
      expect(authService.getCurrentUserRole()).toBeNull()
    })
  })
})
