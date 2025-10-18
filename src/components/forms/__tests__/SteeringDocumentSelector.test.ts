import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import SteeringDocumentSelector from '../SteeringDocumentSelector.vue'
import { steeringDocumentService } from '@/services'
import type { SteeringDocument, SteeringDocumentListResponse } from '@/types'

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
  'v-icon': { template: '<i class="v-icon"><slot /></i>' },
  'v-list-item': { template: '<div class="v-list-item"><slot /></div>' },
  'v-list-item-title': { template: '<div class="v-list-item-title"><slot /></div>' },
  'v-list-item-subtitle': { template: '<div class="v-list-item-subtitle"><slot /></div>' },
  'v-chip': { template: '<span class="v-chip"><slot /></span>' },
}

const mockDocuments: SteeringDocument[] = [
  {
    id: '1',
    reference_id: 'STD-001',
    title: 'Coding Standards',
    description: 'Team coding standards and guidelines',
    creator_id: 'user1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    reference_id: 'STD-002',
    title: 'API Guidelines',
    description: 'REST API design guidelines',
    creator_id: 'user2',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    reference_id: 'STD-003',
    title: 'Testing Strategy',
    description: 'Testing approach and best practices',
    creator_id: 'user1',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
]

const mockListResponse: SteeringDocumentListResponse = {
  data: mockDocuments,
  total_count: mockDocuments.length,
  limit: 50,
  offset: 0,
}

// Mock the steering document service
vi.mock('@/services', () => ({
  steeringDocumentService: {
    list: vi.fn(),
  },
}))

describe('SteeringDocumentSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(steeringDocumentService.list).mockResolvedValue(mockListResponse)
  })

  it('renders correctly', () => {
    const wrapper = mount(SteeringDocumentSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    expect(wrapper.find('.v-autocomplete').exists()).toBe(true)
  })

  it('loads documents on mount', async () => {
    const wrapper = mount(SteeringDocumentSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Wait for the component to mount and load documents
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(steeringDocumentService.list).toHaveBeenCalledOnce()
    expect(wrapper.vm.documents).toEqual(mockDocuments)
  })

  it('handles loading state correctly', async () => {
    // Mock a delayed response
    vi.mocked(steeringDocumentService.list).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockListResponse), 100)),
    )

    const wrapper = mount(SteeringDocumentSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Initially loading should be true
    expect(wrapper.vm.loading).toBe(true)

    // Wait for the promise to resolve
    await new Promise((resolve) => setTimeout(resolve, 150))
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.loading).toBe(false)
  })

  it('handles API errors correctly', async () => {
    const errorMessage = 'Failed to load documents'
    vi.mocked(steeringDocumentService.list).mockRejectedValue(new Error(errorMessage))

    const wrapper = mount(SteeringDocumentSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Wait for the error to be handled
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.vm.error).toBe(errorMessage)
    expect(wrapper.vm.loading).toBe(false)
  })

  it('filters documents by search query', async () => {
    const wrapper = mount(SteeringDocumentSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Wait for documents to load
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Test search by title
    await wrapper.vm.handleSearch('Coding')
    expect(wrapper.vm.filteredDocuments).toHaveLength(1)
    expect(wrapper.vm.filteredDocuments[0].title).toBe('Coding Standards')

    // Test search by reference_id
    await wrapper.vm.handleSearch('STD-002')
    expect(wrapper.vm.filteredDocuments).toHaveLength(1)
    expect(wrapper.vm.filteredDocuments[0].reference_id).toBe('STD-002')

    // Test search by description
    await wrapper.vm.handleSearch('REST API')
    expect(wrapper.vm.filteredDocuments).toHaveLength(1)
    expect(wrapper.vm.filteredDocuments[0].title).toBe('API Guidelines')

    // Test case insensitive search
    await wrapper.vm.handleSearch('testing')
    expect(wrapper.vm.filteredDocuments).toHaveLength(1)
    expect(wrapper.vm.filteredDocuments[0].title).toBe('Testing Strategy')

    // Test no results
    await wrapper.vm.handleSearch('nonexistent')
    expect(wrapper.vm.filteredDocuments).toHaveLength(0)
  })

  it('excludes documents by ID', async () => {
    const wrapper = mount(SteeringDocumentSelector, {
      props: {
        excludeDocumentIds: ['1', '3'],
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Wait for documents to load
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.vm.filteredDocuments).toHaveLength(1)
    expect(wrapper.vm.filteredDocuments[0].id).toBe('2')
    expect(wrapper.vm.filteredDocuments[0].title).toBe('API Guidelines')
  })

  it('combines search and exclusion filters', async () => {
    const wrapper = mount(SteeringDocumentSelector, {
      props: {
        excludeDocumentIds: ['1'],
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Wait for documents to load
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Search should only return non-excluded documents
    await wrapper.vm.handleSearch('STD')
    expect(wrapper.vm.filteredDocuments).toHaveLength(2)
    expect(wrapper.vm.filteredDocuments.map((d) => d.id)).toEqual(['2', '3'])
  })

  it('emits update:modelValue when selection changes', async () => {
    const wrapper = mount(SteeringDocumentSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    await wrapper.vm.handleUpdate('2')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2'])
  })

  it('returns selected document correctly', async () => {
    const wrapper = mount(SteeringDocumentSelector, {
      props: {
        modelValue: '2',
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Wait for documents to load
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.vm.selectedDocument).toEqual(mockDocuments[1])
  })

  it('returns null for selected document when no value', async () => {
    const wrapper = mount(SteeringDocumentSelector, {
      props: {
        modelValue: null,
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    expect(wrapper.vm.selectedDocument).toBeNull()
  })

  it('returns null for selected document when document not found', async () => {
    const wrapper = mount(SteeringDocumentSelector, {
      props: {
        modelValue: 'nonexistent',
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Wait for documents to load
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.vm.selectedDocument).toBeNull()
  })

  it('exposes correct methods and properties', async () => {
    const wrapper = mount(SteeringDocumentSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Check that exposed properties and methods exist
    expect(wrapper.vm.selectedDocument).toBeDefined()
    expect(wrapper.vm.filteredDocuments).toBeDefined()
    expect(wrapper.vm.documents).toBeDefined()
    expect(wrapper.vm.loading).toBeDefined()
    expect(wrapper.vm.error).toBeDefined()
    expect(typeof wrapper.vm.loadDocuments).toBe('function')
    expect(typeof wrapper.vm.handleUpdate).toBe('function')
    expect(typeof wrapper.vm.handleSearch).toBe('function')
  })

  it('can reload documents manually', async () => {
    const wrapper = mount(SteeringDocumentSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Wait for initial load
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Clear the mock call count
    vi.clearAllMocks()

    // Manually reload documents
    await wrapper.vm.loadDocuments()

    expect(steeringDocumentService.list).toHaveBeenCalledOnce()
  })

  it('handles empty document list', async () => {
    vi.mocked(steeringDocumentService.list).mockResolvedValue({
      data: [],
      total_count: 0,
      limit: 50,
      offset: 0,
    })

    const wrapper = mount(SteeringDocumentSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Wait for documents to load
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.vm.documents).toEqual([])
    expect(wrapper.vm.filteredDocuments).toEqual([])
  })

  it('handles malformed API response gracefully', async () => {
    // Mock a malformed response where data is undefined
    vi.mocked(steeringDocumentService.list).mockResolvedValue({
      data: undefined as unknown as SteeringDocument[],
      total_count: 0,
      limit: 50,
      offset: 0,
    })

    const wrapper = mount(SteeringDocumentSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Wait for documents to load
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.vm.documents).toEqual([])
    expect(wrapper.vm.filteredDocuments).toEqual([])
    expect(wrapper.vm.error).toBeNull()
  })

  it('handles null API response gracefully', async () => {
    // Mock a null response
    vi.mocked(steeringDocumentService.list).mockResolvedValue(
      null as unknown as SteeringDocumentListResponse,
    )

    const wrapper = mount(SteeringDocumentSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Wait for documents to load
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.vm.documents).toEqual([])
    expect(wrapper.vm.filteredDocuments).toEqual([])
    expect(wrapper.vm.error).toBeNull()
  })

  it('handles undefined excludeDocumentIds prop gracefully', async () => {
    const wrapper = mount(SteeringDocumentSelector, {
      props: {
        excludeDocumentIds: undefined as unknown as string[],
      },
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Wait for documents to load
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Should not throw error and should show all documents
    expect(wrapper.vm.filteredDocuments).toHaveLength(3)
    expect(wrapper.vm.filteredDocuments.map((d) => d.id)).toEqual(['1', '2', '3'])
  })

  it('handles documents with missing properties gracefully', async () => {
    const documentsWithMissingProps = [
      {
        id: '1',
        reference_id: 'STD-001',
        title: undefined as unknown as string, // Missing title
        creator_id: 'user1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        reference_id: undefined as unknown as string, // Missing reference_id
        title: 'API Guidelines',
        creator_id: 'user2',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
    ]

    vi.mocked(steeringDocumentService.list).mockResolvedValue({
      data: documentsWithMissingProps,
      total_count: documentsWithMissingProps.length,
      limit: 50,
      offset: 0,
    })

    const wrapper = mount(SteeringDocumentSelector, {
      global: {
        plugins: [vuetify],
        stubs,
      },
    })

    // Wait for documents to load
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Should not throw error during search
    await wrapper.vm.handleSearch('API')
    expect(wrapper.vm.filteredDocuments).toHaveLength(1)
    expect(wrapper.vm.filteredDocuments[0].title).toBe('API Guidelines')
  })
})
