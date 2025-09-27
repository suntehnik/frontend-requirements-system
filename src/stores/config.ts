import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { configService } from '@/services/config-service'
import { authService } from '@/services/auth-service'
import type {
  RequirementType,
  RelationshipType,
  StatusModel,
  User,
  EntityType,
  EpicStatus,
  UserStoryStatus,
  RequirementStatus,
} from '@/types'

export const useConfigStore = defineStore('config', () => {
  // State
  const requirementTypes = ref<RequirementType[]>([])
  const relationshipTypes = ref<RelationshipType[]>([])
  const statusModels = ref<StatusModel[]>([])
  const users = ref<User[]>([])
  
  // Loading states
  const loadingRequirementTypes = ref(false)
  const loadingRelationshipTypes = ref(false)
  const loadingStatusModels = ref(false)
  const loadingUsers = ref(false)
  
  // Error states
  const requirementTypesError = ref<string | null>(null)
  const relationshipTypesError = ref<string | null>(null)
  const statusModelsError = ref<string | null>(null)
  const usersError = ref<string | null>(null)

  // Computed
  const isLoading = computed(() => 
    loadingRequirementTypes.value || 
    loadingRelationshipTypes.value || 
    loadingStatusModels.value || 
    loadingUsers.value
  )

  // Status options for different entity types
  const epicStatusOptions = computed(() => [
    { value: 'Backlog' as EpicStatus, label: 'Backlog', color: 'grey' },
    { value: 'Draft' as EpicStatus, label: 'Draft', color: 'orange' },
    { value: 'In Progress' as EpicStatus, label: 'In Progress', color: 'blue' },
    { value: 'Done' as EpicStatus, label: 'Done', color: 'green' },
    { value: 'Cancelled' as EpicStatus, label: 'Cancelled', color: 'red' },
  ])

  const userStoryStatusOptions = computed(() => [
    { value: 'Backlog' as UserStoryStatus, label: 'Backlog', color: 'grey' },
    { value: 'Draft' as UserStoryStatus, label: 'Draft', color: 'orange' },
    { value: 'In Progress' as UserStoryStatus, label: 'In Progress', color: 'blue' },
    { value: 'Done' as UserStoryStatus, label: 'Done', color: 'green' },
    { value: 'Cancelled' as UserStoryStatus, label: 'Cancelled', color: 'red' },
  ])

  const requirementStatusOptions = computed(() => [
    { value: 'Draft' as RequirementStatus, label: 'Draft', color: 'orange' },
    { value: 'Active' as RequirementStatus, label: 'Active', color: 'green' },
    { value: 'Obsolete' as RequirementStatus, label: 'Obsolete', color: 'grey' },
  ])

  // Actions
  async function fetchRequirementTypes(): Promise<void> {
    if (loadingRequirementTypes.value) return

    loadingRequirementTypes.value = true
    requirementTypesError.value = null

    try {
      const response = await configService.getRequirementTypes()
      requirementTypes.value = response.requirement_types
    } catch (error) {
      requirementTypesError.value = error instanceof Error ? error.message : 'Failed to load requirement types'
      console.error('Failed to fetch requirement types:', error)
    } finally {
      loadingRequirementTypes.value = false
    }
  }

  async function fetchRelationshipTypes(): Promise<void> {
    if (loadingRelationshipTypes.value) return

    loadingRelationshipTypes.value = true
    relationshipTypesError.value = null

    try {
      const response = await configService.getRelationshipTypes()
      relationshipTypes.value = response.relationship_types
    } catch (error) {
      relationshipTypesError.value = error instanceof Error ? error.message : 'Failed to load relationship types'
      console.error('Failed to fetch relationship types:', error)
    } finally {
      loadingRelationshipTypes.value = false
    }
  }

  async function fetchStatusModels(): Promise<void> {
    if (loadingStatusModels.value) return

    loadingStatusModels.value = true
    statusModelsError.value = null

    try {
      const response = await configService.getStatusModels()
      statusModels.value = response.status_models
    } catch (error) {
      statusModelsError.value = error instanceof Error ? error.message : 'Failed to load status models'
      console.error('Failed to fetch status models:', error)
    } finally {
      loadingStatusModels.value = false
    }
  }

  async function fetchUsers(): Promise<void> {
    if (loadingUsers.value) return

    loadingUsers.value = true
    usersError.value = null

    try {
      const userList = await authService.getUsers()
      users.value = userList
    } catch (error) {
      usersError.value = error instanceof Error ? error.message : 'Failed to load users'
      console.error('Failed to fetch users:', error)
    } finally {
      loadingUsers.value = false
    }
  }

  async function fetchAllConfig(): Promise<void> {
    await Promise.all([
      fetchRequirementTypes(),
      fetchRelationshipTypes(),
      fetchStatusModels(),
      fetchUsers(),
    ])
  }

  function getStatusOptions(entityType: EntityType) {
    switch (entityType) {
      case 'epic':
        return epicStatusOptions.value
      case 'user_story':
        return userStoryStatusOptions.value
      case 'requirement':
        return requirementStatusOptions.value
      case 'acceptance_criteria':
        // Acceptance criteria don't have status in the current API
        return []
      default:
        return []
    }
  }

  function getUserById(id: string): User | undefined {
    return users.value.find(user => user.id === id)
  }

  function getRequirementTypeById(id: string): RequirementType | undefined {
    return requirementTypes.value.find(type => type.id === id)
  }

  function getRelationshipTypeById(id: string): RelationshipType | undefined {
    return relationshipTypes.value.find(type => type.id === id)
  }

  // Clear all data (useful for logout)
  function clearAll(): void {
    requirementTypes.value = []
    relationshipTypes.value = []
    statusModels.value = []
    users.value = []
    
    requirementTypesError.value = null
    relationshipTypesError.value = null
    statusModelsError.value = null
    usersError.value = null
  }

  return {
    // State
    requirementTypes,
    relationshipTypes,
    statusModels,
    users,
    
    // Loading states
    loadingRequirementTypes,
    loadingRelationshipTypes,
    loadingStatusModels,
    loadingUsers,
    isLoading,
    
    // Error states
    requirementTypesError,
    relationshipTypesError,
    statusModelsError,
    usersError,
    
    // Computed
    epicStatusOptions,
    userStoryStatusOptions,
    requirementStatusOptions,
    
    // Actions
    fetchRequirementTypes,
    fetchRelationshipTypes,
    fetchStatusModels,
    fetchUsers,
    fetchAllConfig,
    getStatusOptions,
    getUserById,
    getRequirementTypeById,
    getRelationshipTypeById,
    clearAll,
  }
})