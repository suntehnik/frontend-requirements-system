import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { HierarchyNode, EntityPath } from '@/types/hierarchy'
import type { EntityType } from '@/types/common'
import { hierarchyService } from '@/services/hierarchy-service'

export const useHierarchyStore = defineStore('hierarchy', () => {
  // State
  const hierarchyData = ref<HierarchyNode[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const expandedNodes = ref<Set<string>>(new Set())

  // Computed
  const flattenedNodes = computed(() => {
    const flattened: HierarchyNode[] = []

    function flatten(nodes: HierarchyNode[]) {
      for (const node of nodes) {
        flattened.push(node)
        if (node.children) {
          flatten(node.children)
        }
      }
    }

    flatten(hierarchyData.value)
    return flattened
  })

  // Actions
  async function loadHierarchy(forceRefresh = false) {
    // Don't reload if data already exists and not forcing refresh
    if (hierarchyData.value.length > 0 && !forceRefresh) {
      return
    }

    loading.value = true
    error.value = null

    try {
      // Load from API
      console.log('Loading hierarchy from API...')
      const apiData = await hierarchyService.getFullHierarchy()

      hierarchyData.value = apiData || []
      console.log(`Loaded ${hierarchyData.value.length} epics from API`)

      // Restore expanded state from localStorage
      const savedExpanded = localStorage.getItem('hierarchy-expanded-nodes')
      if (savedExpanded) {
        expandedNodes.value = new Set(JSON.parse(savedExpanded))
      }
    } catch (err) {
      // Set error state if API fails
      error.value = err instanceof Error ? err.message : 'Failed to load hierarchy from API'
      console.error('Failed to load hierarchy:', err)
      hierarchyData.value = []
    } finally {
      loading.value = false
    }
  }

  function toggleNodeExpansion(nodeId: string) {
    if (expandedNodes.value.has(nodeId)) {
      expandedNodes.value.delete(nodeId)
    } else {
      expandedNodes.value.add(nodeId)
    }

    // Save to localStorage
    localStorage.setItem('hierarchy-expanded-nodes', JSON.stringify([...expandedNodes.value]))
  }

  function expandNode(nodeId: string) {
    expandedNodes.value.add(nodeId)
    localStorage.setItem('hierarchy-expanded-nodes', JSON.stringify([...expandedNodes.value]))
  }

  function collapseNode(nodeId: string) {
    expandedNodes.value.delete(nodeId)
    localStorage.setItem('hierarchy-expanded-nodes', JSON.stringify([...expandedNodes.value]))
  }

  function isNodeExpanded(nodeId: string): boolean {
    return expandedNodes.value.has(nodeId)
  }

  function expandAll() {
    const allNodeIds = flattenedNodes.value.map((node) => node.entity_id)
    expandedNodes.value = new Set(allNodeIds)
    localStorage.setItem('hierarchy-expanded-nodes', JSON.stringify([...expandedNodes.value]))
  }

  function collapseAll() {
    expandedNodes.value.clear()
    localStorage.setItem('hierarchy-expanded-nodes', JSON.stringify([]))
  }

  function findNode(entityId: string): HierarchyNode | null {
    return flattenedNodes.value.find((node) => node.entity_id === entityId) || null
  }

  function findNodeByReference(referenceId: string): HierarchyNode | null {
    return flattenedNodes.value.find((node) => node.reference_id === referenceId) || null
  }

  function getNodePath(entityId: string): EntityPath[] {
    const path: EntityPath[] = []

    function findPath(
      nodes: HierarchyNode[],
      targetId: string,
      currentPath: HierarchyNode[],
    ): boolean {
      for (const node of nodes) {
        const newPath = [...currentPath, node]

        if (node.entity_id === targetId) {
          // Found the target, build the path
          path.push(
            ...newPath.map((n) => ({
              entity_type: n.entity_type,
              entity_id: n.entity_id,
              reference_id: n.reference_id,
              title: n.title,
            })),
          )
          return true
        }

        if (node.children && findPath(node.children, targetId, newPath)) {
          return true
        }
      }
      return false
    }

    findPath(hierarchyData.value, entityId, [])
    return path
  }

  function getChildrenCount(nodeId: string): number {
    const node = findNode(nodeId)
    return node?.children?.length || 0
  }

  function hasChildren(nodeId: string): boolean {
    return getChildrenCount(nodeId) > 0
  }

  // API-specific functions
  async function loadEpicHierarchy(epicId: string): Promise<HierarchyNode | null> {
    try {
      loading.value = true
      const epicHierarchy = await hierarchyService.getEpicHierarchy(epicId)
      return epicHierarchy
    } catch (err) {
      console.error('Failed to load epic hierarchy:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load epic hierarchy'
      return null
    } finally {
      loading.value = false
    }
  }

  async function loadUserStoryHierarchy(storyId: string): Promise<HierarchyNode | null> {
    try {
      loading.value = true
      const storyHierarchy = await hierarchyService.getUserStoryHierarchy(storyId)
      return storyHierarchy
    } catch (err) {
      console.error('Failed to load user story hierarchy:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load user story hierarchy'
      return null
    } finally {
      loading.value = false
    }
  }

  async function loadEntityPath(entityType: EntityType, entityId: string): Promise<EntityPath[]> {
    try {
      const path = await hierarchyService.getEntityPath(entityType, entityId)
      return path
    } catch (err) {
      console.error('Failed to load entity path:', err)
      // Fallback to local path calculation
      return getNodePath(entityId)
    }
  }

  // Refresh functions
  async function refreshHierarchy() {
    await loadHierarchy(true)
  }

  async function refreshNode(nodeId: string) {
    const node = findNode(nodeId)
    if (!node) return

    try {
      let refreshedNode: HierarchyNode | null = null

      if (node.entity_type === 'epic') {
        refreshedNode = await loadEpicHierarchy(nodeId)
      } else if (node.entity_type === 'user_story') {
        refreshedNode = await loadUserStoryHierarchy(nodeId)
      }

      if (refreshedNode) {
        // Update the node in the hierarchy
        updateNodeInHierarchy(nodeId, refreshedNode)
      }
    } catch (err) {
      console.error('Failed to refresh node:', err)
      error.value = err instanceof Error ? err.message : 'Failed to refresh node'
    }
  }

  function updateNodeInHierarchy(nodeId: string, updatedNode: HierarchyNode) {
    function updateInNodes(nodes: HierarchyNode[]): boolean {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].entity_id === nodeId) {
          nodes[i] = updatedNode
          return true
        }
        if (nodes[i].children && updateInNodes(nodes[i].children!)) {
          return true
        }
      }
      return false
    }

    updateInNodes(hierarchyData.value)
  }

  // Status-based styling helpers
  function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'done':
        return 'success'
      case 'in progress':
        return 'primary'
      case 'draft':
        return 'warning'
      case 'backlog':
        return 'info'
      case 'cancelled':
        return 'error'
      case 'active':
        return 'success'
      case 'obsolete':
        return 'error'
      default:
        return 'grey'
    }
  }

  function getEntityIcon(entityType: EntityType): string {
    switch (entityType) {
      case 'epic':
        return 'mdi-folder-multiple'
      case 'user_story':
        return 'mdi-book-open-variant'
      case 'acceptance_criteria':
        return 'mdi-check-circle-outline'
      case 'requirement':
        return 'mdi-file-document-outline'
      default:
        return 'mdi-file-outline'
    }
  }

  // Initialize store
  function initialize() {
    loadHierarchy()
  }

  return {
    // State
    hierarchyData,
    loading,
    error,
    expandedNodes,

    // Computed
    flattenedNodes,

    // Actions
    loadHierarchy,
    toggleNodeExpansion,
    expandNode,
    collapseNode,
    isNodeExpanded,
    expandAll,
    collapseAll,
    findNode,
    findNodeByReference,
    getNodePath,
    getChildrenCount,
    hasChildren,
    getStatusColor,
    getEntityIcon,
    initialize,

    // API-specific actions
    loadEpicHierarchy,
    loadUserStoryHierarchy,
    loadEntityPath,
    refreshHierarchy,
    refreshNode,
    updateNodeInHierarchy,
  }
})
