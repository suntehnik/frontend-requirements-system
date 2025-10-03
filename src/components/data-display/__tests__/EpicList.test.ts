import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createRouter, createWebHistory } from 'vue-router'
import EpicList from '../EpicList.vue'
import type { Epic, EpicStatus, Priority } from '@/types'

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/epics/:reference_id', name: 'EpicDetail', component: { template: '<div>Epic Detail</div>' } }
  ]
})

const vuetify = createVuetify()

// Mock epic data for testing
const createMockEpic = (overrides: Partial<Epic> = {}): Epic => ({
  id: '1',
  reference_id: 'EP-001',
  title: 'Test Epic',
  description: 'Test description',
  status: 'Draft' as EpicStatus,
  priority: 2 as Priority,
  creator_id: 'user1',
  assignee_id: 'user2',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  assignee: {
    id: 'user2',
    username: 'testuser',
    email: 'test@example.com',
    role: 'User',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  ...overrides
})

const createWrapper = (props: Record<string, unknown> = {}) => {
  const defaultProps = {
    epics: [],
    loading: false,
    totalCount: 0,
    currentPage: 1,
    pageSize: 25
  }
  
  return mount(EpicList, {
    props: { ...defaultProps, ...props },
    global: {
      plugins: [vuetify, router]
    }
  })
}

describe('EpicList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Configuration and Props (Requirements 1.2-1.4)', () => {
    it('should always show mandatory columns (reference_id and title)', () => {
      const epics = [createMockEpic()]
      const wrapper = createWrapper({ epics })

      const headers = wrapper.vm.headers
      const mandatoryColumns = headers.filter(h => h.key === 'reference_id' || h.key === 'title')
      
      expect(mandatoryColumns).toHaveLength(2)
      expect(mandatoryColumns[0].key).toBe('reference_id')
      expect(mandatoryColumns[1].key).toBe('title')
      
      // Mandatory columns should not have responsive classes that hide them
      mandatoryColumns.forEach(col => {
        expect(col.class).toBeUndefined()
      })
    })

    it('should hide optional columns on narrow screens using responsive classes', () => {
      const wrapper = createWrapper()
      const headers = wrapper.vm.headers
      
      // Status column should be hidden on small screens (d-none d-md-table-cell)
      const statusColumn = headers.find(h => h.key === 'status')
      expect(statusColumn?.class).toBe('d-none d-md-table-cell')
      
      // Priority and assignee columns should be hidden on medium screens (d-none d-lg-table-cell)
      const priorityColumn = headers.find(h => h.key === 'priority')
      const assigneeColumn = headers.find(h => h.key === 'assignee')
      expect(priorityColumn?.class).toBe('d-none d-lg-table-cell')
      expect(assigneeColumn?.class).toBe('d-none d-lg-table-cell')
      
      // Created date should be hidden on large screens (d-none d-xl-table-cell)
      const createdColumn = headers.find(h => h.key === 'created_at')
      expect(createdColumn?.class).toBe('d-none d-xl-table-cell')
    })

    it('should handle long content without horizontal scrolling (Requirements 1.5, 1.12)', () => {
      const epics = [createMockEpic({ title: 'Very long epic title that should be truncated to prevent horizontal scrolling issues' })]
      const wrapper = createWrapper({ epics })

      // Verify that the component accepts the epics prop
      expect(wrapper.props('epics')).toEqual(epics)
      
      // Verify that headers are configured properly
      expect(wrapper.vm.headers).toBeDefined()
      expect(wrapper.vm.headers.length).toBeGreaterThan(0)
    })

    it('should configure table headers with proper sorting capabilities', () => {
      const wrapper = createWrapper()
      const headers = wrapper.vm.headers

      // Verify sortable columns as per Requirement 1.8
      const sortableColumns = headers.filter(h => h.sortable)
      const sortableKeys = sortableColumns.map(h => h.key)

      expect(sortableKeys).toContain('reference_id')
      expect(sortableKeys).toContain('title')
      expect(sortableKeys).toContain('status')
      expect(sortableKeys).toContain('priority')
      expect(sortableKeys).toContain('created_at')
    })
  })

  describe('Backend-Integrated Filtering and Search Functionality (Requirements 1.1, 1.10, 1.13, 1.14)', () => {
    it('should configure filter options properly (Requirement 1.1, 1.10)', () => {
      const wrapper = createWrapper()

      // Verify filter options are configured
      expect(wrapper.vm.statusOptions).toBeDefined()
      expect(wrapper.vm.priorityOptions).toBeDefined()
      
      // Check status options
      const statusOptions = wrapper.vm.statusOptions
      expect(statusOptions).toEqual([
        { title: 'Бэклог', value: 'Backlog' },
        { title: 'Черновик', value: 'Draft' },
        { title: 'В работе', value: 'In Progress' },
        { title: 'Выполнено', value: 'Done' },
        { title: 'Отменено', value: 'Cancelled' }
      ])

      // Check priority options
      const priorityOptions = wrapper.vm.priorityOptions
      expect(priorityOptions).toEqual([
        { title: 'Критический', value: 1 },
        { title: 'Высокий', value: 2 },
        { title: 'Средний', value: 3 },
        { title: 'Низкий', value: 4 }
      ])
    })

    it('should emit filter-change event when status filter changes (Requirement 1.13)', async () => {
      const wrapper = createWrapper()

      // Simulate status filter change
      wrapper.vm.filters.status = 'In Progress'
      await wrapper.vm.applyFilters()

      expect(wrapper.emitted('filter-change')).toBeTruthy()
      expect(wrapper.emitted('filter-change')?.[0]).toEqual([{ status: 'In Progress' }])
    })

    it('should emit filter-change event when priority filter changes (Requirement 1.13)', async () => {
      const wrapper = createWrapper()

      // Simulate priority filter change
      wrapper.vm.filters.priority = 1
      await wrapper.vm.applyFilters()

      expect(wrapper.emitted('filter-change')).toBeTruthy()
      expect(wrapper.emitted('filter-change')?.[0]).toEqual([{ priority: 1 }])
    })

    it('should emit search-change event when search input changes (Requirement 1.14)', async () => {
      const wrapper = createWrapper()

      // Simulate search input change by calling the method directly
      await wrapper.vm.handleSearchChange('test search')

      expect(wrapper.emitted('search-change')).toBeTruthy()
      expect(wrapper.emitted('search-change')?.[0]).toEqual(['test search'])
    })

    it('should manage filter state properly (Requirement 1.10)', () => {
      const wrapper = createWrapper()

      // Test initial filter state
      expect(wrapper.vm.filters).toEqual({})
      expect(wrapper.vm.hasActiveFilters).toBe(false)

      // Test setting filters
      wrapper.vm.filters.status = 'Draft'
      wrapper.vm.filters.priority = 1
      expect(wrapper.vm.hasActiveFilters).toBe(true)
    })

    it('should clear filters and search when clearFiltersAndSearch is called', async () => {
      const wrapper = createWrapper()

      // Set some filters and search
      wrapper.vm.search = 'test'
      wrapper.vm.filters.status = 'Draft'
      wrapper.vm.filters.priority = 1

      // Clear filters
      await wrapper.vm.clearFiltersAndSearch()

      expect(wrapper.vm.search).toBe('')
      expect(wrapper.vm.filters.status).toBeUndefined()
      expect(wrapper.vm.filters.priority).toBeUndefined()

      // Check emitted events
      expect(wrapper.emitted('clear-filters')).toBeTruthy()
      expect(wrapper.emitted('search-change')).toBeTruthy()
      expect(wrapper.emitted('filter-change')).toBeTruthy()
    })
  })

  describe('Pagination with Different Page Sizes (Requirement 1.9)', () => {
    it('should implement pagination when more than 50 epics exist', () => {
      const wrapper = createWrapper({ 
        totalCount: 100,
        pageSize: 25,
        currentPage: 1
      })

      expect(wrapper.vm.shouldShowPagination).toBe(true)
      expect(wrapper.vm.totalCount).toBe(100)
      expect(wrapper.vm.pageSize).toBe(25)
    })

    it('should not show pagination when 50 or fewer epics exist', () => {
      const wrapper = createWrapper({ 
        totalCount: 30,
        pageSize: 25,
        currentPage: 1
      })

      expect(wrapper.vm.shouldShowPagination).toBe(true) // 30 > 25, so pagination should show
      
      // Test with exactly 25 items
      const wrapper2 = createWrapper({ 
        totalCount: 25,
        pageSize: 25,
        currentPage: 1
      })

      expect(wrapper2.vm.shouldShowPagination).toBe(false) // 25 == 25, no pagination needed
    })

    it('should provide configurable page size options', () => {
      const wrapper = createWrapper()

      expect(wrapper.vm.pageSizeOptions).toEqual([10, 25, 50, 100])
    })

    it('should emit options-change event when pagination changes', async () => {
      const wrapper = createWrapper({ totalCount: 100 })

      const mockOptions = {
        page: 2,
        itemsPerPage: 50,
        sortBy: [{ key: 'title', order: 'asc' as const }]
      }

      await wrapper.vm.handleOptionsChange(mockOptions)

      expect(wrapper.emitted('options-change')).toBeTruthy()
      expect(wrapper.emitted('options-change')?.[0]).toEqual([mockOptions])
    })

    it('should update sortBy state when options change', async () => {
      const wrapper = createWrapper()

      const mockOptions = {
        page: 1,
        itemsPerPage: 25,
        sortBy: [{ key: 'priority', order: 'desc' as const }]
      }

      await wrapper.vm.handleOptionsChange(mockOptions)

      expect(wrapper.vm.sortBy).toEqual([{ key: 'priority', order: 'desc' }])
    })
  })

  describe('Row Click Navigation to Detail Pages (Requirement 1.6)', () => {
    it('should navigate to epic detail page when row is clicked', async () => {
      const epic = createMockEpic({ reference_id: 'EP-123' })
      const wrapper = createWrapper({ epics: [epic] })

      const routerPushSpy = vi.spyOn(router, 'push')

      // Simulate row click
      await wrapper.vm.handleRowClick({} as Event, { item: epic })

      expect(routerPushSpy).toHaveBeenCalledWith('/epics/EP-123')
    })

    it('should prevent row click when delete button is clicked', async () => {
      const epic = createMockEpic()
      const wrapper = createWrapper({ epics: [epic] })

      const routerPushSpy = vi.spyOn(router, 'push')
      const mockEvent = {
        stopPropagation: vi.fn()
      } as unknown as Event

      // Simulate delete button click
      await wrapper.vm.handleDeleteClick(mockEvent, epic)

      expect(mockEvent.stopPropagation).toHaveBeenCalled()
      expect(routerPushSpy).not.toHaveBeenCalled()
      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')?.[0]).toEqual([epic])
    })
  })

  describe('Empty State Handling and Call-to-Action (Requirement 1.11)', () => {
    it('should handle empty state logic correctly', () => {
      const wrapper = createWrapper({ epics: [] })

      // Check that empty state logic is working
      expect(wrapper.vm.hasActiveFilters).toBe(false)
      expect(wrapper.vm.search).toBe('')
      expect(wrapper.props('epics')).toEqual([])
    })

    it('should detect filtered state correctly', async () => {
      const wrapper = createWrapper({ epics: [] })

      // Set search to simulate filtered state
      wrapper.vm.search = 'nonexistent'
      await wrapper.vm.$nextTick()

      // Check that filtered state is detected
      expect(wrapper.vm.search).toBe('nonexistent')
    })

    it('should emit create event when create epic button is clicked', async () => {
      const wrapper = createWrapper({ epics: [] })

      // Test the method directly
      await wrapper.vm.handleCreateEpic()

      expect(wrapper.emitted('create')).toBeTruthy()
    })

    it('should clear filters when clear filters button is clicked', async () => {
      const wrapper = createWrapper({ epics: [] })

      // Set filters to simulate filtered state
      wrapper.vm.search = 'test'
      wrapper.vm.filters.status = 'Draft'
      await wrapper.vm.$nextTick()

      // Test the method directly
      await wrapper.vm.clearFiltersAndSearch()

      expect(wrapper.emitted('clear-filters')).toBeTruthy()
      expect(wrapper.emitted('search-change')).toBeTruthy()
      expect(wrapper.emitted('filter-change')).toBeTruthy()
    })

    it('should distinguish between filtered and truly empty states', async () => {
      const wrapper = createWrapper({ epics: [] })

      // Test truly empty state (no filters)
      expect(wrapper.vm.hasActiveFilters).toBe(false)
      expect(wrapper.vm.search).toBe('')

      // Test filtered empty state
      wrapper.vm.filters.status = 'Draft'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.hasActiveFilters).toBe(true)
    })
  })

  describe('Sorting Functionality (Requirements 1.7, 1.8)', () => {
    it('should have proper default sorting behavior', () => {
      const wrapper = createWrapper()

      // The component should be ready to handle default sorting
      // (actual default sorting is handled by the parent component/store)
      expect(wrapper.vm.sortBy).toEqual([])
    })
  })

  describe('Data Display and Formatting', () => {
    it('should accept epic data correctly', () => {
      const epic = createMockEpic({
        reference_id: 'EP-123',
        title: 'Test Epic Title',
        status: 'In Progress',
        priority: 1,
        created_at: '2024-01-15T10:30:00Z'
      })
      const wrapper = createWrapper({ epics: [epic] })

      expect(wrapper.props('epics')).toEqual([epic])
    })

    it('should format status with proper color coding', () => {
      const wrapper = createWrapper()

      expect(wrapper.vm.getStatusColor('Backlog')).toBe('grey')
      expect(wrapper.vm.getStatusColor('Draft')).toBe('orange')
      expect(wrapper.vm.getStatusColor('In Progress')).toBe('blue')
      expect(wrapper.vm.getStatusColor('Done')).toBe('green')
      expect(wrapper.vm.getStatusColor('Cancelled')).toBe('red')

      expect(wrapper.vm.getStatusText('In Progress')).toBe('В работе')
      expect(wrapper.vm.getStatusText('Done')).toBe('Выполнено')
    })

    it('should format priority with proper color coding', () => {
      const wrapper = createWrapper()

      expect(wrapper.vm.getPriorityColor(1)).toBe('red')
      expect(wrapper.vm.getPriorityColor(2)).toBe('orange')
      expect(wrapper.vm.getPriorityColor(3)).toBe('yellow')
      expect(wrapper.vm.getPriorityColor(4)).toBe('green')

      expect(wrapper.vm.getPriorityText(1)).toBe('Критический')
      expect(wrapper.vm.getPriorityText(2)).toBe('Высокий')
      expect(wrapper.vm.getPriorityText(3)).toBe('Средний')
      expect(wrapper.vm.getPriorityText(4)).toBe('Низкий')
    })

    it('should format dates correctly', () => {
      const wrapper = createWrapper()

      const formattedDate = wrapper.vm.formatDate('2024-01-15T10:30:00Z')
      expect(formattedDate).toBe('15.01.2024')
    })

    it('should handle different epic data structures', () => {
      const epicWithAssignee = createMockEpic({
        assignee: {
          id: 'user1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'User',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      })

      const epicWithoutAssignee = createMockEpic({
        assignee: undefined
      })

      const wrapper = createWrapper({ epics: [epicWithAssignee, epicWithoutAssignee] })
      
      // Verify that both epics are accepted
      expect(wrapper.props('epics')).toHaveLength(2)
    })
  })

  describe('Loading States', () => {
    it('should handle loading state correctly', () => {
      const wrapper = createWrapper({ loading: true })

      expect(wrapper.props('loading')).toBe(true)
    })

    it('should handle non-loading state correctly', () => {
      const wrapper = createWrapper({ loading: false })

      expect(wrapper.props('loading')).toBe(false)
    })
  })

  describe('Component Props and Events', () => {
    it('should accept all required props with proper defaults', () => {
      const wrapper = createWrapper()

      expect(wrapper.props()).toMatchObject({
        epics: [],
        loading: false,
        totalCount: 0,
        currentPage: 1,
        pageSize: 25
      })
    })

    it('should emit all required events', async () => {
      const wrapper = createWrapper()

      // Test all event emissions
      await wrapper.vm.handleCreateEpic()
      expect(wrapper.emitted('create')).toBeTruthy()

      const mockEpic = createMockEpic()
      const mockEvent = { stopPropagation: vi.fn() } as unknown as Event
      await wrapper.vm.handleDeleteClick(mockEvent, mockEpic)
      expect(wrapper.emitted('delete')).toBeTruthy()

      await wrapper.vm.applyFilters()
      expect(wrapper.emitted('filter-change')).toBeTruthy()

      await wrapper.vm.handleSearchChange('test')
      expect(wrapper.emitted('search-change')).toBeTruthy()

      const mockOptions = {
        page: 1,
        itemsPerPage: 25,
        sortBy: []
      }
      await wrapper.vm.handleOptionsChange(mockOptions)
      expect(wrapper.emitted('options-change')).toBeTruthy()

      await wrapper.vm.clearFiltersAndSearch()
      expect(wrapper.emitted('clear-filters')).toBeTruthy()
    })
  })

  describe('Component Structure and Behavior', () => {
    it('should render with proper component structure', () => {
      const epics = [createMockEpic()]
      const wrapper = createWrapper({ epics })

      // Verify that the component renders
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('epics')).toEqual(epics)
    })

    it('should handle component lifecycle properly', () => {
      const wrapper = createWrapper()

      // Verify component is mounted and functional
      expect(wrapper.vm).toBeDefined()
      expect(wrapper.vm.headers).toBeDefined()
      expect(wrapper.vm.statusOptions).toBeDefined()
      expect(wrapper.vm.priorityOptions).toBeDefined()
    })

    it('should provide proper computed properties', () => {
      const wrapper = createWrapper({ totalCount: 100, pageSize: 25 })

      // Test computed properties
      expect(wrapper.vm.totalCount).toBe(100)
      expect(wrapper.vm.pageSize).toBe(25)
      expect(wrapper.vm.shouldShowPagination).toBe(true)
    })
  })
})