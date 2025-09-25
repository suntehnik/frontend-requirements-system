import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEntitiesStore } from '../entities'

// Mock the services
vi.mock('@/services', () => ({
  epicService: {
    list: vi.fn(),
  },
  userStoryService: {
    list: vi.fn(),
  },
  requirementService: {
    list: vi.fn(),
  },
  acceptanceCriteriaService: {
    list: vi.fn(),
  },
}))

describe('EntitiesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty state', () => {
    const store = useEntitiesStore()

    expect(store.epics.size).toBe(0)
    expect(store.userStories.size).toBe(0)
    expect(store.requirements.size).toBe(0)
    expect(store.acceptanceCriteria.size).toBe(0)
  })

  it('should calculate stats correctly', () => {
    const store = useEntitiesStore()

    // Initially should be zero
    expect(store.stats.epics).toBe(0)
    expect(store.stats.userStories).toBe(0)
    expect(store.stats.requirements).toBe(0)
    expect(store.stats.activeTasks).toBe(0)
  })

  it('should calculate recent activity correctly', () => {
    const store = useEntitiesStore()

    // Initially should be empty
    expect(store.recentActivity).toHaveLength(0)
  })

  it('should load mock data when API fails', async () => {
    const store = useEntitiesStore()

    // Mock services to throw errors
    const { epicService, userStoryService, requirementService } = await import('@/services')
    vi.mocked(epicService.list).mockRejectedValue(new Error('API not available'))
    vi.mocked(userStoryService.list).mockRejectedValue(new Error('API not available'))
    vi.mocked(requirementService.list).mockRejectedValue(new Error('API not available'))

    // Load dashboard data
    await store.loadDashboardData()

    // Should have mock data
    expect(store.epics.size).toBeGreaterThan(0)
    expect(store.userStories.size).toBeGreaterThan(0)
    expect(store.requirements.size).toBeGreaterThan(0)

    // Should have error set
    expect(store.errors.dashboard).toBeDefined()
  })
})
