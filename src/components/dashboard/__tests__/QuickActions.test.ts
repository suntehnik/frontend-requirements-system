import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import QuickActions from '../QuickActions.vue'
import { useAuthStore } from '@/stores/auth'

// Mock the stores
vi.mock('@/stores/auth')
vi.mock('@/stores/ui')

const vuetify = createVuetify()

// Create a mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/epics', component: { template: '<div>Epics</div>' } },
    { path: '/user-stories', component: { template: '<div>User Stories</div>' } },
    { path: '/requirements', component: { template: '<div>Requirements</div>' } },
    { path: '/search', component: { template: '<div>Search</div>' } },
    { path: '/admin/users', component: { template: '<div>Admin Users</div>' } },
    { path: '/admin/config', component: { template: '<div>Admin Config</div>' } },
  ],
})

describe('QuickActions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    
    // Mock the auth store with User role by default
    vi.mocked(useAuthStore).mockReturnValue({
      hasRole: vi.fn((role: string) => {
        if (role === 'Administrator') return false
        if (role === 'User') return true
        return false
      }),
    } as any)
  })

  it('should render quick action buttons for users', () => {
    const wrapper = mount(QuickActions, {
      global: {
        plugins: [vuetify, router],
      },
    })

    // Check for main action buttons
    expect(wrapper.text()).toContain('Создать эпик')
    expect(wrapper.text()).toContain('Создать историю')
    expect(wrapper.text()).toContain('Создать требование')
    expect(wrapper.text()).toContain('Поиск')
    expect(wrapper.text()).toContain('Все эпики')
    expect(wrapper.text()).toContain('Все истории')
    expect(wrapper.text()).toContain('Все требования')
  })

  it('should show admin actions for administrators', () => {
    // Mock admin role
    vi.mocked(useAuthStore).mockReturnValue({
      hasRole: vi.fn((role: string) => {
        if (role === 'Administrator') return true
        if (role === 'User') return true
        return false
      }),
    } as any)

    const wrapper = mount(QuickActions, {
      global: {
        plugins: [vuetify, router],
      },
    })

    // Check for admin actions
    expect(wrapper.text()).toContain('Администрирование')
    expect(wrapper.text()).toContain('Управление пользователями')
    expect(wrapper.text()).toContain('Конфигурация системы')
  })

  it('should not show admin actions for regular users', () => {
    const wrapper = mount(QuickActions, {
      global: {
        plugins: [vuetify, router],
      },
    })

    // Should not show admin actions
    expect(wrapper.text()).not.toContain('Администрирование')
    expect(wrapper.text()).not.toContain('Управление пользователями')
    expect(wrapper.text()).not.toContain('Конфигурация системы')
  })

  it('should disable create buttons for commenters', () => {
    // Mock commenter role
    vi.mocked(useAuthStore).mockReturnValue({
      hasRole: vi.fn((role: string) => {
        if (role === 'Administrator') return false
        if (role === 'User') return false
        return true // Only commenter role
      }),
    } as any)

    const wrapper = mount(QuickActions, {
      global: {
        plugins: [vuetify, router],
      },
    })

    // Create buttons should be disabled
    const createButtons = wrapper.findAll('button').filter(button => 
      button.text().includes('Создать')
    )
    
    createButtons.forEach(button => {
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  it('should have proper navigation links', () => {
    const wrapper = mount(QuickActions, {
      global: {
        plugins: [vuetify, router],
      },
    })

    // Check for router-link elements
    const links = wrapper.findAll('[to]')
    const linkTargets = links.map(link => link.attributes('to'))
    
    expect(linkTargets).toContain('/search')
    expect(linkTargets).toContain('/epics')
    expect(linkTargets).toContain('/user-stories')
    expect(linkTargets).toContain('/requirements')
  })
})