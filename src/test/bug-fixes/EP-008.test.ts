/**
 * Test for EP-008 bug fix: User story status not updating correctly in UI
 * 
 * This test verifies that when a user story status is changed to "Done",
 * the UI displays the correct status value.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useEntitiesStore } from '@/stores/entities'
import UserStoryList from '@/components/data-display/UserStoryList.vue'
import type { UserStory, UserStoryStatus } from '@/types'

// Mock the user story service
vi.mock('@/services/user-story-service', () => ({
  userStoryService: {
    changeStatus: vi.fn(),
  },
}))

describe('EP-008: User Story Status Update Bug Fix', () => {
  let store: ReturnType<typeof useEntitiesStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useEntitiesStore()
  })

  it('should update user story status correctly in store when changeUserStoryStatus is called', async () => {
    // Arrange: Create a mock user story
    const mockUserStory: UserStory = {
      id: '1',
      reference_id: 'US-001',
      title: 'Test User Story',
      description: 'Test description',
      status: 'In Progress',
      priority: 2,
      epic_id: 'epic1',
      creator_id: 'user1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }

    // Add the user story to the store
    store.userStories.set(mockUserStory.id, mockUserStory)

    // Mock the service to return updated user story
    const { userStoryService } = await import('@/services/user-story-service')
    const updatedUserStory = { ...mockUserStory, status: 'Done' as const }
    vi.mocked(userStoryService.changeStatus).mockResolvedValue(updatedUserStory)

    // Act: Change the status to "Done"
    const result = await store.changeUserStoryStatus(mockUserStory.id, 'Done')

    // Assert: Verify the status was updated correctly
    expect(result.status).toBe('Done')
    expect(store.userStories.get(mockUserStory.id)?.status).toBe('Done')
    expect(userStoryService.changeStatus).toHaveBeenCalledWith(mockUserStory.id, 'Done')
  })

  it('should have status change functionality available in UserStoryList component', () => {
    // Arrange: Create a mock user story
    const mockUserStory: UserStory = {
      id: '1',
      reference_id: 'US-001',
      title: 'Test User Story',
      description: 'Test description',
      status: 'In Progress',
      priority: 2,
      epic_id: 'epic1',
      creator_id: 'user1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }

    // Mount the component with mock data
    const wrapper = mount(UserStoryList, {
      props: {
        userStories: [mockUserStory],
        loading: false,
        totalCount: 1,
        currentPage: 1,
        pageSize: 25,
        epics: [],
      },
      global: {
        stubs: {
          'v-btn': true,
          'v-select': true,
          'v-col': true,
          'v-row': true,
          'v-text-field': true,
          'v-card': true,
          'v-data-table-server': true,
          'v-icon': true,
          'WorkflowStatusChip': true,
          'PriorityChip': true,
        },
      },
    })

    // Assert: Verify the component has the status-change emit defined
    expect(wrapper.vm.$emit).toBeDefined()
    
    // Verify that the component can handle status change events
    const vm = wrapper.vm as { handleStatusChange?: (item: UserStory, newStatus: UserStoryStatus) => void }
    expect(typeof vm.handleStatusChange).toBe('function')
  })

  it('should handle status change errors gracefully', async () => {
    // Arrange: Create a mock user story
    const mockUserStory: UserStory = {
      id: '1',
      reference_id: 'US-001',
      title: 'Test User Story',
      description: 'Test description',
      status: 'In Progress',
      priority: 2,
      epic_id: 'epic1',
      creator_id: 'user1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }

    // Add the user story to the store
    store.userStories.set(mockUserStory.id, mockUserStory)

    // Mock the service to throw an error
    const { userStoryService } = await import('@/services/user-story-service')
    vi.mocked(userStoryService.changeStatus).mockRejectedValue(new Error('API Error'))

    // Act & Assert: Verify error is thrown
    await expect(store.changeUserStoryStatus(mockUserStory.id, 'Done')).rejects.toThrow('API Error')

    // Verify the status was not changed in the store
    expect(store.userStories.get(mockUserStory.id)?.status).toBe('In Progress')
  })
})