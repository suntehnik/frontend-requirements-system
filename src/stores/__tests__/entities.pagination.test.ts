import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEntitiesStore } from '../entities'
import type { EpicListResponse } from '@/types'

// Mock the epic service
vi.mock('@/services', () => ({
  epicService: {
    list: vi.fn(),
  },
  userStoryService: { list: vi.fn() },
  requirementService: { list: vi.fn() },
  acceptanceCriteriaService: { list: vi.fn() },
}))

describe('EntitiesStore Pagination', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with default pagination state', () => {
    const store = useEntitiesStore()

    expect(store.epicsPagination.page).toBe(1)
    expect(store.epicsPagination.pageSize).toBe(25)
    expect(store.epicsPagination.totalCount).toBe(0)
  })

  it('should update pagination state from API response', async () => {
    const { epicService } = await import('@/services')
    const store = useEntitiesStore()

    const mockResponse: EpicListResponse = {
      data: [
        {
          id: '1',
          reference_id: 'EP-001',
          title: 'Test Epic',
          status: 'Draft',
          priority: 1,
          creator_id: 'user1',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      ],
      total_count: 75,
      limit: 25,
      offset: 0,
    }

    vi.mocked(epicService.list).mockResolvedValue(mockResponse)

    await store.fetchEpics()

    expect(store.epicsPagination.totalCount).toBe(75)
    expect(store.epicsPagination.pageSize).toBe(25)
    expect(store.epicsPagination.page).toBe(1)
  })

  it('should calculate correct offset for API requests', async () => {
    const { epicService } = await import('@/services')
    const store = useEntitiesStore()

    // Set page 2 with page size 25 - this should result in offset 25
    store.setEpicsPage(2)
    expect(store.epicsPagination.page).toBe(2)
    expect(store.epicsPagination.pageSize).toBe(25)

    const mockResponse: EpicListResponse = {
      data: [],
      total_count: 75,
      limit: 25,
      offset: 25,
    }

    vi.mocked(epicService.list).mockResolvedValue(mockResponse)

    await store.fetchEpics()

    // Check that the API was called with correct offset: (page - 1) * pageSize = (2 - 1) * 25 = 25
    expect(epicService.list).toHaveBeenCalledWith({
      limit: 25,
      offset: 25,
    })
  })

  it('should reset to page 1 when changing page size', () => {
    const store = useEntitiesStore()

    // Set to page 3
    store.setEpicsPage(3)
    expect(store.epicsPagination.page).toBe(3)

    // Change page size - should reset to page 1
    store.setEpicsPageSize(50)
    expect(store.epicsPagination.page).toBe(1)
    expect(store.epicsPagination.pageSize).toBe(50)
  })

  it('should handle API response with different pagination values', async () => {
    const { epicService } = await import('@/services')
    const store = useEntitiesStore()

    const mockResponse: EpicListResponse = {
      data: [],
      total_count: 150,
      limit: 50,
      offset: 100,
    }

    vi.mocked(epicService.list).mockResolvedValue(mockResponse)

    await store.fetchEpics()

    expect(store.epicsPagination.totalCount).toBe(150)
    expect(store.epicsPagination.pageSize).toBe(50)
    // Page should be calculated from offset: 100 / 50 + 1 = 3
    expect(store.epicsPagination.page).toBe(3)
  })

  it('should handle array response (fallback for mock data)', async () => {
    const { epicService } = await import('@/services')
    const store = useEntitiesStore()

    const mockArrayResponse = [
      {
        id: '1',
        reference_id: 'EP-001',
        title: 'Test Epic',
        status: 'Draft' as const,
        priority: 1 as const,
        creator_id: 'user1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ]

    vi.mocked(epicService.list).mockResolvedValue(mockArrayResponse as unknown as EpicListResponse)

    await store.fetchEpics()

    expect(store.epicsPagination.totalCount).toBe(1)
    expect(store.epicsPagination.page).toBe(1)
  })
})
