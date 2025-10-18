/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import EpicToolbar from '../EpicToolbar.vue'
import { epicService } from '@/services/epic-service'
import type { Epic, User, WorkflowStatus, Priority } from '@/types'

// Mock services
vi.mock('@/services/epic-service', () => ({
  epicService: {
    changeStatus: vi.fn(),
    update: vi.fn(),
    assign: vi.fn(),
  },
}))

// Mock focus method for selectRef
const mockFocus = vi.fn()

// Mock components to avoid complex rendering
const globalStubs = {
  WorkflowStatusChip: {
    template: '<div class="workflow-status-chip-stub" />',
    props: ['status', 'size', 'loading'],
    emits: ['status-change', 'error'],
  },
  PriorityChip: {
    template: '<div class="priority-chip-stub" />',
    props: ['priority', 'size', 'variant', 'loading'],
    emits: ['priority-change', 'error'],
  },
  EpicSteeringDocumentsDialog: {
    template: '<div class="epic-steering-documents-dialog-stub" />',
    props: ['modelValue', 'epic'],
    emits: ['update:modelValue', 'documents-updated'],
  },
  'v-chip': {
    template: '<div class="v-chip-stub"><slot /></div>',
    props: ['color', 'size', 'loading', 'class', 'rounded'],
  },
  'v-select': {
    template: '<div class="v-select-stub" />',
    props: [
      'modelValue',
      'items',
      'item-title',
      'item-value',
      'variant',
      'density',
      'hide-details',
      'style',
      'loading',
    ],
    emits: ['update:modelValue', 'blur'],
    methods: {
      focus: mockFocus,
    },
  },
  'v-btn': {
    template: '<button class="v-btn-stub"><slot /></button>',
    props: ['color', 'variant', 'size', 'prepend-icon', 'class', 'rounded'],
    emits: ['click'],
  },
  'v-icon': true,
}

