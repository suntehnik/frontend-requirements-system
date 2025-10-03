import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createPinia, setActivePinia } from 'pinia'
import UserSelector from '../UserSelector.vue'
import { useConfigStore } from '@/stores/config'
import type { User } from '@/types'

const vuetify = createVuetify()

// Mock Vuetify components
const mockVAutocomplete = {
  template: '<div class="v-autocomplete"><slot /></div>',
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
    'search',
    'itemTitle',
    'itemValue',
    'noFilter',
  ],
  emits: ['update:modelValue', 'update:search'],
}

const stubs = {
  'v-autocomplete': mockVAutocomplete,
  'v-avatar': { template: '<div class="v-avatar"><slot /></div>' },
  'v-icon': { template: '<i class="v-icon"><slot /></i>' },
  'v-list-item': { template: '<div class="v-list-item"><slot /></div>' },
  'v-list-item-title': { template: '<div class="v-list-item-title"><slot /></div>' },
  'v-list-item-subtitle': { template: '<div class="v-list-item-subtitle"><slot /></div>' },
  'v-chip': { template: '<span class="v-chip"><slot /></span>' },
}

const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'Administrator',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    role: 'User',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    username: 'commenter',
    email: 'commenter@example.com',
    role: 'Commenter',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

describe('UserSelector', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    // Mock the config store
    const configStore = useConfigStore()
    configStore.users = mockUsers
    vi.spyOn(configStore, 'fetchUsers').mockResolvedValue()
  })

  it('renders correctly', () => {
    const wrapper = mount(UserSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    expect(wrapper.find('.v-autocomplete').exists()).toBe(true)
  })

  it('displays users with correct display names', () => {
    const wrapper = mount(UserSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    const usersWithDisplayName = wrapper.vm.usersWithDisplayName
    expect(usersWithDisplayName).toHaveLength(3)
    expect(usersWithDisplayName[0].displayName).toBe('admin (admin@example.com)')
    expect(usersWithDisplayName[1].displayName).toBe('user1 (user1@example.com)')
  })

  it('filters users by search query', async () => {
    const wrapper = mount(UserSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    await wrapper.vm.handleSearch('admin')

    const filteredUsers = wrapper.vm.filteredUsers
    expect(filteredUsers).toHaveLength(1)
    expect(filteredUsers[0].username).toBe('admin')
  })

  it('filters users by included roles', () => {
    const wrapper = mount(UserSelector, {
      props: {
        includeRoles: ['Administrator', 'User'],
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    const filteredUsers = wrapper.vm.filteredUsers
    expect(filteredUsers).toHaveLength(2)
    expect(filteredUsers.map((u) => u.role)).toEqual(['Administrator', 'User'])
  })

  it('filters users by excluded roles', () => {
    const wrapper = mount(UserSelector, {
      props: {
        excludeRoles: ['Commenter'],
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    const filteredUsers = wrapper.vm.filteredUsers
    expect(filteredUsers).toHaveLength(2)
    expect(filteredUsers.map((u) => u.role)).toEqual(['Administrator', 'User'])
  })

  it('emits update:modelValue when selection changes', async () => {
    const wrapper = mount(UserSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    await wrapper.vm.handleUpdate('1')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['1'])
  })

  it('provides correct role labels and colors', () => {
    const wrapper = mount(UserSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    expect(wrapper.vm.getRoleLabel('Administrator')).toBe('Администратор')
    expect(wrapper.vm.getRoleLabel('User')).toBe('Пользователь')
    expect(wrapper.vm.getRoleLabel('Commenter')).toBe('Комментатор')

    expect(wrapper.vm.getRoleColor('Administrator')).toBe('red')
    expect(wrapper.vm.getRoleColor('User')).toBe('blue')
    expect(wrapper.vm.getRoleColor('Commenter')).toBe('grey')
  })

  it('provides user display name helper', () => {
    const wrapper = mount(UserSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    expect(wrapper.vm.getUserDisplayName('1')).toBe('admin (admin@example.com)')
    expect(wrapper.vm.getUserDisplayName('999')).toBe('999') // Non-existent user
  })

  it('returns selected user correctly', () => {
    const wrapper = mount(UserSelector, {
      props: {
        modelValue: '1',
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    expect(wrapper.vm.selectedUser).toEqual(mockUsers[0])
  })
})
