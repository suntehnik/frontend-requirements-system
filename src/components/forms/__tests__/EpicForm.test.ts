import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import EpicForm from '../EpicForm.vue'
import type { Epic, CreateEpicRequest } from '@/types'

// Mock the form components
vi.mock('../PrioritySelector.vue', () => ({
  default: {
    name: 'PrioritySelector',
    template: '<div data-testid="priority-selector"><input v-model="modelValue" /></div>',
    props: ['modelValue', 'label', 'variant', 'rules', 'required'],
    emits: ['update:modelValue'],
  },
}))

vi.mock('../StatusSelector.vue', () => ({
  default: {
    name: 'StatusSelector',
    template: '<div data-testid="status-selector"><input v-model="modelValue" /></div>',
    props: ['modelValue', 'label', 'variant', 'entityType', 'disabled'],
    emits: ['update:modelValue'],
  },
}))

vi.mock('../UserSelector.vue', () => ({
  default: {
    name: 'UserSelector',
    template: '<div data-testid="user-selector"><input v-model="modelValue" /></div>',
    props: ['modelValue', 'label', 'variant', 'clearable', 'placeholder'],
    emits: ['update:modelValue'],
  },
}))

const vuetify = createVuetify()
const pinia = createPinia()

const mockEpic: Epic = {
  id: '1',
  reference_id: 'EP-001',
  title: 'Test Epic',
  description: 'Test Description',
  status: 'Draft',
  priority: 2,
  creator_id: 'user1',
  assignee_id: 'user2',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('EpicForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render create form when no epic is provided', () => {
    const wrapper = mount(EpicForm, {
      global: {
        plugins: [vuetify, pinia],
      },
    })

    expect(wrapper.find('.text-h5').text()).toBe('Создать эпик')
    // Test that the form shows create mode by checking the submit button text
    expect(wrapper.find('[type="submit"]').text()).toBe('Создать')
  })

  it('should render edit form when epic is provided', () => {
    const wrapper = mount(EpicForm, {
      props: {
        epic: mockEpic,
      },
      global: {
        plugins: [vuetify, pinia],
      },
    })

    expect(wrapper.find('.text-h5').text()).toBe('Редактировать эпик')
    // Test that the form shows edit mode by checking the submit button text
    expect(wrapper.find('[type="submit"]').text()).toBe('Сохранить')
    // Test that status selector is present in edit mode
    expect(wrapper.findComponent({ name: 'StatusSelector' }).exists()).toBe(true)
  })

  it('should emit submit event with form data', async () => {
    const wrapper = mount(EpicForm, {
      global: {
        plugins: [vuetify, pinia],
      },
    })

    // Set form data directly on the component
    const vm = wrapper.vm as typeof wrapper.vm & {
      form: { title: string; description: string; priority: number }
      isValid: boolean
      formRef: { validate: () => Promise<{ valid: boolean }> }
      handleSubmit: () => Promise<void>
    }
    vm.form.title = 'New Epic'
    vm.form.description = 'New Description'
    vm.form.priority = 2
    vm.isValid = true

    // Mock the formRef.validate method
    vm.formRef = {
      validate: vi.fn().mockResolvedValue({ valid: true })
    }

    // Call handleSubmit directly
    await vm.handleSubmit()

    expect(wrapper.emitted('submit')).toBeTruthy()
    const submitEvent = wrapper.emitted('submit')?.[0]?.[0] as CreateEpicRequest
    expect(submitEvent.title).toBe('New Epic')
    expect(submitEvent.description).toBe('New Description')
  })

  it('should emit cancel event when cancel button is clicked', async () => {
    const wrapper = mount(EpicForm, {
      global: {
        plugins: [vuetify, pinia],
      },
    })

    await wrapper.find('[data-testid="cancel-button"]').trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('should validate required fields', async () => {
    const wrapper = mount(EpicForm, {
      global: {
        plugins: [vuetify, pinia],
      },
    })

    // Set form as invalid
    const vm = wrapper.vm as typeof wrapper.vm & {
      isValid: boolean
      formRef: { validate: () => Promise<{ valid: boolean }> }
      handleSubmit: () => Promise<void>
    }
    vm.isValid = false

    // Mock the formRef.validate method to return invalid
    vm.formRef = {
      validate: vi.fn().mockResolvedValue({ valid: false })
    }

    // Try to call handleSubmit directly
    await vm.handleSubmit()

    // Should not emit submit event due to validation
    expect(wrapper.emitted('submit')).toBeFalsy()
  })

  it('should show loading state', () => {
    const wrapper = mount(EpicForm, {
      props: {
        loading: true,
      },
      global: {
        plugins: [vuetify, pinia],
      },
    })

    const submitButton = wrapper.find('[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('should emit status-change event when status is changed in edit mode', async () => {
    const wrapper = mount(EpicForm, {
      props: {
        epic: mockEpic,
      },
      global: {
        plugins: [vuetify, pinia],
      },
    })

    // Simulate status change
    const statusSelector = wrapper.findComponent({ name: 'StatusSelector' })
    await statusSelector.vm.$emit('update:modelValue', 'In Progress')

    expect(wrapper.emitted('status-change')).toBeTruthy()
    const statusChangeEvent = wrapper.emitted('status-change')?.[0]
    expect(statusChangeEvent?.[0]).toBe('1') // epic id
    expect(statusChangeEvent?.[1]).toBe('In Progress') // new status
  })
})