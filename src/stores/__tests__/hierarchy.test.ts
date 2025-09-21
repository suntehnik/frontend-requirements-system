import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHierarchyStore } from '../hierarchy'
import type { HierarchyNode } from '@/types/hierarchy'

// Mock hierarchy service
vi.mock('@/services/hierarchy-service', () => ({
  hierarchyService: {
    getFullHierarchy: vi.fn(),
    getEpicHierarchy: vi.fn(),
    getUserStoryHierarchy: vi.fn(),
    getEntityPath: vi.fn(),
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

// Test data for hierarchy tests
const mockTestData: HierarchyNode[] = [
  {
    entity_type: 'epic',
    entity_id: 'epic-1',
    reference_id: 'EP-001',
    title: 'Test Epic 1',
    status: 'In Progress',
    children: [
      {
        entity_type: 'user_story',
        entity_id: 'story-1',
        reference_id: 'US-001',
        title: 'Test Story 1',
        status: 'In Progress',
        children: [
          {
            entity_type: 'acceptance_criteria',
            entity_id: 'ac-1',
            reference_id: 'AC-001',
            title: 'Test AC 1',
            status: 'Draft',
            children: [
              {
                entity_type: 'requirement',
                entity_id: 'req-1',
                reference_id: 'REQ-0001',
                title: 'Test Requirement 1',
                status: 'Active'
              }
            ]
          }
        ]
      },
      {
        entity_type: 'user_story',
        entity_id: 'story-2',
        reference_id: 'US-002',
        title: 'Test Story 2',
        status: 'Backlog',
        children: []
      }
    ]
  },
  {
    entity_type: 'epic',
    entity_id: 'epic-2',
    reference_id: 'EP-002',
    title: 'Test Epic 2',
    status: 'Draft',
    children: []
  }
]

describe('HierarchyStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with empty state', () => {
    const store = useHierarchyStore()
    
    expect(store.hierarchyData).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
    expect(store.expandedNodes).toEqual(new Set())
  })

  it('should load hierarchy data from API', async () => {
    const { hierarchyService } = await import('@/services/hierarchy-service')
    vi.mocked(hierarchyService.getFullHierarchy).mockResolvedValue(mockTestData)
    
    const store = useHierarchyStore()
    await store.loadHierarchy()
    
    expect(store.loading).toBe(false)
    expect(store.error).toBe(null)
    expect(store.hierarchyData).toHaveLength(2) // 2 epics in test data
    expect(store.hierarchyData[0].reference_id).toBe('EP-001')
    expect(store.hierarchyData[0].title).toBe('Test Epic 1')
  })

  it('should toggle node expansion', () => {
    const store = useHierarchyStore()
    const nodeId = 'epic-1'
    
    expect(store.isNodeExpanded(nodeId)).toBe(false)
    
    store.toggleNodeExpansion(nodeId)
    expect(store.isNodeExpanded(nodeId)).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'hierarchy-expanded-nodes',
      JSON.stringify([nodeId])
    )
    
    store.toggleNodeExpansion(nodeId)
    expect(store.isNodeExpanded(nodeId)).toBe(false)
  })

  it('should expand and collapse nodes', () => {
    const store = useHierarchyStore()
    const nodeId = 'epic-1'
    
    store.expandNode(nodeId)
    expect(store.isNodeExpanded(nodeId)).toBe(true)
    
    store.collapseNode(nodeId)
    expect(store.isNodeExpanded(nodeId)).toBe(false)
  })

  it('should expand all nodes', async () => {
    const { hierarchyService } = await import('@/services/hierarchy-service')
    vi.mocked(hierarchyService.getFullHierarchy).mockResolvedValue(mockTestData)
    
    const store = useHierarchyStore()
    await store.loadHierarchy()
    
    store.expandAll()
    
    // Check that all nodes are expanded
    const allNodeIds = store.flattenedNodes.map(node => node.entity_id)
    allNodeIds.forEach(nodeId => {
      expect(store.isNodeExpanded(nodeId)).toBe(true)
    })
  })

  it('should collapse all nodes', async () => {
    const { hierarchyService } = await import('@/services/hierarchy-service')
    vi.mocked(hierarchyService.getFullHierarchy).mockResolvedValue(mockTestData)
    
    const store = useHierarchyStore()
    await store.loadHierarchy()
    
    // First expand some nodes
    store.expandNode('epic-1')
    store.expandNode('story-1')
    
    store.collapseAll()
    
    expect(store.expandedNodes.size).toBe(0)
  })

  it('should find node by ID', async () => {
    const { hierarchyService } = await import('@/services/hierarchy-service')
    vi.mocked(hierarchyService.getFullHierarchy).mockResolvedValue(mockTestData)
    
    const store = useHierarchyStore()
    await store.loadHierarchy()
    
    const node = store.findNode('epic-1')
    expect(node).toBeDefined()
    expect(node?.reference_id).toBe('EP-001')
    expect(node?.title).toBe('Test Epic 1')
    
    const nonExistentNode = store.findNode('non-existent')
    expect(nonExistentNode).toBe(null)
  })

  it('should find node by reference ID', async () => {
    const { hierarchyService } = await import('@/services/hierarchy-service')
    vi.mocked(hierarchyService.getFullHierarchy).mockResolvedValue(mockTestData)
    
    const store = useHierarchyStore()
    await store.loadHierarchy()
    
    const node = store.findNodeByReference('EP-001')
    expect(node).toBeDefined()
    expect(node?.entity_id).toBe('epic-1')
    expect(node?.title).toBe('Test Epic 1')
    
    const nonExistentNode = store.findNodeByReference('NON-001')
    expect(nonExistentNode).toBe(null)
  })

  it('should get node path', async () => {
    const { hierarchyService } = await import('@/services/hierarchy-service')
    vi.mocked(hierarchyService.getFullHierarchy).mockResolvedValue(mockTestData)
    
    const store = useHierarchyStore()
    await store.loadHierarchy()
    
    const path = store.getNodePath('req-1')
    expect(path).toHaveLength(4) // epic -> story -> ac -> requirement
    expect(path[0].reference_id).toBe('EP-001')
    expect(path[1].reference_id).toBe('US-001')
    expect(path[2].reference_id).toBe('AC-001')
    expect(path[3].reference_id).toBe('REQ-0001')
  })

  it('should check if node has children', async () => {
    const { hierarchyService } = await import('@/services/hierarchy-service')
    vi.mocked(hierarchyService.getFullHierarchy).mockResolvedValue(mockTestData)
    
    const store = useHierarchyStore()
    await store.loadHierarchy()
    
    expect(store.hasChildren('epic-1')).toBe(true)
    expect(store.hasChildren('req-1')).toBe(false)
    
    expect(store.getChildrenCount('epic-1')).toBe(2) // 2 user stories in test data
    expect(store.getChildrenCount('req-1')).toBe(0)
  })

  it('should return correct status colors', () => {
    const store = useHierarchyStore()
    
    expect(store.getStatusColor('Done')).toBe('success')
    expect(store.getStatusColor('In Progress')).toBe('primary')
    expect(store.getStatusColor('Draft')).toBe('warning')
    expect(store.getStatusColor('Backlog')).toBe('info')
    expect(store.getStatusColor('Cancelled')).toBe('error')
    expect(store.getStatusColor('Active')).toBe('success')
    expect(store.getStatusColor('Obsolete')).toBe('error')
    expect(store.getStatusColor('Unknown')).toBe('grey')
  })

  it('should return correct entity icons', () => {
    const store = useHierarchyStore()
    
    expect(store.getEntityIcon('epic')).toBe('mdi-folder-multiple')
    expect(store.getEntityIcon('user_story')).toBe('mdi-book-open-variant')
    expect(store.getEntityIcon('acceptance_criteria')).toBe('mdi-check-circle-outline')
    expect(store.getEntityIcon('requirement')).toBe('mdi-file-document-outline')
  })

  it('should restore expanded state from localStorage', async () => {
    const { hierarchyService } = await import('@/services/hierarchy-service')
    vi.mocked(hierarchyService.getFullHierarchy).mockResolvedValue(mockTestData)
    
    const expandedNodes = ['epic-1', 'story-1']
    localStorageMock.getItem.mockReturnValue(JSON.stringify(expandedNodes))
    
    const store = useHierarchyStore()
    await store.loadHierarchy()
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('hierarchy-expanded-nodes')
  })

  it('should flatten hierarchy correctly', async () => {
    const { hierarchyService } = await import('@/services/hierarchy-service')
    vi.mocked(hierarchyService.getFullHierarchy).mockResolvedValue(mockTestData)
    
    const store = useHierarchyStore()
    await store.loadHierarchy()
    
    const flattened = store.flattenedNodes
    expect(flattened.length).toBe(6) // 2 epics + 2 stories + 1 ac + 1 requirement
    
    // Check that all entity types are present
    const entityTypes = flattened.map(node => node.entity_type)
    expect(entityTypes).toContain('epic')
    expect(entityTypes).toContain('user_story')
    expect(entityTypes).toContain('acceptance_criteria')
    expect(entityTypes).toContain('requirement')
  })

  it('should handle API failure with error state', async () => {
    const { hierarchyService } = await import('@/services/hierarchy-service')
    
    // Mock API failure
    vi.mocked(hierarchyService.getFullHierarchy).mockRejectedValue(new Error('API not available'))
    
    const store = useHierarchyStore()
    await store.loadHierarchy()
    
    // Should show error state
    expect(store.hierarchyData).toHaveLength(0)
    expect(store.error).toBe('API not available')
    expect(store.loading).toBe(false)
  })

  it('should use API data when available', async () => {
    const { hierarchyService } = await import('@/services/hierarchy-service')
    
    const mockApiData = [
      {
        entity_type: 'epic' as const,
        entity_id: 'api-epic-1',
        reference_id: 'API-001',
        title: 'API Epic',
        status: 'In Progress',
        children: []
      }
    ]
    
    vi.mocked(hierarchyService.getFullHierarchy).mockResolvedValue(mockApiData)
    
    const store = useHierarchyStore()
    await store.loadHierarchy()
    
    expect(store.hierarchyData).toEqual(mockApiData)
    expect(store.error).toBe(null)
    expect(store.loading).toBe(false)
  })

  it('should refresh hierarchy data', async () => {
    const { hierarchyService } = await import('@/services/hierarchy-service')
    
    const initialData = [
      {
        entity_type: 'epic' as const,
        entity_id: 'epic-1',
        reference_id: 'EP-001',
        title: 'Initial Epic',
        status: 'Draft',
        children: []
      }
    ]
    
    const refreshedData = [
      {
        entity_type: 'epic' as const,
        entity_id: 'epic-1',
        reference_id: 'EP-001',
        title: 'Updated Epic',
        status: 'In Progress',
        children: []
      }
    ]
    
    vi.mocked(hierarchyService.getFullHierarchy)
      .mockResolvedValueOnce(initialData)
      .mockResolvedValueOnce(refreshedData)
    
    const store = useHierarchyStore()
    await store.loadHierarchy()
    
    expect(store.hierarchyData[0].title).toBe('Initial Epic')
    
    await store.refreshHierarchy()
    
    expect(store.hierarchyData[0].title).toBe('Updated Epic')
  })
})