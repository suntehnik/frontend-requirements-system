import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { EntityType, SearchResult, EntityPath } from '@/types'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  timeout?: number
  persistent?: boolean
}

export interface SelectedEntity {
  type: EntityType
  id: string
}

export const useUIStore = defineStore('ui', () => {
  // State
  const sidebarCollapsed = ref(false)
  const selectedEntity = ref<SelectedEntity | null>(null)
  const searchQuery = ref('')
  const searchResults = ref<SearchResult[]>([])
  const hierarchyExpanded = ref<Record<string, boolean>>({})
  const notifications = ref<Notification[]>([])
  const currentPath = ref<EntityPath[]>([])
  const loading = ref<Record<string, boolean>>({})

  // Computed
  const hasNotifications = computed(() => notifications.value.length > 0)
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.persistent)
  )

  // Sidebar actions
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    // Save to localStorage for persistence
    localStorage.setItem('sidebar-collapsed', sidebarCollapsed.value.toString())
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
    localStorage.setItem('sidebar-collapsed', collapsed.toString())
  }

  // Entity selection actions
  function selectEntity(type: EntityType, id: string) {
    selectedEntity.value = { type, id }
  }

  function clearSelection() {
    selectedEntity.value = null
  }

  // Search actions
  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setSearchResults(results: SearchResult[]) {
    searchResults.value = results
  }

  function clearSearch() {
    searchQuery.value = ''
    searchResults.value = []
  }

  // Hierarchy actions
  function toggleHierarchyNode(nodeId: string) {
    hierarchyExpanded.value[nodeId] = !hierarchyExpanded.value[nodeId]
    // Save to localStorage for persistence
    localStorage.setItem('hierarchy-expanded', JSON.stringify(hierarchyExpanded.value))
  }

  function setHierarchyExpanded(nodeId: string, expanded: boolean) {
    hierarchyExpanded.value[nodeId] = expanded
    localStorage.setItem('hierarchy-expanded', JSON.stringify(hierarchyExpanded.value))
  }

  function isHierarchyExpanded(nodeId: string): boolean {
    return hierarchyExpanded.value[nodeId] ?? false
  }

  // Notification actions
  function addNotification(notification: Omit<Notification, 'id'>) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      id,
      timeout: 5000, // Default 5 seconds
      ...notification,
    }

    notifications.value.push(newNotification)

    // Auto-remove notification after timeout (unless persistent)
    if (!newNotification.persistent && newNotification.timeout) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.timeout)
    }

    return id
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clearAllNotifications() {
    notifications.value = []
  }

  // Success notification helper
  function showSuccess(title: string, message?: string) {
    return addNotification({
      type: 'success',
      title,
      message,
    })
  }

  // Error notification helper
  function showError(title: string, message?: string, persistent = false) {
    return addNotification({
      type: 'error',
      title,
      message,
      persistent,
      timeout: persistent ? undefined : 8000, // Longer timeout for errors
    })
  }

  // Warning notification helper
  function showWarning(title: string, message?: string) {
    return addNotification({
      type: 'warning',
      title,
      message,
      timeout: 6000,
    })
  }

  // Info notification helper
  function showInfo(title: string, message?: string) {
    return addNotification({
      type: 'info',
      title,
      message,
    })
  }

  // Breadcrumb actions
  function setCurrentPath(path: EntityPath[]) {
    currentPath.value = path
  }

  function clearCurrentPath() {
    currentPath.value = []
  }

  // Loading state actions
  function setLoading(key: string, value: boolean) {
    if (value) {
      loading.value[key] = true
    } else {
      delete loading.value[key]
    }
  }

  function isLoading(key: string): boolean {
    return loading.value[key] ?? false
  }

  function clearAllLoading() {
    loading.value = {}
  }

  // Initialize UI state from localStorage
  function initializeUI() {
    try {
      // Restore sidebar state
      const sidebarState = localStorage.getItem('sidebar-collapsed')
      if (sidebarState !== null) {
        sidebarCollapsed.value = sidebarState === 'true'
      }

      // Restore hierarchy expanded state
      const hierarchyState = localStorage.getItem('hierarchy-expanded')
      if (hierarchyState) {
        hierarchyExpanded.value = JSON.parse(hierarchyState)
      }
    } catch (error) {
      console.warn('Failed to initialize UI state from localStorage:', error)
    }
  }

  // Mobile detection
  const isMobile = computed(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  })

  // Responsive sidebar behavior
  const shouldCollapseSidebar = computed(() => {
    return isMobile.value || sidebarCollapsed.value
  })

  return {
    // State
    sidebarCollapsed,
    selectedEntity,
    searchQuery,
    searchResults,
    hierarchyExpanded,
    notifications,
    currentPath,
    loading,

    // Computed
    hasNotifications,
    unreadNotifications,
    isMobile,
    shouldCollapseSidebar,

    // Sidebar actions
    toggleSidebar,
    setSidebarCollapsed,

    // Entity selection actions
    selectEntity,
    clearSelection,

    // Search actions
    setSearchQuery,
    setSearchResults,
    clearSearch,

    // Hierarchy actions
    toggleHierarchyNode,
    setHierarchyExpanded,
    isHierarchyExpanded,

    // Notification actions
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // Breadcrumb actions
    setCurrentPath,
    clearCurrentPath,

    // Loading actions
    setLoading,
    isLoading,
    clearAllLoading,

    // Initialization
    initializeUI,
  }
})