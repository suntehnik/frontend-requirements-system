import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEntitiesStore } from '@/stores/entities'
import type { Epic } from '@/types'

// Mock the epic service
vi.mock('@/services/epic-service', () => ({
  epicService: {
    list: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('EpicsListView Integration', () => {
  let entitiesStore: ReturnType<typeof useEntitiesStore>

  const mockEpics: Epic[] = [
    {
      id: '1',
      reference_id: 'EP-001',
      title: 'Система аутентификации',
      description: 'Реализация безопасной системы входа пользователей',
      status: 'In Progress',
      priority: 1,
      creator_id: 'user1',
      assignee_id: 'user2',
      created_at: '2024-01-15T10:00:00Z',
      last_modified: '2024-01-16T10:00:00Z',
      assignee: {
        id: 'user2',
        username: 'john.doe',
        email: 'john@example.com',
        role: 'User',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: '2',
      reference_id: 'EP-002',
      title: 'Управление требованиями',
      description: 'Функциональность для создания и редактирования требований',
      status: 'Draft',
      priority: 2,
      creator_id: 'user1',
      created_at: '2024-01-16T10:00:00Z',
      last_modified: '2024-01-16T10:00:00Z',
    },
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    entitiesStore = useEntitiesStore()
  })

  it('should fetch epics from the API through the store', async () => {
    // Mock the API response
    const { epicService } = await import('@/services/epic-service')
    vi.mocked(epicService.list).mockResolvedValue({
      data: mockEpics,
      total_count: 2,
      limit: 100,
      offset: 0,
    })

    // Call the store method that the component uses
    await entitiesStore.fetchEpics({
      include: 'creator,assignee',
      limit: 100,
      order_by: 'last_modified',
    })

    // Verify the API was called with correct parameters
    expect(epicService.list).toHaveBeenCalledWith({
      include: 'creator,assignee',
      limit: 100,
      order_by: 'last_modified',
    })

    // Verify the store state was updated
    expect(entitiesStore.epicsList).toHaveLength(2)
    expect(entitiesStore.epicsList[0].reference_id).toBe('EP-001')
    expect(entitiesStore.epicsList[1].reference_id).toBe('EP-002')
  })

  it('should handle API errors gracefully', async () => {
    // Mock API error
    const { epicService } = await import('@/services/epic-service')
    const errorMessage = 'Network error'
    vi.mocked(epicService.list).mockRejectedValue(new Error(errorMessage))

    // Call the store method
    await expect(entitiesStore.fetchEpics()).rejects.toThrow(errorMessage)

    // Verify error state
    expect(entitiesStore.errors.epics).toBe(errorMessage)
    expect(entitiesStore.loading.epics).toBe(false)
  })

  it('should delete epics through the API', async () => {
    // Setup initial state
    entitiesStore.epics.set('1', mockEpics[0])
    entitiesStore.epics.set('2', mockEpics[1])

    // Mock the API response
    const { epicService } = await import('@/services/epic-service')
    vi.mocked(epicService.delete).mockResolvedValue(undefined)

    // Call the store method
    await entitiesStore.deleteEpic('1')

    // Verify the API was called
    expect(epicService.delete).toHaveBeenCalledWith('1')

    // Verify the epic was removed from store
    expect(entitiesStore.epics.has('1')).toBe(false)
    expect(entitiesStore.epics.has('2')).toBe(true)
  })

  it('should filter epics by status', () => {
    // Setup store with mock data
    mockEpics.forEach((epic) => entitiesStore.epics.set(epic.id, epic))

    // Test filtering logic (this would be used in the component)
    const inProgressEpics = entitiesStore.epicsList.filter((epic) => epic.status === 'In Progress')
    const draftEpics = entitiesStore.epicsList.filter((epic) => epic.status === 'Draft')

    expect(inProgressEpics).toHaveLength(1)
    expect(inProgressEpics[0].reference_id).toBe('EP-001')

    expect(draftEpics).toHaveLength(1)
    expect(draftEpics[0].reference_id).toBe('EP-002')
  })

  it('should filter epics by priority', () => {
    // Setup store with mock data
    mockEpics.forEach((epic) => entitiesStore.epics.set(epic.id, epic))

    // Test filtering logic
    const criticalEpics = entitiesStore.epicsList.filter((epic) => epic.priority === 1)
    const highEpics = entitiesStore.epicsList.filter((epic) => epic.priority === 2)

    expect(criticalEpics).toHaveLength(1)
    expect(criticalEpics[0].reference_id).toBe('EP-001')

    expect(highEpics).toHaveLength(1)
    expect(highEpics[0].reference_id).toBe('EP-002')
  })

  it('should provide loading states', () => {
    // Test loading state management
    entitiesStore.loading.epics = true
    expect(entitiesStore.loading.epics).toBe(true)

    entitiesStore.loading.epics = false
    expect(entitiesStore.loading.epics).toBe(false)
  })

  it('should provide error states', () => {
    // Test error state management
    const errorMessage = 'API Error'
    entitiesStore.errors.epics = errorMessage
    expect(entitiesStore.errors.epics).toBe(errorMessage)

    delete entitiesStore.errors.epics
    expect(entitiesStore.errors.epics).toBeUndefined()
  })
})
