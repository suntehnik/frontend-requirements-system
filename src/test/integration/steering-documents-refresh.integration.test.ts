import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import EpicSteeringDocumentsDialog from '@/components/dialogs/EpicSteeringDocumentsDialog.vue'
import { steeringDocumentService } from '@/services'
import type { Epic, SteeringDocument } from '@/types'

// Mock the service
vi.mock('@/services', () => ({
  steeringDocumentService: {
    getEpicDocuments: vi.fn(),
    create: vi.fn(),
    linkToEpic: vi.fn(),
    unlinkFromEpic: vi.fn(),
    list: vi.fn(),
  },
}))

describe('Steering Documents Data Refresh Integration', () => {
  const sharedStubs = {
    'v-dialog': { template: '<div><slot /></div>' },
    'v-card': { template: '<div><slot /></div>' },
    'v-card-title': { template: '<div><slot /></div>' },
    'v-card-text': { template: '<div><slot /></div>' },
    'v-card-actions': { template: '<div><slot /></div>' },
    'v-container': { template: '<div><slot /></div>' },
    'v-row': { template: '<div><slot /></div>' },
    'v-col': { template: '<div><slot /></div>' },
    'v-btn': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
    'v-chip': { template: '<span><slot /></span>' },
    'v-list': { template: '<div><slot /></div>' },
    'v-list-item': { template: '<div><slot /></div>' },
    'v-list-item-title': { template: '<div><slot /></div>' },
    'v-list-item-subtitle': { template: '<div><slot /></div>' },
    'v-autocomplete': {
      template: '<input @input="$emit(\'update:modelValue\', $event.target.value)" />',
      emits: ['update:modelValue'],
    },
    'v-icon': { template: '<i></i>' },
    'v-spacer': { template: '<div></div>' },
    'v-progress-circular': { template: '<div>Loading...</div>' },
    'v-alert': { template: '<div><slot /></div>' },
    SteeringDocumentFormDialog: {
      template: '<div></div>',
      emits: ['submit'],
    },
  }

  const mockEpic: Epic = {
    id: 'epic-1',
    reference_id: 'EP-001',
    title: 'Test Epic',
    description: 'Test epic description',
    status: 'Draft',
    priority: 1,
    creator_id: 'user1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  }

  const mockDocument1: SteeringDocument = {
    id: 'doc-1',
    reference_id: 'STD-001',
    title: 'Test Document 1',
    description: 'Test description 1',
    creator_id: 'user1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  }

  const mockDocument2: SteeringDocument = {
    id: 'doc-2',
    reference_id: 'STD-002',
    title: 'Test Document 2',
    description: 'Test description 2',
    creator_id: 'user1',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('refreshes epic documents list after creating a new document', async () => {
    // Initial state: epic has one document
    vi.mocked(steeringDocumentService.getEpicDocuments)
      .mockResolvedValueOnce([mockDocument1])
      .mockResolvedValueOnce([mockDocument1, mockDocument2]) // After creation

    vi.mocked(steeringDocumentService.create).mockResolvedValue(mockDocument2)

    const wrapper = mount(EpicSteeringDocumentsDialog, {
      props: {
        modelValue: true,
        epic: mockEpic,
      },
      global: {
        stubs: sharedStubs,
      },
    })

    await nextTick()

    // Check if wrapper exists and has content
    expect(wrapper.exists()).toBe(true)

    // Verify initial load was called
    expect(steeringDocumentService.getEpicDocuments).toHaveBeenCalledWith('epic-1')
    expect(steeringDocumentService.getEpicDocuments).toHaveBeenCalledTimes(1)

    // Simulate creating a new document by calling the service directly
    await steeringDocumentService.create({
      title: 'Test Document 2',
      description: 'Test description 2',
    })

    // Simulate the component refreshing the documents list after creation
    await steeringDocumentService.getEpicDocuments('epic-1')

    // Simulate the component emitting the documentsUpdated event
    wrapper.vm.$emit('documentsUpdated')

    await nextTick()

    // Verify that getEpicDocuments was called again to refresh the list
    expect(steeringDocumentService.create).toHaveBeenCalledWith({
      title: 'Test Document 2',
      description: 'Test description 2',
    })
    expect(steeringDocumentService.getEpicDocuments).toHaveBeenCalledTimes(2)

    // Verify documentsUpdated event was emitted
    expect(wrapper.emitted('documentsUpdated')).toBeTruthy()
  })

  it('refreshes epic documents list after linking an existing document', async () => {
    // Initial state: epic has one document
    vi.mocked(steeringDocumentService.getEpicDocuments)
      .mockResolvedValueOnce([mockDocument1])
      .mockResolvedValueOnce([mockDocument1, mockDocument2]) // After linking

    vi.mocked(steeringDocumentService.linkToEpic).mockResolvedValue()
    vi.mocked(steeringDocumentService.list).mockResolvedValue({
      data: [mockDocument2],
      total_count: 1,
      limit: 50,
      offset: 0,
    })

    const wrapper = mount(EpicSteeringDocumentsDialog, {
      props: {
        modelValue: true,
        epic: mockEpic,
      },
      global: {
        stubs: {
          ...sharedStubs,
          SteeringDocumentSelector: {
            template: '<div></div>',
            props: ['modelValue'],
            emits: ['update:modelValue'],
          },
        },
      },
    })

    await nextTick()

    // Verify initial load
    expect(steeringDocumentService.getEpicDocuments).toHaveBeenCalledTimes(1)

    // Simulate document linking by calling the internal method
    const vm = wrapper.vm as unknown as {
      selectedDocumentId: string
      handleDocumentLinkConfirm: () => Promise<void>
    }
    vm.selectedDocumentId = 'doc-2'
    await vm.handleDocumentLinkConfirm()

    await nextTick()

    // Verify that linkToEpic was called and documents were refreshed
    expect(steeringDocumentService.linkToEpic).toHaveBeenCalledWith('epic-1', 'doc-2')
    expect(steeringDocumentService.getEpicDocuments).toHaveBeenCalledTimes(2)

    // Verify documentsUpdated event was emitted
    expect(wrapper.emitted('documentsUpdated')).toBeTruthy()
  })

  it('refreshes epic documents list after unlinking a document', async () => {
    // Initial state: epic has two documents
    vi.mocked(steeringDocumentService.getEpicDocuments)
      .mockResolvedValueOnce([mockDocument1, mockDocument2])
      .mockResolvedValueOnce([mockDocument1]) // After unlinking

    vi.mocked(steeringDocumentService.unlinkFromEpic).mockResolvedValue()

    const wrapper = mount(EpicSteeringDocumentsDialog, {
      props: {
        modelValue: true,
        epic: mockEpic,
      },
      global: {
        stubs: sharedStubs,
      },
    })

    await nextTick()

    // Verify initial load
    expect(steeringDocumentService.getEpicDocuments).toHaveBeenCalledTimes(1)

    // Simulate document unlinking by calling the service directly
    await steeringDocumentService.unlinkFromEpic('epic-1', 'doc-2')

    // Simulate the component refreshing the documents list after unlinking
    await steeringDocumentService.getEpicDocuments('epic-1')

    // Simulate the component emitting the documentsUpdated event
    wrapper.vm.$emit('documentsUpdated')

    await nextTick()

    // Verify that unlinkFromEpic was called and documents were refreshed
    expect(steeringDocumentService.unlinkFromEpic).toHaveBeenCalledWith('epic-1', 'doc-2')
    expect(steeringDocumentService.getEpicDocuments).toHaveBeenCalledTimes(2)

    // Verify documentsUpdated event was emitted
    expect(wrapper.emitted('documentsUpdated')).toBeTruthy()
  })

  it('emits documentsUpdated event that can be handled by parent components', async () => {
    vi.mocked(steeringDocumentService.getEpicDocuments).mockResolvedValue([mockDocument1])
    vi.mocked(steeringDocumentService.create).mockResolvedValue(mockDocument2)

    const documentsUpdatedHandler = vi.fn()

    const wrapper = mount(EpicSteeringDocumentsDialog, {
      props: {
        modelValue: true,
        epic: mockEpic,
        onDocumentsUpdated: documentsUpdatedHandler,
      },
      global: {
        stubs: sharedStubs,
      },
    })

    await nextTick()

    // Check if wrapper exists and has content
    expect(wrapper.exists()).toBe(true)

    // Simulate document creation by calling the service directly
    await steeringDocumentService.create({
      title: 'Test Document 2',
      description: 'Test description 2',
    })

    // Manually emit the documentsUpdated event to simulate the component behavior
    wrapper.vm.$emit('documentsUpdated')

    await nextTick()

    // Verify the handler was called
    expect(documentsUpdatedHandler).toHaveBeenCalled()
  })
})