describe('EpicToolbar', () => {
  const mockEpic: Epic = {
    id: '1',
    reference_id: 'EPIC-001',
    title: 'Test Epic',
    description: 'Test Description',
    status: 'Draft',
    priority: 3, // Medium priority
    assignee_id: undefined,
    creator_id: 'user1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  const mockUser: User = {
    id: 'user1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'User' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  const createWrapper = (props = {}) => {
    return mount(EpicToolbar, {
      props: {
        epic: mockEpic,
        ...props,
      },
      global: {
        stubs: globalStubs,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFocus.mockClear()
  })

  describe('Component Rendering', () => {
    it('renders successfully with required props', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('renders all toolbar components', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('.workflow-status-chip-stub').exists()).toBe(true)
      expect(wrapper.find('.priority-chip-stub').exists()).toBe(true)
      expect(wrapper.find('.v-chip-stub').exists()).toBe(true) // Assignee chip
    })

    it('renders Steering Documents button', () => {
      const wrapper = createWrapper()

      const steeringButton = wrapper.find('.v-btn-stub')
      expect(steeringButton.exists()).toBe(true)
      expect(steeringButton.text()).toContain('Steering Documents')
    })

    it('renders EpicSteeringDocumentsDialog component', () => {
      const wrapper = createWrapper()

      const dialog = wrapper.find('.epic-steering-documents-dialog-stub')
      expect(dialog.exists()).toBe(true)
    })
  })

  describe('Steering Documents Integration', () => {
    it('passes epic prop to EpicSteeringDocumentsDialog', () => {
      const wrapper = createWrapper()

      const dialog = wrapper.find('.epic-steering-documents-dialog-stub')
      expect(dialog.exists()).toBe(true)

      // Check that the dialog component receives the epic prop through the component instance
      const vm = wrapper.vm as any
      expect(vm.epic).toEqual(mockEpic)
    })

    it('opens steering documents dialog when button is clicked', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      // Initially dialog should be closed
      expect(vm.steeringDocumentsDialogOpen).toBe(false)

      // Click the steering documents button
      await vm.showSteeringDocumentsDialog()

      expect(vm.steeringDocumentsDialogOpen).toBe(true)
    })

    it('binds dialog visibility to steeringDocumentsDialogOpen state', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      const dialog = wrapper.find('.epic-steering-documents-dialog-stub')
      expect(dialog.exists()).toBe(true)

      // Initially closed
      expect(vm.steeringDocumentsDialogOpen).toBe(false)

      // Open dialog
      vm.steeringDocumentsDialogOpen = true
      await nextTick()

      expect(vm.steeringDocumentsDialogOpen).toBe(true)
    })

    it('emits documentsUpdated event when dialog emits documents-updated', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      // Call the handler directly to test the event emission
      vm.handleDocumentsUpdated()
      await nextTick()

      expect(wrapper.emitted('documentsUpdated')).toBeTruthy()
    })

    it('handles documents updated event correctly', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      // Call the handler directly
      vm.handleDocumentsUpdated()
      await nextTick()

      expect(wrapper.emitted('documentsUpdated')).toBeTruthy()
    })
  })

  describe('Status Management', () => {
    it('initializes with epic status', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      expect(vm.localStatus).toBe('Draft')
    })

    it('updates local status when epic prop changes', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      const updatedEpic = { ...mockEpic, status: 'In Progress' as WorkflowStatus }
      await wrapper.setProps({ epic: updatedEpic })

      expect(vm.localStatus).toBe('In Progress')
    })

    it('calls epicService.changeStatus when status is updated', async () => {
      const mockUpdatedEpic = { ...mockEpic, status: 'In Progress' as WorkflowStatus }
      vi.mocked(epicService.changeStatus).mockResolvedValue(mockUpdatedEpic)

      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      await vm.updateStatus('In Progress')

      expect(epicService.changeStatus).toHaveBeenCalledWith('1', 'In Progress')
      expect(wrapper.emitted('updated')).toBeTruthy()
      expect(wrapper.emitted('updated')?.[0]).toEqual([mockUpdatedEpic])
    })

    it('handles status update errors', async () => {
      const error = new Error('Status update failed')
      vi.mocked(epicService.changeStatus).mockRejectedValue(error)

      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      await expect(vm.updateStatus('In Progress')).rejects.toThrow('Status update failed')
      expect(vm.localStatus).toBe('Draft') // Should revert to original
    })
  })

  describe('Priority Management', () => {
    it('initializes with epic priority', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      expect(vm.localPriority).toBe(3)
    })

    it('updates local priority when epic prop changes', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      const updatedEpic = { ...mockEpic, priority: 2 as Priority } // High priority
      await wrapper.setProps({ epic: updatedEpic })

      expect(vm.localPriority).toBe(2)
    })

    it('calls epicService.update when priority is updated', async () => {
      const mockUpdatedEpic = { ...mockEpic, priority: 2 as Priority } // High priority
      vi.mocked(epicService.update).mockResolvedValue(mockUpdatedEpic)

      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      await vm.updatePriority(2)

      expect(epicService.update).toHaveBeenCalledWith('1', { priority: 2 })
      expect(wrapper.emitted('updated')).toBeTruthy()
      expect(wrapper.emitted('updated')?.[0]).toEqual([mockUpdatedEpic])
    })

    it('handles priority update errors', async () => {
      const error = new Error('Priority update failed')
      vi.mocked(epicService.update).mockRejectedValue(error)

      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      await expect(vm.updatePriority(2)).rejects.toThrow('Priority update failed')
      expect(vm.localPriority).toBe(3) // Should revert to original
    })
  })

  describe('Assignee Management', () => {
    it('initializes with epic assignee_id', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      expect(vm.localAssigneeId).toBe(null)
    })

    it('updates local assignee when epic prop changes', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      const updatedEpic = { ...mockEpic, assignee_id: 'user2', assignee: mockUser }
      await wrapper.setProps({ epic: updatedEpic })

      expect(vm.localAssigneeId).toBe('user2')
    })

    it('calls epicService.assign when assignee is updated', async () => {
      const mockUpdatedEpic = { ...mockEpic, assignee_id: 'user2', assignee: mockUser }
      vi.mocked(epicService.assign).mockResolvedValue(mockUpdatedEpic)

      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      await vm.updateAssignee('user2')

      expect(epicService.assign).toHaveBeenCalledWith('1', 'user2')
      expect(wrapper.emitted('updated')).toBeTruthy()
    })

    it('handles assignee update errors', async () => {
      const error = new Error('Assignee update failed')
      vi.mocked(epicService.assign).mockRejectedValue(error)

      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      // Set initial assignee
      vm.localAssigneeId = 'user2'

      try {
        await vm.updateAssignee('user3')
      } catch {
        // Expected to throw
      }

      expect(vm.localAssigneeId).toBe(null) // Should revert to original
    })
  })

  describe('User Management', () => {
    it('loads users on mount', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      // loadUsers is called in onMounted, check that users array is initialized
      expect(Array.isArray(vm.users)).toBe(true)
    })

    it('generates correct assignee options', () => {
      const epicWithCreator = {
        ...mockEpic,
        creator: mockUser,
      }

      const wrapper = createWrapper({ epic: epicWithCreator })
      const vm = wrapper.vm as any

      // Manually set users to test computed property
      vm.users = [mockUser]

      const options = vm.assigneeOptions
      expect(options).toHaveLength(2) // "Не назначен" + 1 user
      expect(options[0]).toEqual({ text: 'Не назначен', value: null })
      expect(options[1]).toEqual({ text: 'testuser', value: 'user1' })
    })

    it('returns correct assignee text', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      // Set up users and assignee
      vm.users = [mockUser]
      vm.localAssigneeId = 'user1'

      expect(vm.getAssigneeText()).toBe('testuser')

      // Test unassigned case
      vm.localAssigneeId = null
      expect(vm.getAssigneeText()).toBe('Не назначен')
    })
  })

  describe('Dropdown Management', () => {
    it('toggles assignee dropdown visibility', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      expect(vm.showAssigneeDropdown).toBe(false)

      // Mock the assigneeSelectRef to have a focus method
      vm.assigneeSelectRef = { focus: mockFocus }

      await vm.toggleAssigneeDropdown()
      expect(vm.showAssigneeDropdown).toBe(true)
      expect(mockFocus).toHaveBeenCalled()
    })

    it('hides assignee dropdown', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      vm.showAssigneeDropdown = true
      vm.hideAssigneeDropdown()

      expect(vm.showAssigneeDropdown).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('handles status error from WorkflowStatusChip', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Status error')

      vm.handleStatusError(error)

      expect(consoleSpy).toHaveBeenCalledWith('Status change error:', error)
      consoleSpy.mockRestore()
    })

    it('handles priority error from PriorityChip', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Priority error')

      vm.handlePriorityError(error)

      expect(consoleSpy).toHaveBeenCalledWith('Priority change error:', error)
      consoleSpy.mockRestore()
    })
  })
})
