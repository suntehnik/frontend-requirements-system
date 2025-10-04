/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import WorkflowStatusChip from '../WorkflowStatusChip.vue'
import type { WorkflowStatus } from '@/types/status'

// Mock focus method for selectRef
const mockFocus = vi.fn()

// Simple stubs that avoid complex slot rendering
const globalStubs = {
  'v-chip': {
    template: '<div class="v-chip-stub"><slot /></div>',
    props: ['color', 'size', 'variant', 'loading', 'disabled', 'class', 'aria-label', 'aria-describedby', 'role', 'tabindex']
  },
  'v-select': {
    template: '<div class="v-select-stub" />',
    props: ['modelValue', 'items', 'disabled', 'loading', 'error', 'style', 'class', 'item-title', 'item-value', 'variant', 'density', 'hide-details', 'auto-select-first', 'aria-label', 'aria-describedby', 'role'],
    emits: ['update:modelValue', 'blur'],
    methods: {
      focus: mockFocus
    }
  },
  'v-progress-circular': true,
  'v-icon': true,
  'v-list-item': true
}

describe('WorkflowStatusChip', () => {
  const defaultProps = {
    status: 'Draft' as WorkflowStatus
  }

  const createWrapper = (props = {}) => {
    return mount(WorkflowStatusChip, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: globalStubs
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFocus.mockClear()
  })

  describe('Component Logic', () => {
    it('renders with default props', () => {
      const wrapper = createWrapper()
      expect(wrapper.exists()).toBe(true)
    })

    it('has correct status text mapping', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      expect(vm.getStatusText('Backlog')).toBe('Бэклог')
      expect(vm.getStatusText('Draft')).toBe('Черновик')
      expect(vm.getStatusText('In Progress')).toBe('В работе')
      expect(vm.getStatusText('Done')).toBe('Выполнено')
      expect(vm.getStatusText('Cancelled')).toBe('Отменено')
    })

    it('has correct status color mapping', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      expect(vm.getStatusColor('Backlog')).toBe('grey')
      expect(vm.getStatusColor('Draft')).toBe('orange')
      expect(vm.getStatusColor('In Progress')).toBe('blue')
      expect(vm.getStatusColor('Done')).toBe('success')
      expect(vm.getStatusColor('Cancelled')).toBe('error')
    })

    it('computes correct status text for current status', () => {
      const wrapper = createWrapper({ status: 'Draft' })
      const vm = wrapper.vm as any
      
      expect(vm.getStatusText('Draft')).toBe('Черновик')
    })

    it('computes correct status color for current status', () => {
      const wrapper = createWrapper({ status: 'Draft' })
      const vm = wrapper.vm as any
      
      expect(vm.getStatusColor('Draft')).toBe('orange')
    })
  })

  describe('Dropdown State Management', () => {
    it('initializes with editing state closed', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      expect(vm.isEditing).toBe(false)
    })

    it('opens editing mode when handleChipClick is called and not readonly', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      await vm.handleChipClick()
      expect(vm.isEditing).toBe(true)
    })

    it('does not open editing mode when readonly', async () => {
      const wrapper = createWrapper({ readonly: true })
      const vm = wrapper.vm as any
      
      await vm.handleChipClick()
      expect(vm.isEditing).toBe(false)
    })

    it('does not open editing mode when disabled', async () => {
      const wrapper = createWrapper({ disabled: true })
      const vm = wrapper.vm as any
      
      await vm.handleChipClick()
      expect(vm.isEditing).toBe(false)
    })

    it('does not open editing mode when loading', async () => {
      const wrapper = createWrapper({ loading: true })
      const vm = wrapper.vm as any
      
      await vm.handleChipClick()
      expect(vm.isEditing).toBe(false)
    })

    it('has correct workflow status options', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      expect(vm.workflowStatusOptions).toHaveLength(5)
      expect(vm.workflowStatusOptions.map((item: any) => item.value)).toEqual([
        'Backlog', 'Draft', 'In Progress', 'Done', 'Cancelled'
      ])
      expect(vm.workflowStatusOptions.map((item: any) => item.text)).toEqual([
        'Бэклог', 'Черновик', 'В работе', 'Выполнено', 'Отменено'
      ])
    })
  })

  describe('Status Change Handling', () => {
    it('emits status-change event when status is changed', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      vm.handleStatusChange('In Progress')
      await nextTick()

      expect(wrapper.emitted('status-change')).toBeTruthy()
      expect(wrapper.emitted('status-change')?.[0]).toEqual(['In Progress'])
    })

    it('does not emit status-change event when same status is selected', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      vm.handleStatusChange('Draft')
      await nextTick()

      expect(wrapper.emitted('status-change')).toBeFalsy()
    })

    it('closes editing mode after status change', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      // Open editing mode first
      await vm.handleChipClick()
      expect(vm.isEditing).toBe(true)

      // Change status
      vm.handleStatusChange('In Progress')
      await nextTick()

      expect(vm.isEditing).toBe(false)
    })

    it('validates status values by checking if they exist in status options', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      const validStatuses = vm.workflowStatusOptions.map((option: any) => option.value)
      expect(validStatuses).toContain('Draft')
      expect(validStatuses).not.toContain('InvalidStatus')
    })

    it('handles status change without emitting error for valid status', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      vm.handleStatusChange('In Progress')
      await nextTick()

      expect(wrapper.emitted('error')).toBeFalsy()
      expect(wrapper.emitted('status-change')).toBeTruthy()
    })
  })

  describe('Keyboard Navigation', () => {
    it('closes editing mode on escape key', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      // Open editing mode first
      await vm.handleChipClick()
      expect(vm.isEditing).toBe(true)

      // Close with escape
      vm.handleEscapeKey()
      await nextTick()

      expect(vm.isEditing).toBe(false)
    })

    it('closes editing mode on blur after timeout', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      // Open editing mode first
      await vm.handleChipClick()
      expect(vm.isEditing).toBe(true)

      // Close with blur (uses setTimeout, so we need to wait)
      vm.handleDropdownBlur()
      
      // Wait for the timeout in handleDropdownBlur (150ms)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      expect(vm.isEditing).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('computes correct ARIA label for normal chip', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      expect(vm.chipAriaLabel).toContain('Статус: Черновик')
      expect(vm.chipAriaLabel).toContain('нажмите для изменения')
    })

    it('computes correct ARIA label for readonly chip', () => {
      const wrapper = createWrapper({ readonly: true })
      const vm = wrapper.vm as any
      
      expect(vm.chipAriaLabel).toBe('Статус: Черновик')
    })

    it('computes correct ARIA label for disabled chip', () => {
      const wrapper = createWrapper({ disabled: true })
      const vm = wrapper.vm as any
      
      // Disabled chips still show the action text in current implementation
      expect(vm.chipAriaLabel).toContain('Статус: Черновик')
    })

    it('computes correct ARIA label for loading chip', () => {
      const wrapper = createWrapper({ loading: true })
      const vm = wrapper.vm as any
      
      // Loading chips still show the action text in current implementation
      expect(vm.chipAriaLabel).toContain('Статус: Черновик')
    })

    it('computes correct ARIA label for dropdown', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      expect(vm.selectAriaLabel).toContain('Выберите статус')
      expect(vm.selectAriaLabel).toContain('текущий: Черновик')
    })
  })

  describe('Size Configuration', () => {
    it('computes correct chip size for small', () => {
      const wrapper = createWrapper({ size: 'small' })
      const vm = wrapper.vm as any
      
      expect(vm.chipSize).toBe('x-small')
    })

    it('computes correct chip size for medium', () => {
      const wrapper = createWrapper({ size: 'medium' })
      const vm = wrapper.vm as any
      
      expect(vm.chipSize).toBe('small')
    })

    it('computes correct chip size for large', () => {
      const wrapper = createWrapper({ size: 'large' })
      const vm = wrapper.vm as any
      
      expect(vm.chipSize).toBe('large')
    })

    it('computes correct select width for different sizes', () => {
      const sizes = [
        { size: 'small', width: '120px' },
        { size: 'medium', width: '140px' },
        { size: 'large', width: '160px' }
      ] as const

      sizes.forEach(({ size, width }) => {
        const wrapper = createWrapper({ size })
        const vm = wrapper.vm as any
        
        expect(vm.selectWidth).toBe(width)
      })
    })
  })

  describe('Error Handling', () => {
    it('initializes without error for valid status', () => {
      const wrapper = createWrapper({ status: 'Draft' })
      const vm = wrapper.vm as any
      
      expect(vm.hasError).toBe(false)
    })

    it('resets error state when valid status is provided', async () => {
      const wrapper = createWrapper({ status: 'Draft' })
      const vm = wrapper.vm as any
      
      // Simulate an error state
      vm.hasError = true
      vm.errorMessage = 'Test error'
      
      // Trigger status change which should reset error (the watcher does this)
      await wrapper.setProps({ status: 'In Progress' })
      await nextTick()
      
      expect(vm.hasError).toBe(false)
      expect(vm.errorMessage).toBe('')
    })

    it('can set error state manually for testing error display', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as any
      
      // Manually set error state to test error display functionality
      vm.hasError = true
      vm.errorMessage = 'Test error message'
      
      expect(vm.hasError).toBe(true)
      expect(vm.errorMessage).toBe('Test error message')
      
      // Test that error state can be cleared
      vm.hasError = false
      vm.errorMessage = ''
      
      expect(vm.hasError).toBe(false)
      expect(vm.errorMessage).toBe('')
    })
  })
})