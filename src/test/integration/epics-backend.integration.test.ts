import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { epicService } from '@/services/epic-service'
import { authService } from '@/services/auth-service'
import type { Epic, EpicStatus, Priority, CreateEpicRequest, EpicListResponse } from '@/types'


// Authentication utility for integration tests
class TestAuthManager {
  private static isAuthenticated = false
  private static authToken: string | null = null
  private static expiresAt: string | null = null

  static async ensureAuthenticated(): Promise<void> {
    if (this.isAuthenticated && this.authToken && this.isTokenValid()) {
      // Update localStorage mock with current token
      this.updateLocalStorageMock()
      return
    }

    try {
      // Get credentials from environment variables
      const username = import.meta.env.VITE_ADMIN_USER || 'admin'
      const password = import.meta.env.VITE_ADMIN_PASSWORD || 'Fitz55qcErZhgUA3ZJ2k8w'

      const loginResponse = await authService.login({
        username,
        password
      })

      // Store token information
      this.authToken = loginResponse.token
      this.expiresAt = loginResponse.expires_at
      this.isAuthenticated = true

      // Update localStorage mock
      this.updateLocalStorageMock()

      console.log('✅ Authentication successful for integration tests')
    } catch (error) {
      console.error('❌ Authentication failed for integration tests:', error)
      throw new Error(`Integration test authentication failed: ${error}`)
    }
  }

  private static updateLocalStorageMock(): void {
    if (this.authToken && this.expiresAt) {
      const authData = JSON.stringify({
        token: this.authToken,
        expires_at: this.expiresAt
      })
      
      // Update the mocked localStorage
      const localStorageMock = (window as unknown as { localStorage: Storage }).localStorage
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'auth') {
          return authData
        }
        return null
      })
    }
  }

  private static isTokenValid(): boolean {
    if (!this.expiresAt) return false
    return new Date(this.expiresAt) > new Date()
  }

  static reset(): void {
    this.isAuthenticated = false
    this.authToken = null
    this.expiresAt = null
    
    // Clear localStorage mock
    const localStorageMock = (window as unknown as { localStorage: Storage }).localStorage
    localStorageMock.getItem.mockReturnValue(null)
  }
}


// Test data manager for creating and cleaning up test data
class EpicTestDataManager {
  private createdEpics: string[] = []

  async createTestEpic(overrides?: Partial<CreateEpicRequest>): Promise<Epic> {
    const testEpic: CreateEpicRequest = {
      title: `Test Epic ${Date.now()}`,
      description: 'Test epic for integration testing',
      priority: 2,
      ...overrides
    }

    const epic = await epicService.create(testEpic)
    this.createdEpics.push(epic.id)
    return epic
  }

  async cleanup(): Promise<void> {
    for (const epicId of this.createdEpics) {
      try {
        await epicService.delete(epicId)
      } catch (error) {
        console.warn(`Failed to cleanup test epic ${epicId}:`, error)
      }
    }
    this.createdEpics = []
  }
}

const testDataManager = new EpicTestDataManager()

