import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEntitiesStore } from '../entities'
import { userStoryService } from '@/services'
import type { UserStoryListResponse, UserStory } from '@/types'

// Mock the user story service
vi.mock('@/services', () => ({
  userStoryService: {
    list: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('EntitiesStore User Stories', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('User Stories Pagination', () => {
    it('should initialize with default pagination state', () => {
      const store = useEntitiesStore()

      expect(store.userStoriesPagination).toEqual({
        page: 1,
        pageSize: 25,
        totalCount: 0,
      })
    })

    it('should update pagination state from API response', async () => {
      const store = useEntitiesStore()
      const mockResponse: UserStoryListResponse = {
        data: [
          {
            id: '1',
            reference_id: 'US-001',
            title: 'Test User Story',
            status: 'Draft',
            priority: 1,
            epic_id: 'epic1',
            creator_id: 'user1',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          } as UserStory,
        ],
        total_count: 50,
        limit: 25,
        offset: 0,
      }

      vi.mocked(userStoryService.list).mockResolvedValue(mockResponse)

      await store.fetchUserStories()

      expect(store.userStoriesPagination.totalCount).toBe(50)
      expect(store.userStoriesPagination.pageSize).toBe(25)
      expect(store.userStoriesPagination.page).toBe(1)
    })

    it('should calculate correct offset for API requests', async () => {
      const store = useEntitiesStore()
      const mockResponse: UserStoryListResponse = {
        data: [],
        total_count: 50,
        limit: 25,
        offset: 25,
      }

      vi.mocked(userStoryService.list).mockResolvedValue(mockResponse)

      // Set page to 2
      store.setUserStoriesPage(2)
      await store.fetchUserStories()

      expect(vi.mocked(userStoryService.list)).toHaveBeenCalledWith({
        limit: 25,
        offset: 25,
      })
    })
  })

  describe('User Stories Filters', () => {
    it('should initialize with empty filters', () => {
      const store = useEntitiesStore()

      expect(store.userStoriesFilters).toEqual({})
      expect(store.userStoriesSearch).toBe('')
    })

    it('should set filters and reset page to 1', () => {
      const store = useEntitiesStore()

      // Set page to 3 first
      store.setUserStoriesPage(3)
      expect(store.userStoriesPagination.page).toBe(3)

      // Set filters should reset page to 1
      store.setUserStoriesFilters({
        status: 'In Progress',
        priority: 1,
        epic_id: 'epic1',
      })

      expect(store.userStoriesFilters).toEqual({
        status: 'In Progress',
        priority: 1,
        epic_id: 'epic1',
      })
      expect(store.userStoriesPagination.page).toBe(1)
    })

    it('should clear filters and reset page to 1', () => {
      const store = useEntitiesStore()

      // Set some filters and page
      store.setUserStoriesFilters({ status: 'Done' })
      store.setUserStoriesPage(2)

      // Clear filters
      store.clearUserStoriesFilters()

      expect(store.userStoriesFilters).toEqual({})
      expect(store.userStoriesPagination.page).toBe(1)
    })

    it('should set search and reset page to 1', () => {
      const store = useEntitiesStore()

      // Set page to 2 first
      store.setUserStoriesPage(2)
      expect(store.userStoriesPagination.page).toBe(2)

      // Set search should reset page to 1
      store.setUserStoriesSearch('test search')

      expect(store.userStoriesSearch).toBe('test search')
      expect(store.userStoriesPagination.page).toBe(1)
    })

    it('should apply filters and search in API requests', async () => {
      const store = useEntitiesStore()
      const mockResponse: UserStoryListResponse = {
        data: [],
        total_count: 0,
        limit: 25,
        offset: 0,
      }

      vi.mocked(userStoryService.list).mockResolvedValue(mockResponse)

      // Set filters and search
      store.setUserStoriesFilters({
        status: 'In Progress',
        priority: 2,
        epic_id: 'epic1',
      })
      store.setUserStoriesSearch('authentication')

      await store.fetchUserStories()

      expect(vi.mocked(userStoryService.list)).toHaveBeenCalledWith({
        limit: 25,
        offset: 0,
        status: 'In Progress',
        priority: 2,
        epic_id: 'epic1',
        search: 'authentication',
      })
    })
  })

  describe('User Stories CRUD Operations', () => {
    it('should update total count after creating user story', async () => {
      const store = useEntitiesStore()
      const mockUserStory: UserStory = {
        id: '1',
        reference_id: 'US-001',
        title: 'New User Story',
        status: 'Draft',
        priority: 1,
        epic_id: 'epic1',
        creator_id: 'user1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      }

      vi.mocked(userStoryService.create).mockResolvedValue(mockUserStory)

      // Set initial total count
      store.userStoriesPagination.totalCount = 10

      await store.createUserStory({
        title: 'New User Story',
        priority: 1,
        epic_id: 'epic1',
      })

      expect(store.userStoriesPagination.totalCount).toBe(11)
      expect(store.userStories.has('1')).toBe(true)
    })

    it('should update total count after deleting user story', async () => {
      const store = useEntitiesStore()

      // Add a user story to the store
      const mockUserStory: UserStory = {
        id: '1',
        reference_id: 'US-001',
        title: 'Test User Story',
        status: 'Draft',
        priority: 1,
        epic_id: 'epic1',
        creator_id: 'user1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      }
      store.userStories.set('1', mockUserStory)
      store.userStoriesPagination.totalCount = 10

      vi.mocked(userStoryService.delete).mockResolvedValue(undefined)

      await store.deleteUserStory('1')

      expect(store.userStoriesPagination.totalCount).toBe(9)
      expect(store.userStories.has('1')).toBe(false)
    })
  })

  describe('Reset Functions', () => {
    it('should reset both filters and search', () => {
      const store = useEntitiesStore()

      // Set filters, search, and page
      store.setUserStoriesFilters({ status: 'Done' })
      store.setUserStoriesSearch('test')
      store.setUserStoriesPage(3)

      // Reset everything
      store.resetUserStoriesFiltersAndSearch()

      expect(store.userStoriesFilters).toEqual({})
      expect(store.userStoriesSearch).toBe('')
      expect(store.userStoriesPagination.page).toBe(1)
    })
  })
})
