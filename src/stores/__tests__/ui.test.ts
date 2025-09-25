import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUIStore } from '../ui'

describe('UIStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default state', () => {
    const store = useUIStore()

    expect(store.sidebarCollapsed).toBe(false)
    expect(store.selectedEntity).toBeNull()
    expect(store.searchQuery).toBe('')
    expect(store.searchResults).toHaveLength(0)
    expect(store.notifications).toHaveLength(0)
    expect(store.currentPath).toHaveLength(0)
  })

  it('should toggle sidebar correctly', () => {
    const store = useUIStore()

    expect(store.sidebarCollapsed).toBe(false)

    store.toggleSidebar()
    expect(store.sidebarCollapsed).toBe(true)

    store.toggleSidebar()
    expect(store.sidebarCollapsed).toBe(false)
  })

  it('should manage entity selection', () => {
    const store = useUIStore()

    store.selectEntity('epic', '123')
    expect(store.selectedEntity).toEqual({ type: 'epic', id: '123' })

    store.clearSelection()
    expect(store.selectedEntity).toBeNull()
  })

  it('should manage search state', () => {
    const store = useUIStore()

    store.setSearchQuery('test query')
    expect(store.searchQuery).toBe('test query')

    const mockResults = [
      {
        entity_type: 'epic' as const,
        entity_id: '1',
        reference_id: 'EP-001',
        title: 'Test Epic',
        rank: 1,
      },
    ]

    store.setSearchResults(mockResults)
    expect(store.searchResults).toEqual(mockResults)

    store.clearSearch()
    expect(store.searchQuery).toBe('')
    expect(store.searchResults).toHaveLength(0)
  })

  it('should manage notifications', () => {
    const store = useUIStore()

    const notificationId = store.showSuccess('Test Success', 'Success message')
    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0].type).toBe('success')
    expect(store.notifications[0].title).toBe('Test Success')

    store.showError('Test Error', 'Error message')
    expect(store.notifications).toHaveLength(2)

    store.removeNotification(notificationId)
    expect(store.notifications).toHaveLength(1)

    store.clearAllNotifications()
    expect(store.notifications).toHaveLength(0)
  })

  it('should manage hierarchy expansion state', () => {
    const store = useUIStore()

    expect(store.isHierarchyExpanded('node1')).toBe(false)

    store.setHierarchyExpanded('node1', true)
    expect(store.isHierarchyExpanded('node1')).toBe(true)

    store.toggleHierarchyNode('node1')
    expect(store.isHierarchyExpanded('node1')).toBe(false)
  })

  it('should manage loading states', () => {
    const store = useUIStore()

    expect(store.isLoading('test')).toBe(false)

    store.setLoading('test', true)
    expect(store.isLoading('test')).toBe(true)

    store.setLoading('test', false)
    expect(store.isLoading('test')).toBe(false)

    store.setLoading('test1', true)
    store.setLoading('test2', true)
    expect(store.isLoading('test1')).toBe(true)
    expect(store.isLoading('test2')).toBe(true)

    store.clearAllLoading()
    expect(store.isLoading('test1')).toBe(false)
    expect(store.isLoading('test2')).toBe(false)
  })
})
