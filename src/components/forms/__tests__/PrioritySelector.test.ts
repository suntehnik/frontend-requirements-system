import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import PrioritySelector from '../PrioritySelector.vue'

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

describe('PrioritySelector', () => {
  it('renders correctly', () => {
    const wrapper = mount(PrioritySelector, {
      global: {
        plugins: [vuetify],
        stubs: {
          'v-select': mockVSelect,
          'v-chip': { template: '<span class="v-chip"><slot /></span>' },
          'v-list-item': { template: '<div class="v-list-item"><slot /></div>' },
          'v-list-item-title': { template: '<div class="v-list-item-title"><slot /></div>' },
          'v-list-item-subtitle': { template: '<div class="v-list-item-subtitle"><slot /></div>' },
        },
      },
    })

    expect(wrapper.find('.v-select').exists()).toBe(true)
  })

  it('has correct priority options', () => {
    const wrapper = mount(PrioritySelector, {
      global: {
        plugins: [vuetify],
        stubs: {
          'v-select': mockVSelect,
          'v-chip': { template: '<span class="v-chip"><slot /></span>' },
          'v-list-item': { template: '<div class="v-list-item"><slot /></div>' },
          'v-list-item-title': { template: '<div class="v-list-item-title"><slot /></div>' },
          'v-list-item-subtitle': { template: '<div class="v-list-item-subtitle"><slot /></div>' },
        },
      },
    })

    const priorityOptions = wrapper.vm.priorityOptions
    expect(priorityOptions).toHaveLength(4)

    expect(priorityOptions[0]).toEqual({
      value: 1,
      label: 'Критический',
      description: 'Требует немедленного внимания',
      color: 'red',
    })

    expect(priorityOptions[3]).toEqual({
      value: 4,
      label: 'Низкий',
      description: 'Может быть отложена',
      color: 'green',
    })
  })

  it('emits update:modelValue when selection changes', async () => {
    const wrapper = mount(PrioritySelector, {
      global: {
        plugins: [vuetify],
        stubs: {
          'v-select': mockVSelect,
          'v-chip': { template: '<span class="v-chip"><slot /></span>' },
          'v-list-item': { template: '<div class="v-list-item"><slot /></div>' },
          'v-list-item-title': { template: '<div class="v-list-item-title"><slot /></div>' },
          'v-list-item-subtitle': { template: '<div class="v-list-item-subtitle"><slot /></div>' },
        },
      },
    })

    await wrapper.vm.handleUpdate(2)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])
  })

  it('provides helper functions', () => {
    const wrapper = mount(PrioritySelector, {
      global: {
        plugins: [vuetify],
        stubs: {
          'v-select': mockVSelect,
          'v-chip': { template: '<span class="v-chip"><slot /></span>' },
          'v-list-item': { template: '<div class="v-list-item"><slot /></div>' },
          'v-list-item-title': { template: '<div class="v-list-item-title"><slot /></div>' },
          'v-list-item-subtitle': { template: '<div class="v-list-item-subtitle"><slot /></div>' },
        },
      },
    })

    expect(wrapper.vm.getPriorityLabel(1)).toBe('Критический')
    expect(wrapper.vm.getPriorityLabel(4)).toBe('Низкий')
    expect(wrapper.vm.getPriorityColor(1)).toBe('red')
    expect(wrapper.vm.getPriorityColor(4)).toBe('green')
  })

  it('handles custom props correctly', () => {
    const wrapper = mount(PrioritySelector, {
      props: {
        label: 'Custom Priority',
        disabled: true,
        clearable: true,
      },
      global: {
        plugins: [vuetify],
        stubs: {
          'v-select': mockVSelect,
          'v-chip': { template: '<span class="v-chip"><slot /></span>' },
          'v-list-item': { template: '<div class="v-list-item"><slot /></div>' },
          'v-list-item-title': { template: '<div class="v-list-item-title"><slot /></div>' },
          'v-list-item-subtitle': { template: '<div class="v-list-item-subtitle"><slot /></div>' },
        },
      },
    })

    // Test that component renders with custom props
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.props('label')).toBe('Custom Priority')
    expect(wrapper.props('disabled')).toBe(true)
    expect(wrapper.props('clearable')).toBe(true)
  })
})
