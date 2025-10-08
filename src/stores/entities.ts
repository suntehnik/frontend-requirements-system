import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  epicService,
  userStoryService,
  requirementService,
  acceptanceCriteriaService,
} from '@/services'
import type {
  Epic,
  UserStory,
  Requirement,
  AcceptanceCriteria,
  EpicListParams,
  UserStoryListParams,
  RequirementListParams,
  CreateEpicRequest,
  CreateUserStoryRequest,
  CreateRequirementRequest,
  UpdateEpicRequest,
  UpdateUserStoryRequest,
  UpdateRequirementRequest,
  UpdateAcceptanceCriteriaRequest,
  PaginationState,
  EpicStatus,
  Priority,
} from '@/types'

// Import component interfaces
import type { UserStoryFilterState } from '@/types/components'

// TypeScript interfaces for user stories store state
export interface UserStoriesStoreState {
  pagination: PaginationState
  filters: UserStoryFilterState
  search: string
}

export const useEntitiesStore = defineStore('entities', () => {
  // State
  const epics = ref<Map<string, Epic>>(new Map())
  const userStories = ref<Map<string, UserStory>>(new Map())
  const requirements = ref<Map<string, Requirement>>(new Map())
  const acceptanceCriteria = ref<Map<string, AcceptanceCriteria>>(new Map())

  // Loading states
  const loading = ref<Record<string, boolean>>({})
  const errors = ref<Record<string, string>>({})

  // Pagination state
  const epicsPagination = ref<PaginationState>({
    page: 1,
    pageSize: 25, // Default page size as specified in requirements
    totalCount: 0,
  })

  const userStoriesPagination = ref<PaginationState>({
    page: 1,
    pageSize: 25, // Default page size as specified in requirements
    totalCount: 0,
  })

  // Filter and search state for user stories
  const userStoriesFilters = ref<UserStoryFilterState>({})

  const userStoriesSearch = ref<string>('')

  // Computed
  const epicsList = computed(() => Array.from(epics.value.values()))
  const userStoriesList = computed(() => Array.from(userStories.value.values()))
  const requirementsList = computed(() => Array.from(requirements.value.values()))
  const acceptanceCriteriaList = computed(() => Array.from(acceptanceCriteria.value.values()))

  // Statistics computed
  const stats = computed(() => {
    const epicsCount = epics.value.size
    const userStoriesCount = userStories.value.size
    const requirementsCount = requirements.value.size

    // Count active tasks (In Progress status)
    const activeEpics = epicsList.value.filter((epic) => epic.status === 'In Progress').length
    const activeUserStories = userStoriesList.value.filter(
      (story) => story.status === 'In Progress',
    ).length
    const activeRequirements = requirementsList.value.filter(
      (req) => req.status === 'Active',
    ).length
    const activeTasks = activeEpics + activeUserStories + activeRequirements

    return {
      epics: epicsCount,
      userStories: userStoriesCount,
      requirements: requirementsCount,
      activeTasks,
    }
  })

  // Recent activity computed (last 10 items sorted by updated_at)
  const recentActivity = computed(() => {
    const allEntities: Array<{
      type: 'epic' | 'user_story' | 'requirement'
      entity: Epic | UserStory | Requirement
      updatedAt: Date
    }> = []

    // Add epics
    epicsList.value.forEach((epic) => {
      allEntities.push({
        type: 'epic',
        entity: epic,
        updatedAt: new Date(epic.updated_at),
      })
    })

    // Add user stories
    userStoriesList.value.forEach((story) => {
      allEntities.push({
        type: 'user_story',
        entity: story,
        updatedAt: new Date(story.updated_at),
      })
    })

    // Add requirements
    requirementsList.value.forEach((req) => {
      allEntities.push({
        type: 'requirement',
        entity: req,
        updatedAt: new Date(req.updated_at),
      })
    })

    // Sort by last modified and take top 10
    return allEntities.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 10)
  })

  // Helper functions
  function setLoading(key: string, value: boolean) {
    loading.value[key] = value
  }

  function setError(key: string, error: string) {
    errors.value[key] = error
  }

  function clearError(key: string) {
    delete errors.value[key]
  }

  // Epic actions
  async function fetchEpics(params?: EpicListParams) {
    const key = 'epics'
    setLoading(key, true)
    clearError(key)

    try {
      // Calculate offset from page number if not provided
      const offset =
        params?.offset ?? (epicsPagination.value.page - 1) * epicsPagination.value.pageSize
      const limit = params?.limit ?? epicsPagination.value.pageSize

      const requestParams = {
        ...params,
        limit,
        offset,
      }

      const response = await epicService.list(requestParams)

      // Debug logging
      console.log('Epics response:', response)

      // Check if response has the expected ListResponse structure
      if (
        response &&
        typeof response === 'object' &&
        'data' in response &&
        Array.isArray(response.data)
      ) {
        // Clear existing epics only for pagination (not accumulation)
        epics.value.clear()

        // Update the map with fetched epics
        response.data.forEach((epic) => {
          epics.value.set(epic.id, epic)
        })

        // Update pagination info from backend response
        epicsPagination.value.totalCount = response.total_count || 0

        // Update page size if provided in response
        if (response.limit) {
          epicsPagination.value.pageSize = response.limit
        }

        // Calculate and update current page from offset
        if (response.offset !== undefined && response.limit && response.limit > 0) {
          epicsPagination.value.page = Math.floor(response.offset / response.limit) + 1
        }
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array (fallback for mock data)
        epics.value.clear()
        response.forEach((epic) => {
          epics.value.set(epic.id, epic)
        })
        // For direct array response, set totalCount to show pagination
        epicsPagination.value.totalCount = response.length
        epicsPagination.value.page = 1
      } else {
        console.warn('Unexpected epics response structure:', response)
        // Handle unexpected response structure
        epics.value.clear()
        epicsPagination.value.totalCount = 0
      }

      return response
    } catch (error) {
      console.error('Error fetching epics:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch epics'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  // Pagination actions for epics
  function setEpicsPage(page: number) {
    epicsPagination.value.page = page
  }

  function setEpicsPageSize(pageSize: number) {
    epicsPagination.value.pageSize = pageSize
    epicsPagination.value.page = 1 // Reset to first page when changing page size
  }

  async function fetchEpic(id: string, include?: string) {
    const key = `epic-${id}`
    setLoading(key, true)
    clearError(key)

    try {
      const epic = await epicService.get(id, include)
      epics.value.set(epic.id, epic)
      return epic
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch epic'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  async function createEpic(request: CreateEpicRequest) {
    const key = 'create-epic'
    setLoading(key, true)
    clearError(key)

    try {
      const epic = await epicService.create(request)
      epics.value.set(epic.id, epic)
      return epic
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create epic'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  async function updateEpic(id: string, request: UpdateEpicRequest) {
    const key = `update-epic-${id}`
    setLoading(key, true)
    clearError(key)

    try {
      const epic = await epicService.update(id, request)
      epics.value.set(epic.id, epic)
      return epic
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update epic'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  async function deleteEpic(id: string) {
    const key = `delete-epic-${id}`
    setLoading(key, true)
    clearError(key)

    try {
      await epicService.delete(id)
      epics.value.delete(id)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete epic'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  // User Story actions
  async function fetchUserStories(params?: UserStoryListParams) {
    const key = 'user-stories'
    setLoading(key, true)
    clearError(key)

    try {
      // Calculate offset from page number if not provided
      const offset =
        params?.offset ??
        (userStoriesPagination.value.page - 1) * userStoriesPagination.value.pageSize
      const limit = params?.limit ?? userStoriesPagination.value.pageSize

      // Merge current filters and search with provided params
      const requestParams: UserStoryListParams = {
        ...params,
        limit,
        offset,
        // Apply current filters if not overridden by params
        status: params?.status ?? userStoriesFilters.value.status,
        priority: params?.priority ?? userStoriesFilters.value.priority,
        epic_id: params?.epic_id ?? userStoriesFilters.value.epic_id,
      }

      // Add search parameter if search is active
      if (userStoriesSearch.value.trim()) {
        requestParams.search = userStoriesSearch.value.trim()
      }

      const response = await userStoryService.list(requestParams)

      // Debug logging
      console.log('User stories response:', response)

      // Check if response has the expected ListResponse structure
      if (
        response &&
        typeof response === 'object' &&
        'data' in response &&
        Array.isArray(response.data)
      ) {
        // Clear existing user stories only for pagination (not accumulation)
        userStories.value.clear()

        // Update the map with fetched user stories
        response.data.forEach((story) => {
          userStories.value.set(story.id, story)
        })

        // Update pagination info from backend response
        userStoriesPagination.value.totalCount = response.total_count || 0

        // Update page size if provided in response
        if (response.limit) {
          userStoriesPagination.value.pageSize = response.limit
        }

        // Calculate and update current page from offset
        if (response.offset !== undefined && response.limit && response.limit > 0) {
          userStoriesPagination.value.page = Math.floor(response.offset / response.limit) + 1
        }
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array (fallback for mock data)
        userStories.value.clear()
        response.forEach((story) => {
          userStories.value.set(story.id, story)
        })
        // For direct array response, set totalCount to show pagination
        userStoriesPagination.value.totalCount = response.length
        userStoriesPagination.value.page = 1
      } else {
        console.warn('Unexpected user stories response structure:', response)
        // Handle unexpected response structure
        userStories.value.clear()
        userStoriesPagination.value.totalCount = 0
      }

      return response
    } catch (error) {
      console.error('Error fetching user stories:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user stories'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  async function fetchUserStory(id: string, include?: string) {
    const key = `user-story-${id}`
    setLoading(key, true)
    clearError(key)

    try {
      const story = await userStoryService.get(id, include)
      userStories.value.set(story.id, story)
      return story
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user story'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  async function createUserStory(request: CreateUserStoryRequest) {
    const key = 'create-user-story'
    setLoading(key, true)
    clearError(key)

    try {
      const story = await userStoryService.create(request)
      userStories.value.set(story.id, story)

      // Update total count after creation
      userStoriesPagination.value.totalCount += 1

      return story
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user story'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  async function updateUserStory(id: string, request: UpdateUserStoryRequest) {
    const key = `update-user-story-${id}`
    setLoading(key, true)
    clearError(key)

    try {
      const story = await userStoryService.update(id, request)
      userStories.value.set(story.id, story)
      return story
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user story'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  async function deleteUserStory(id: string) {
    const key = `delete-user-story-${id}`
    setLoading(key, true)
    clearError(key)

    try {
      await userStoryService.delete(id)
      userStories.value.delete(id)

      // Update total count after deletion
      if (userStoriesPagination.value.totalCount > 0) {
        userStoriesPagination.value.totalCount -= 1
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user story'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  // Pagination actions for user stories
  function setUserStoriesPage(page: number) {
    userStoriesPagination.value.page = page
  }

  function setUserStoriesPageSize(pageSize: number) {
    userStoriesPagination.value.pageSize = pageSize
    userStoriesPagination.value.page = 1 // Reset to first page when changing page size
  }

  // Filter and search actions for user stories
  function setUserStoriesFilters(filters: UserStoryFilterState) {
    userStoriesFilters.value = { ...filters }
    userStoriesPagination.value.page = 1 // Reset to first page when filters change
  }

  function clearUserStoriesFilters() {
    userStoriesFilters.value = {}
    userStoriesPagination.value.page = 1 // Reset to first page when clearing filters
  }

  function setUserStoriesSearch(search: string) {
    userStoriesSearch.value = search
    userStoriesPagination.value.page = 1 // Reset to first page when search changes
  }

  function clearUserStoriesSearch() {
    userStoriesSearch.value = ''
    userStoriesPagination.value.page = 1 // Reset to first page when clearing search
  }

  // Combined filter and search reset
  function resetUserStoriesFiltersAndSearch() {
    userStoriesFilters.value = {}
    userStoriesSearch.value = ''
    userStoriesPagination.value.page = 1
  }

  // Requirement actions
  async function fetchRequirements(params?: RequirementListParams) {
    const key = 'requirements'
    setLoading(key, true)
    clearError(key)

    try {
      const response = await requirementService.list(params)

      // Debug logging
      console.log('Requirements response:', response)

      // Check if response has the expected structure
      if (response && Array.isArray(response.data)) {
        // Update the map with fetched requirements
        response.data.forEach((req) => {
          requirements.value.set(req.id, req)
        })
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        response.forEach((req) => {
          requirements.value.set(req.id, req)
        })
      } else {
        console.warn('Unexpected requirements response structure:', response)
      }

      return response
    } catch (error) {
      console.error('Error fetching requirements:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch requirements'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  async function fetchRequirement(id: string, include?: string) {
    const key = `requirement-${id}`
    setLoading(key, true)
    clearError(key)

    try {
      const requirement = await requirementService.get(id, include)
      requirements.value.set(requirement.id, requirement)
      return requirement
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch requirement'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  async function createRequirement(request: CreateRequirementRequest) {
    const key = 'create-requirement'
    setLoading(key, true)
    clearError(key)

    try {
      const requirement = await requirementService.create(request)
      requirements.value.set(requirement.id, requirement)
      return requirement
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create requirement'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  async function updateRequirement(id: string, request: UpdateRequirementRequest) {
    const key = `update-requirement-${id}`
    setLoading(key, true)
    clearError(key)

    try {
      const requirement = await requirementService.update(id, request)
      requirements.value.set(requirement.id, requirement)
      return requirement
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update requirement'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  async function deleteRequirement(id: string) {
    const key = `delete-requirement-${id}`
    setLoading(key, true)
    clearError(key)

    try {
      await requirementService.delete(id)
      requirements.value.delete(id)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete requirement'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  // Acceptance Criteria actions
  async function fetchAcceptanceCriteria() {
    const key = 'acceptance-criteria'
    setLoading(key, true)
    clearError(key)

    try {
      const criteria = await acceptanceCriteriaService.list()

      // Update the map with fetched acceptance criteria
      criteria.data.forEach((ac) => {
        acceptanceCriteria.value.set(ac.id, ac)
      })

      return criteria
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch acceptance criteria'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  async function fetchAcceptanceCriterion(id: string, include?: string) {
    const key = `acceptance-criterion-${id}`
    setLoading(key, true)
    clearError(key)

    try {
      const criterion = await acceptanceCriteriaService.get(id, include)
      acceptanceCriteria.value.set(criterion.id, criterion)
      return criterion
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch acceptance criterion'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  async function updateAcceptanceCriterion(id: string, request: UpdateAcceptanceCriteriaRequest) {
    const key = `update-acceptance-criterion-${id}`
    setLoading(key, true)
    clearError(key)

    try {
      const criterion = await acceptanceCriteriaService.update(id, request)
      acceptanceCriteria.value.set(criterion.id, criterion)
      return criterion
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update acceptance criterion'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  async function deleteAcceptanceCriterion(id: string) {
    const key = `delete-acceptance-criterion-${id}`
    setLoading(key, true)
    clearError(key)

    try {
      await acceptanceCriteriaService.delete(id)
      acceptanceCriteria.value.delete(id)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete acceptance criterion'
      setError(key, errorMessage)
      throw error
    } finally {
      setLoading(key, false)
    }
  }

  // Load initial data for dashboard
  async function loadDashboardData() {
    const key = 'dashboard'
    setLoading(key, true)
    clearError(key)

    try {
      // Try to load real data first
      await Promise.all([
        fetchEpics({ limit: 50, order_by: 'updated_at' }),
        fetchUserStories({ limit: 50, order_by: 'updated_at' }),
        fetchRequirements({ limit: 50, order_by: 'updated_at' }),
      ])
    } catch (error) {
      console.warn('Failed to load real data, using mock data for development:', error)

      // Load mock data for development when API is not available
      loadMockData()

      const errorMessage = 'API недоступен, используются тестовые данные'
      setError(key, errorMessage)
    } finally {
      setLoading(key, false)
    }
  }

  // Mock data for development
  function loadMockData() {
    const now = new Date().toISOString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()

    // Mock epics - создаем 75 эпиков для демонстрации пагинации
    const mockEpics: Epic[] = []
    const statuses: EpicStatus[] = ['Backlog', 'Draft', 'In Progress', 'Done', 'Cancelled']
    const priorities: Priority[] = [1, 2, 3, 4]

    for (let i = 1; i <= 75; i++) {
      mockEpics.push({
        id: `${i}`,
        reference_id: `EP-${String(i).padStart(3, '0')}`,
        title: `Эпик ${i}: ${i <= 25 ? 'Система аутентификации' : i <= 50 ? 'Управление требованиями' : 'Интеграция с внешними системами'}`,
        description: `Описание эпика ${i} для демонстрации пагинации`,
        status: statuses[i % statuses.length],
        priority: priorities[i % priorities.length],
        creator_id: 'user1',
        assignee_id: i % 3 === 0 ? 'user2' : undefined,
        created_at: twoDaysAgo,
        updated_at: i % 2 === 0 ? yesterday : now,
      })
    }

    // Mock user stories
    const mockUserStories: UserStory[] = [
      {
        id: '1',
        reference_id: 'US-001',
        title: 'Вход в систему',
        description: 'Как пользователь, я хочу войти в систему, чтобы получить доступ к функциям',
        status: 'In Progress',
        priority: 1,
        epic_id: '1',
        creator_id: 'user1',
        assignee_id: 'user2',
        created_at: yesterday,
        updated_at: now,
      },
      {
        id: '2',
        reference_id: 'US-002',
        title: 'Создание требований',
        description:
          'Как аналитик, я хочу создавать требования, чтобы документировать функциональность',
        status: 'Draft',
        priority: 2,
        epic_id: '2',
        creator_id: 'user1',
        created_at: now,
        updated_at: now,
      },
    ]

    // Mock requirements
    const mockRequirements: Requirement[] = [
      {
        id: '1',
        reference_id: 'REQ-001',
        title: 'Валидация пароля',
        description: 'Система должна проверять сложность пароля',
        status: 'Active',
        priority: 1,
        user_story_id: '1',
        type_id: 'type1',
        creator_id: 'user1',
        assignee_id: 'user2',
        created_at: yesterday,
        updated_at: now,
      },
      {
        id: '2',
        reference_id: 'REQ-002',
        title: 'Форма создания требования',
        description: 'Интерфейс для ввода данных требования',
        status: 'Draft',
        priority: 2,
        user_story_id: '2',
        type_id: 'type1',
        creator_id: 'user1',
        created_at: now,
        updated_at: now,
      },
    ]

    // Load mock data into stores
    mockEpics.forEach((epic) => epics.value.set(epic.id, epic))
    mockUserStories.forEach((story) => userStories.value.set(story.id, story))
    mockRequirements.forEach((req) => requirements.value.set(req.id, req))

    // Set pagination for mock data
    epicsPagination.value.totalCount = mockEpics.length
    epicsPagination.value.page = 1
    epicsPagination.value.pageSize = 25
  }

  return {
    // State
    epics,
    userStories,
    requirements,
    acceptanceCriteria,
    loading,
    errors,
    epicsPagination,
    userStoriesPagination,
    userStoriesFilters,
    userStoriesSearch,

    // Computed
    epicsList,
    userStoriesList,
    requirementsList,
    acceptanceCriteriaList,
    stats,
    recentActivity,

    // Epic actions
    fetchEpics,
    fetchEpic,
    createEpic,
    updateEpic,
    deleteEpic,
    setEpicsPage,
    setEpicsPageSize,

    // User Story actions
    fetchUserStories,
    fetchUserStory,
    createUserStory,
    updateUserStory,
    deleteUserStory,
    setUserStoriesPage,
    setUserStoriesPageSize,
    setUserStoriesFilters,
    clearUserStoriesFilters,
    setUserStoriesSearch,
    clearUserStoriesSearch,
    resetUserStoriesFiltersAndSearch,

    // Requirement actions
    fetchRequirements,
    fetchRequirement,
    createRequirement,
    updateRequirement,
    deleteRequirement,

    // Acceptance Criteria actions
    fetchAcceptanceCriteria,
    fetchAcceptanceCriterion,
    updateAcceptanceCriterion,
    deleteAcceptanceCriterion,

    // Dashboard actions
    loadDashboardData,
  }
})
