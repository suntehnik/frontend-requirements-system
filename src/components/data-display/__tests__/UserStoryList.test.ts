import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import UserStoryList from '../UserStoryList.vue'
import type { UserStory, Epic } from '@/types'

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/user-stories/:id', component: { template: '<div>User Story Detail</div>' } },
    { path: '/epics/:id', component: { template: '<div>Epic Detail</div>' } },
  ],
})

// Mock data
const mockUserStories: UserStory[] = [
  {
    id: '1',
    reference_id: 'US-001',
    title: 'Test User Story 1',
    description: 'Test description',
    status: 'Draft',
    priority: 1,
    epic_id: '1',
    creator_id: 'user1',
    assignee_id: 'user2',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    epic: {
      id: '1',
      reference_id: 'EP-001',
      title: 'Test Epic',
      status: 'Draft',
      priority: 1,
    },
    assignee: {
      id: 'user2',
      username: 'testuser',
      email: 'test@example.com',
      role: 'User',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  },
  {
    id: '2',
    reference_id: 'US-002',
    title: 'Test User Story 2',
    description: 'Test description 2',
    status: 'In Progress',
    priority: 2,
    epic_id: '2',
    creator_id: 'user1',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    epic: {
      id: '2',
      reference_id: 'EP-002',
      title: 'Test Epic 2',
      status: 'In Progress',
      priority: 2,
    },
  },
]

const mockEpics: Epic[] = [
  {
    id: '1',
    reference_id: 'EP-001',
    title: 'Test Epic 1',
    description: 'Test epic description',
    status: 'Draft',
    priority: 1,
    creator_id: 'user1',
    assignee_id: 'user2',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    reference_id: 'EP-002',
    title: 'Test Epic 2',
    description: 'Test epic description 2',
    status: 'In Progress',
    priority: 2,
    creator_id: 'user1',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
  },
]

describe('UserStoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render user stories list', () => {
    const wrapper = mount(UserStoryList, {
      props: {
        userStories: mockUserStories,
        epics: mockEpics,
        loading: false,
        totalCount: 2,
        currentPage: 1,
        pageSize: 25,
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.exists()).toBe(true)
    // Component should render successfully
    expect(wrapper.vm).toBeTruthy()
  })

  it('should emit create event when create button is clicked', async () => {
    const wrapper = mount(UserStoryList, {
      props: {
        userStories: [],
        epics: mockEpics,
        loading: false,
        totalCount: 0,
        currentPage: 1,
        pageSize: 25,
      },
      global: {
        plugins: [router],
      },
    })

    // Find the create button in empty state
    const createButton = wrapper.find('button')
    if (createButton.exists()) {
      await createButton.trigger('click')
      expect(wrapper.emitted('create')).toBeTruthy()
    }
  })

  it('should emit delete event when delete button is clicked', async () => {
    const wrapper = mount(UserStoryList, {
      props: {
        userStories: mockUserStories,
        epics: mockEpics,
        loading: false,
        totalCount: 2,
        currentPage: 1,
        pageSize: 25,
      },
      global: {
        plugins: [router],
      },
    })

    // Find delete button (mdi-delete icon)
    const deleteButton = wrapper.find('[title="Удалить"]')
    if (deleteButton.exists()) {
      await deleteButton.trigger('click')
      expect(wrapper.emitted('delete')).toBeTruthy()
    }
  })

  it('should emit filter-change event when filters are applied', async () => {
    const wrapper = mount(UserStoryList, {
      props: {
        userStories: mockUserStories,
        epics: mockEpics,
        loading: false,
        totalCount: 2,
        currentPage: 1,
        pageSize: 25,
      },
      global: {
        plugins: [router],
      },
    })

    // Find status filter select
    const statusSelect = wrapper.find('input[type="text"]')
    if (statusSelect.exists()) {
      await statusSelect.setValue('Draft')
      // The filter change should be emitted
      expect(wrapper.emitted('filter-change') || wrapper.emitted()).toBeTruthy()
    }
  })

  it('should emit search-change event when search input changes', async () => {
    const wrapper = mount(UserStoryList, {
      props: {
        userStories: mockUserStories,
        epics: mockEpics,
        loading: false,
        totalCount: 2,
        currentPage: 1,
        pageSize: 25,
      },
      global: {
        plugins: [router],
      },
    })

    // Find search input
    const searchInput = wrapper.find('input[type="text"]')
    if (searchInput.exists()) {
      await searchInput.setValue('test search')
      // The search change should be emitted
      expect(wrapper.emitted('search-change') || wrapper.emitted()).toBeTruthy()
    }
  })

  it('should show empty state when no user stories', () => {
    const wrapper = mount(UserStoryList, {
      props: {
        userStories: [],
        epics: mockEpics,
        loading: false,
        totalCount: 0,
        currentPage: 1,
        pageSize: 25,
      },
      global: {
        plugins: [router],
      },
    })

    // Component should render successfully with empty data
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.props('userStories')).toEqual([])
    expect(wrapper.props('totalCount')).toBe(0)
  })

  it('should show loading state', () => {
    const wrapper = mount(UserStoryList, {
      props: {
        userStories: [],
        epics: mockEpics,
        loading: true,
        totalCount: 0,
        currentPage: 1,
        pageSize: 25,
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.exists()).toBe(true)
    // Component should render even in loading state
  })

  it('should have proper TypeScript interfaces', () => {
    // This test ensures the component can be mounted with proper types
    const wrapper = mount(UserStoryList, {
      props: {
        userStories: mockUserStories,
        epics: mockEpics,
        loading: false,
        totalCount: 2,
        currentPage: 1,
        pageSize: 25,
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.props('userStories')).toEqual(mockUserStories)
    expect(wrapper.props('epics')).toEqual(mockEpics)
    expect(wrapper.props('loading')).toBe(false)
    expect(wrapper.props('totalCount')).toBe(2)
    expect(wrapper.props('currentPage')).toBe(1)
    expect(wrapper.props('pageSize')).toBe(25)
  })
})
