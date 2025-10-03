import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createPinia, setActivePinia } from 'pinia'
import StatusSelector from '../StatusSelector.vue'
import { useConfigStore } from '@/stores/config'

const vuetify = createVuetify()

// Mock Vuetify components
const mockVSelect = {
  template: '<div class="v-select"><slot /></div>',
  props: [
    'modelValue',
    'items',
    'label',
    'placeholder',
    'rules',
    'errorMessages',
    'disabled',
    'loading',
    'clearable',
    'variant',
    'density',
    'itemTitle',
    'itemValue',
  ],
  emits: ['update:modelValue'],
}

const stubs = {
  'v-select': mockVSelect,
  'v-chip': { template: '<span class="v-chip"><slot /></span>' },
  'v-icon': { template: '<i class="v-icon"><slot /></i>' },
  'v-list-item': { template: '<div class="v-list-item"><slot /></div>' },
  'v-list-item-title': { template: '<div class="v-list-item-title"><slot /></div>' },
}

describe('StatusSelector', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(StatusSelector, {
      props: {
        entityType: 'epic',
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Check that the component renders without errors
    expect(wrapper.exists()).toBe(true)
  })

  it('shows correct status options for epic', () => {
    const wrapper = mount(StatusSelector, {
      props: {
        entityType: 'epic',
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    const configStore = useConfigStore()
    const epicOptions = configStore.epicStatusOptions

    expect(wrapper.vm.statusOptions).toEqual(epicOptions)
  })

  it('shows correct status options for user story', () => {
    const wrapper = mount(StatusSelector, {
      props: {
        entityType: 'user_story',
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    const configStore = useConfigStore()
    const userStoryOptions = configStore.userStoryStatusOptions

    expect(wrapper.vm.statusOptions).toEqual(userStoryOptions)
  })

  it('shows correct status options for requirement', () => {
    const wrapper = mount(StatusSelector, {
      props: {
        entityType: 'requirement',
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    const configStore = useConfigStore()
    const requirementOptions = configStore.requirementStatusOptions

    expect(wrapper.vm.statusOptions).toEqual(requirementOptions)
  })

  it('emits update:modelValue when selection changes', async () => {
    const wrapper = mount(StatusSelector, {
      props: {
        entityType: 'epic',
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    await wrapper.vm.handleUpdate('Draft')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Draft'])
  })

  it('provides helper functions', () => {
    const wrapper = mount(StatusSelector, {
      props: {
        entityType: 'epic',
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    expect(wrapper.vm.getStatusLabel('Draft')).toBe('Draft')
    expect(wrapper.vm.getStatusColor('Draft')).toBe('orange')
  })

  it('handles label correctly', () => {
    // Test with default label (should use props.label default value)
    const epicWrapper = mount(StatusSelector, {
      props: {
        entityType: 'epic',
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // When no custom label is provided, it should use the default 'Статус'
    expect(epicWrapper.vm.computedLabel).toBe('Статус')

    // Test with custom label
    const customLabelWrapper = mount(StatusSelector, {
      props: {
        entityType: 'epic',
        label: 'Custom Status Label',
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    expect(customLabelWrapper.vm.computedLabel).toBe('Custom Status Label')

    // Test that different entity types work correctly
    const userStoryWrapper = mount(StatusSelector, {
      props: {
        entityType: 'user_story',
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Test that the component renders correctly for different entity types
    expect(userStoryWrapper.exists()).toBe(true)
    expect(userStoryWrapper.vm.computedLabel).toBe('Статус')
  })
})
