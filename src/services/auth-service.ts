import { httpClient } from './http-client'
import type { LoginRequest, LoginResponse, ChangePasswordRequest, User, UserRole } from '@/types'

export class AuthService {
  private baseUrl = '/auth'

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>(`${this.baseUrl}/login`, credentials)

    // Store the token after successful login
    if (response.token && response.expires_at) {
      httpClient.setAuthToken(response.token, response.expires_at)
    }

    return response
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if it exists
      await httpClient.post(`${this.baseUrl}/logout`)
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
    } finally {
      // Always clear local auth data
      httpClient.clearAuthToken()
    }
  }

  async getCurrentUser(): Promise<User> {
    return await httpClient.get<User>(`${this.baseUrl}/profile`)
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await httpClient.post(`${this.baseUrl}/change-password`, request)
  }

  // User management methods (Admin only)
  async createUser(userData: {
    username: string
    email: string
    password: string
    role: UserRole
  }): Promise<User> {
    return await httpClient.post<User>(`${this.baseUrl}/users`, userData)
  }

  async getUsers(): Promise<User[]> {
    return await httpClient.get<User[]>(`${this.baseUrl}/users`)
  }

  async getUser(id: string): Promise<User> {
    return await httpClient.get<User>(`${this.baseUrl}/users/${id}`)
  }

  async updateUser(
    id: string,
    userData: {
      username?: string
      email?: string
      role?: UserRole
    },
  ): Promise<User> {
    return await httpClient.put<User>(`${this.baseUrl}/users/${id}`, userData)
  }

  async deleteUser(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/users/${id}`)
  }

  // Utility methods
  hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      Commenter: 1,
      User: 2,
      Administrator: 3,
    }

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
  }

  isAuthenticated(): boolean {
    const authData = localStorage.getItem('auth')
    if (!authData) return false

    try {
      const parsed = JSON.parse(authData)
      const expiresAt = parsed.expires_at
      if (!expiresAt) return false

      return new Date(expiresAt) > new Date()
    } catch {
      return false
    }
  }

  getCurrentUserRole(): UserRole | null {
    // This would typically come from a decoded JWT or user store
    // For now, return null - this will be implemented when we add user state management
    return null
  }
}

// Export singleton instance
export const authService = new AuthService()