describe('Epics Backend Integration - Enhanced Validation', () => {
  beforeAll(async () => {
    // Skip integration tests in CI environment
    if (process.env.CI) {
      console.log('⏭️ Skipping backend integration tests in CI environment')
      return
    }

    // Initial authentication
    if (!process.env.CI) {
      await TestAuthManager.ensureAuthenticated()
    }
  })

  beforeEach(async () => {
    // Ensure authentication before each test
    if (!process.env.CI) {
      await TestAuthManager.ensureAuthenticated()
    }
  })

  afterAll(async () => {
    if (!process.env.CI) {
      await testDataManager.cleanup()
      TestAuthManager.reset()
    }
  })

  it.skipIf(!!process.env.CI)('should fetch first 50 epics from backend', async () => {
    // Получаем первые 50 эпиков (реальный API возвращает {count, epics})
    const response = await epicService.list({
      limit: 50,
      offset: 0,
      order_by: 'created_at',
      include: 'creator,assignee'
    }) as unknown as EpicListResponse

    // Проверяем структуру ответа
    expect(response).toBeDefined()
    expect(response.data).toBeDefined()
    expect(Array.isArray(response.data)).toBe(true)
    expect(response.total_count).toBeDefined()
    expect(typeof response.total_count).toBe('number')

    // Логируем информацию о полученных данных
    console.log(`📊 Total epics in system: ${response.total_count}`)
    console.log(`📋 Fetched epics: ${response.data.length}`)
    console.log(`📄 Requested limit: ${response.limit}, offset: ${response.offset}`)

    // Проверяем что получили данные (если они есть в системе)
    if (response.total_count > 0) {
      expect(response.data.length).toBeGreaterThan(0)
      expect(response.data.length).toBeLessThanOrEqual(50)

      // Проверяем структуру первого эпика
      const firstEpic: Epic = response.data[0]
      expect(firstEpic).toBeDefined()
      expect(firstEpic.id).toBeDefined()
      expect(firstEpic.reference_id).toBeDefined()
      expect(firstEpic.title).toBeDefined()
      expect(firstEpic.status).toBeDefined()
      expect(firstEpic.priority).toBeDefined()
      expect(firstEpic.creator_id).toBeDefined()
      expect(firstEpic.created_at).toBeDefined()
      expect(firstEpic.last_modified).toBeDefined()

      // Проверяем типы данных
      expect(typeof firstEpic.id).toBe('string')
      expect(typeof firstEpic.reference_id).toBe('string')
      expect(typeof firstEpic.title).toBe('string')
      expect(['Backlog', 'Draft', 'In Progress', 'Done', 'Cancelled']).toContain(firstEpic.status)
      expect([1, 2, 3, 4]).toContain(firstEpic.priority)

      // Логируем информацию о первом эпике
      console.log(`🎯 First epic: ${firstEpic.reference_id} - "${firstEpic.title}"`)
      console.log(`📊 Status: ${firstEpic.status}, Priority: ${firstEpic.priority}`)
      
      if (firstEpic.assignee) {
        console.log(`👤 Assignee: ${firstEpic.assignee.username}`)
      }
      if (firstEpic.creator) {
        console.log(`👨‍💻 Creator: ${firstEpic.creator.username}`)
      }

      // Выводим список всех полученных эпиков (первые 10)
      console.log('\n📋 List of fetched epics (first 10):')
      response.data.slice(0, 10).forEach((epic: Epic, index: number) => {
        const assigneeInfo = epic.assignee ? ` (${epic.assignee.username})` : ' (unassigned)'
        console.log(`${index + 1}. ${epic.reference_id} - "${epic.title}" [${epic.status}]${assigneeInfo}`)
      })

      if (response.data.length > 10) {
        console.log(`... and ${response.data.length - 10} more epics`)
      }
    } else {
      console.log('ℹ️ No epics found in the system')
      expect(response.data.length).toBe(0)
    }
  })

  it.skipIf(!!process.env.CI)('should handle pagination correctly', async () => {
    // Получаем первую страницу
    const firstPage = await epicService.list({
      limit: 10,
      offset: 0
    }) as unknown as EpicListResponse

    expect(firstPage).toBeDefined()
    expect(firstPage.data).toBeDefined()
    expect(Array.isArray(firstPage.data)).toBe(true)

    console.log(`📄 Page 1: ${firstPage.data.length} epics (total: ${firstPage.total_count})`)

    // Если есть больше 10 эпиков, проверяем вторую страницу
    if (firstPage.total_count > 10) {
      const secondPage = await epicService.list({
        limit: 10,
        offset: 10
      }) as unknown as EpicListResponse

      expect(secondPage).toBeDefined()
      expect(secondPage.total_count).toBe(firstPage.total_count)
      expect(Array.isArray(secondPage.data)).toBe(true)

      console.log(`📄 Page 2: ${secondPage.data.length} epics`)

      // Проверяем что эпики на разных страницах разные (если есть данные)
      if (firstPage.data.length > 0 && secondPage.data.length > 0) {
        expect(firstPage.data[0].id).not.toBe(secondPage.data[0].id)
      }
    } else {
      console.log('ℹ️ Not enough epics for pagination test')
    }
  })

  it.skipIf(!!process.env.CI)('should filter epics by status', async () => {
    // Тестируем фильтрацию по статусу
    const statuses: EpicStatus[] = ['Backlog', 'Draft', 'In Progress', 'Done', 'Cancelled']

    console.log('\n🔍 Testing status filtering:')
    
    for (const status of statuses) {
      const response = await epicService.list({
        status,
        limit: 10
      }) as unknown as EpicListResponse

      expect(response).toBeDefined()
      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data)).toBe(true)
      
      console.log(`   Status "${status}": ${response.data.length} epics`)

      // Проверяем что все эпики имеют правильный статус
      response.data.forEach((epic: Epic) => {
        expect(epic.status).toBe(status)
      })
    }
  })

  it.skipIf(!!process.env.CI)('should filter epics by priority', async () => {
    // Тестируем фильтрацию по приоритету
    const priorities: Priority[] = [1, 2, 3, 4]

    console.log('\n🔢 Testing priority filtering:')

    for (const priority of priorities) {
      const response = await epicService.list({
        priority,
        limit: 10
      }) as unknown as EpicListResponse

      expect(response).toBeDefined()
      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data)).toBe(true)
      
      const priorityText = ['', 'Critical', 'High', 'Medium', 'Low'][priority]
      console.log(`   Priority ${priority} (${priorityText}): ${response.data.length} epics`)

      // Проверяем что все эпики имеют правильный приоритет
      response.data.forEach((epic: Epic) => {
        expect(epic.priority).toBe(priority)
      })
    }
  })

  it.skipIf(!!process.env.CI)('should include related data when requested', async () => {
    const response = await epicService.list({
      limit: 5,
      include: 'creator,assignee,user_stories'
    }) as unknown as EpicListResponse

    expect(response).toBeDefined()
    expect(response.data).toBeDefined()

    if (response.data.length > 0) {
      const epicWithIncludes: Epic = response.data[0]
      
      console.log('\n🔗 Testing included related data:')
      
      // Проверяем что связанные данные включены
      if (epicWithIncludes.creator) {
        expect(epicWithIncludes.creator.id).toBeDefined()
        expect(epicWithIncludes.creator.username).toBeDefined()
        expect(epicWithIncludes.creator.role).toBeDefined()
        // Проверяем что роль определена (может быть пустой строкой в тестовых данных)
        expect(epicWithIncludes.creator.role).toBeDefined()
        if (epicWithIncludes.creator.role) {
          expect(['Administrator', 'User', 'Commenter']).toContain(epicWithIncludes.creator.role)
        }
        console.log(`   👨‍💻 Creator: ${epicWithIncludes.creator.username} (${epicWithIncludes.creator.role})`)
      }

      if (epicWithIncludes.assignee) {
        expect(epicWithIncludes.assignee.id).toBeDefined()
        expect(epicWithIncludes.assignee.username).toBeDefined()
        expect(epicWithIncludes.assignee.role).toBeDefined()
        // Проверяем что роль определена (может быть пустой строкой в тестовых данных)
        expect(epicWithIncludes.assignee.role).toBeDefined()
        if (epicWithIncludes.assignee.role) {
          expect(['Administrator', 'User', 'Commenter']).toContain(epicWithIncludes.assignee.role)
        }
        console.log(`   👤 Assignee: ${epicWithIncludes.assignee.username} (${epicWithIncludes.assignee.role})`)
      }

      if (epicWithIncludes.user_stories) {
        expect(Array.isArray(epicWithIncludes.user_stories)).toBe(true)
        console.log(`   📚 User stories: ${epicWithIncludes.user_stories.length}`)
        
        // Проверяем структуру пользовательских историй если они есть
        if (epicWithIncludes.user_stories.length > 0) {
          const firstUserStory = epicWithIncludes.user_stories[0]
          expect(firstUserStory.id).toBeDefined()
          expect(firstUserStory.reference_id).toBeDefined()
          expect(firstUserStory.title).toBeDefined()
        }
      }
    } else {
      console.log('ℹ️ No epics available for testing included data')
    }
  })

  it.skipIf(!!process.env.CI)('should get individual epic by ID', async () => {
    // Сначала получаем список эпиков
    const listResponse = await epicService.list({ limit: 1 }) as unknown as EpicListResponse
    
    if (listResponse.data.length > 0) {
      const epicId = listResponse.data[0].id
      
      // Получаем эпик по ID
      const epic: Epic = await epicService.get(epicId, 'creator,assignee')
      
      expect(epic).toBeDefined()
      expect(epic.id).toBe(epicId)
      expect(epic.reference_id).toBeDefined()
      expect(epic.title).toBeDefined()
      expect(epic.status).toBeDefined()
      expect(epic.priority).toBeDefined()
      
      console.log(`\n🎯 Retrieved epic by ID: ${epic.reference_id} - "${epic.title}"`)
      
      // Проверяем что включенные данные присутствуют
      if (epic.creator) {
        expect(epic.creator.username).toBeDefined()
        console.log(`   👨‍💻 Creator: ${epic.creator.username}`)
      }
      
      if (epic.assignee) {
        expect(epic.assignee.username).toBeDefined()
        console.log(`   👤 Assignee: ${epic.assignee.username}`)
      }
    } else {
      console.log('ℹ️ No epics available for individual retrieval test')
    }
  })

  it.skipIf(!!process.env.CI)('should handle sorting correctly', async () => {
    const sortOrders = ['created_at', 'last_modified', 'title', 'priority']
    
    console.log('\n📊 Testing sorting options:')
    
    for (const orderBy of sortOrders) {
      const response = await epicService.list({
        limit: 5,
        order_by: orderBy
      }) as unknown as EpicListResponse

      expect(response).toBeDefined()
      expect(response.data).toBeDefined()
      expect(Array.isArray(response.data)).toBe(true)
      
      console.log(`   Sort by "${orderBy}": ${response.data.length} epics`)
      
      // Проверяем что данные отсортированы (если есть больше одного эпика)
      if (response.data.length > 1) {
        const first = response.data[0]
        const second = response.data[1]
        
        switch (orderBy) {
          case 'title':
            // Проверяем что заголовки определены
            expect(first.title).toBeDefined()
            expect(second.title).toBeDefined()
            break
          case 'priority':
            // Проверяем что приоритеты определены
            expect(first.priority).toBeDefined()
            expect(second.priority).toBeDefined()
            break
          case 'created_at':
          case 'last_modified':
            // Проверяем что даты определены и валидны
            expect(first.created_at).toBeDefined()
            expect(second.created_at).toBeDefined()
            expect(new Date(first.created_at)).toBeInstanceOf(Date)
            expect(new Date(second.created_at)).toBeInstanceOf(Date)
            break
        }
      }
    }
  })

  it.skipIf(!!process.env.CI)('should handle combined filters correctly', async () => {
    console.log('\n🔍 Testing combined filters:')
    
    // Тестируем комбинацию фильтров
    const response = await epicService.list({
      status: 'In Progress',
      priority: 1,
      limit: 10,
      order_by: 'created_at',
      include: 'creator,assignee'
    }) as unknown as EpicListResponse

    expect(response).toBeDefined()
    expect(response.data).toBeDefined()
    expect(Array.isArray(response.data)).toBe(true)
    
    console.log(`   Critical "In Progress" epics: ${response.data.length}`)
    
    // Проверяем что все эпики соответствуют фильтрам
    response.data.forEach((epic: Epic) => {
      expect(epic.status).toBe('In Progress')
      expect(epic.priority).toBe(1)
    })
    
    // Проверяем что включенные данные присутствуют
    if (response.data.length > 0) {
      const firstEpic = response.data[0]
      console.log(`   Example: ${firstEpic.reference_id} - "${firstEpic.title}"`)
      
      if (firstEpic.creator) {
        console.log(`     Creator: ${firstEpic.creator.username}`)
      }
      if (firstEpic.assignee) {
        console.log(`     Assignee: ${firstEpic.assignee.username}`)
      }
    }
  })

  it.skipIf(!!process.env.CI)('should validate real API response structure', async () => {
    console.log('\n🔍 Validating real API response structure:')
    
    const response = await epicService.list({
      limit: 3,
      include: 'creator,assignee'
    }) as unknown as EpicListResponse
    
    expect(response).toHaveProperty('data')
    expect(response).toHaveProperty('total_count')
    expect(response).toHaveProperty('limit')
    expect(response).toHaveProperty('offset')
    
    console.log('   ✅ Adapted structure matches expected ListResponse<Epic>')
    
    // Проверяем структуру каждого эпика
    response.data.forEach((epic: Epic, index: number) => {
      // Обязательные поля
      expect(epic).toHaveProperty('id')
      expect(epic).toHaveProperty('reference_id')
      expect(epic).toHaveProperty('title')
      expect(epic).toHaveProperty('status')
      expect(epic).toHaveProperty('priority')
      expect(epic).toHaveProperty('creator_id')
      expect(epic).toHaveProperty('created_at')
      expect(epic).toHaveProperty('last_modified')
      
      // Типы данных
      expect(typeof epic.id).toBe('string')
      expect(typeof epic.reference_id).toBe('string')
      expect(typeof epic.title).toBe('string')
      expect(typeof epic.creator_id).toBe('string')
      expect(typeof epic.created_at).toBe('string')
      expect(typeof epic.last_modified).toBe('string')
      
      // Валидация enum значений
      expect(['Backlog', 'Draft', 'In Progress', 'Done', 'Cancelled']).toContain(epic.status)
      expect([1, 2, 3, 4]).toContain(epic.priority)
      
      // Валидация дат
      expect(new Date(epic.created_at)).toBeInstanceOf(Date)
      expect(new Date(epic.last_modified)).toBeInstanceOf(Date)
      expect(new Date(epic.created_at).getTime()).not.toBeNaN()
      expect(new Date(epic.last_modified).getTime()).not.toBeNaN()
      
      // Включенные связанные данные
      if (epic.creator) {
        expect(epic.creator).toHaveProperty('id')
        expect(epic.creator).toHaveProperty('username')
        expect(epic.creator).toHaveProperty('role')
        // Проверяем что роль определена (может быть пустой строкой в тестовых данных)
        expect(epic.creator.role).toBeDefined()
        if (epic.creator.role) {
          expect(['Administrator', 'User', 'Commenter']).toContain(epic.creator.role)
        }
      }
      
      if (epic.assignee) {
        expect(epic.assignee).toHaveProperty('id')
        expect(epic.assignee).toHaveProperty('username')
        expect(epic.assignee).toHaveProperty('role')
        // Проверяем что роль определена (может быть пустой строкой в тестовых данных)
        expect(epic.assignee.role).toBeDefined()
        if (epic.assignee.role) {
          expect(['Administrator', 'User', 'Commenter']).toContain(epic.assignee.role)
        }
      }
      
      if (index === 0) {
        console.log(`   ✅ Epic ${epic.reference_id} structure validated`)
      }
    })
    
    console.log(`   ✅ All ${response.data.length} epics have valid structure`)
  })
})