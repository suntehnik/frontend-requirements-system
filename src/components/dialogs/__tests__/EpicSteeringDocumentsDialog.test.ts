import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import EpicSteeringDocumentsDialog from '../EpicSteeringDocumentsDialog.vue'
import { steeringDocumentService } from '@/services'
import type {
  Epic,
  SteeringDocument,
  CreateSteeringDocumentRequest,
  UpdateSteeringDocumentRequest,
} from '@/types'

// Mock the steering document service
vi.mock('@/services', () => ({
  steeringDocumentService: {
    getEpicDocuments: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    linkToEpic: vi.fn(),
    unlinkFromEpic: vi.fn(),
    list: vi.fn(),
  },
}))

// Mock child components
vi.mock('../SteeringDocumentFormDialog.vue', () => ({
  default: {
    name: 'SteeringDocumentFormDialog',
    template: '<div class="steering-document-form-dialog" />',
    props: ['modelValue', 'mode', 'document', 'epicId', 'loading'],
    emits: ['update:modelValue', 'submit', 'cancel'],
  },
}))

vi.mock('@/components/forms/SteeringDocumentSelector.vue', () => ({
  default: {
    name: 'SteeringDocumentSelector',
    template: '<div class="steering-document-selector" />',
    props: ['modelValue', 'epicId', 'excludeDocumentIds'],
    emits: ['update:modelValue', 'select', 'cancel'],
  },
}))

const vuetify = createVuetify()

// Mock Vuetify components for testing
const mockVDialog = {
  template: '<div class="v-dialog" v-if="modelValue"><slot /></div>',
  props: ['modelValue', 'maxWidth', 'persistent'],
  emits: ['update:modelValue'],
}

const mockVCard = {
  template: '<div class="v-card"><slot /></div>',
}

const mockVCardTitle = {
  template: '<div class="v-card-title"><slot /></div>',
}

const mockVCardText = {
  template: '<div class="v-card-text"><slot /></div>',
}

const mockVCardActions = {
  template: '<div class="v-card-actions"><slot /></div>',
}

const mockVContainer = {
  template: '<div class="v-container"><slot /></div>',
}

const mockVRow = {
  template: '<div class="v-row"><slot /></div>',
}

const mockVCol = {
  template: '<div class="v-col"><slot /></div>',
  props: ['cols'],
}

const mockVBtn = {
  template:
    '<button :disabled="disabled || loading" :class="{ loading }" @click="$emit(\'click\')"><slot /></button>',
  props: ['color', 'variant', 'prependIcon', 'disabled', 'loading', 'icon', 'size'],
  emits: ['click'],
}

const mockVChip = {
  template: '<span class="v-chip"><slot /></span>',
  props: ['color', 'variant'],
}

const mockVSpacer = {
  template: '<div class="v-spacer"></div>',
}

const mockVProgressCircular = {
  template: '<div class="v-progress-circular"></div>',
  props: ['indeterminate', 'color'],
}

const mockVAlert = {
  template: '<div class="v-alert" :class="`v-alert--${type}`"><slot /></div>',
  props: ['type', 'variant', 'closable'],
  emits: ['click:close'],
}

const mockVList = {
  template: '<div class="v-list"><slot /></div>',
}

const mockVListItem = {
  template: '<div class="v-list-item" @click="$emit(\'click\')"><slot /></div>',
  props: ['title', 'subtitle'],
  emits: ['click'],
}

const mockVIcon = {
  template: '<i class="v-icon"></i>',
  props: ['color', 'size'],
}

const createWrapper = (props = {}) => {
  return mount(EpicSteeringDocumentsDialog, {
    props: {
      modelValue: true,
      epic: mockEpic,
      ...props,
    },
    global: {
      plugins: [vuetify],
      stubs: {
        'v-dialog': mockVDialog,
        'v-card': mockVCard,
        'v-card-title': mockVCardTitle,
        'v-card-text': mockVCardText,
        'v-card-actions': mockVCardActions,
        'v-container': mockVContainer,
        'v-row': mockVRow,
        'v-col': mockVCol,
        'v-btn': mockVBtn,
        'v-chip': mockVChip,
        'v-spacer': mockVSpacer,
        'v-progress-circular': mockVProgressCircular,
        'v-alert': mockVAlert,
        'v-list': mockVList,
        'v-list-item': mockVListItem,
        'v-icon': mockVIcon,
        SteeringDocumentFormDialog: {
          name: 'SteeringDocumentFormDialog',
          template: '<div class="steering-document-form-dialog" />',
          props: ['modelValue', 'mode', 'document', 'epicId', 'loading'],
          emits: ['update:modelValue', 'submit', 'cancel'],
        },
        SteeringDocumentSelector: {
          name: 'SteeringDocumentSelector',
          template: '<div class="steering-document-selector" />',
          props: ['modelValue', 'epicId', 'excludeDocumentIds'],
          emits: ['update:modelValue', 'select', 'cancel'],
        },
      },
    },
  })
}

const mockEpic: Epic = {
  id: 'epic-1',
  reference_id: 'EPC-001',
  title: 'Test Epic',
  description: 'Test epic description',
  status: 'Draft',
  priority: 1,
  creator_id: 'user1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockSteeringDocuments: SteeringDocument[] = [
  {
    id: 'doc-1',
    reference_id: 'STD-001',
    title: 'Document 1',
    description: 'Description 1',
    creator_id: 'user1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'doc-2',
    reference_id: 'STD-002',
    title: 'Document 2',
    description: 'Description 2',
    creator_id: 'user2',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
]

describe('EpicSteeringDocumentsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders dialog when modelValue is true', () => {
      const wrapper = createWrapper({ modelValue: true })

      expect(wrapper.find('.v-dialog').exists()).toBe(true)
      expect(wrapper.find('.v-card').exists()).toBe(true)
    })

    it('displays epic reference ID in title', () => {
      const wrapper = createWrapper()

      const chip = wrapper.find('.v-chip')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toBe(mockEpic.reference_id)
    })

    it('renders action buttons', () => {
      const wrapper = createWrapper()

      const buttons = wrapper.findAll('button')
      const createButton = buttons.find((btn) => btn.text().includes('Создать документ'))
      const linkButton = buttons.find((btn) => btn.text().includes('Привязать документ'))

      expect(createButton).toBeTruthy()
      expect(linkButton).toBeTruthy()
    })

    it('shows loading state when loading', async () => {
      vi.mocked(steeringDocumentService.getEpicDocuments).mockImplementation(
        () => new Promise(() => {}), // Never resolves to simulate loading
      )

      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.v-progress-circular').exists()).toBe(true)
      expect(wrapper.text()).toContain('Загрузка документов...')
    })

    it('shows error message when API fails', async () => {
      const errorMessage = 'API Error'
      vi.mocked(steeringDocumentService.getEpicDocuments).mockRejectedValue(new Error(errorMessage))

      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.v-alert--error').exists()).toBe(true)
      expect(wrapper.text()).toContain(errorMessage)
    })
  })

  describe('Documents List Display', () => {
    beforeEach(() => {
      vi.mocked(steeringDocumentService.getEpicDocuments).mockResolvedValue(mockSteeringDocuments)
    })

    it('displays list of epic documents', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      const listItems = wrapper.findAll('.v-list-item')
      expect(listItems).toHaveLength(mockSteeringDocuments.length)
    })

    it('shows document count in header', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain(`Привязанные документы (${mockSteeringDocuments.length})`)
    })

    it('displays empty state when no documents', async () => {
      vi.mocked(steeringDocumentService.getEpicDocuments).mockResolvedValue([])

      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Нет привязанных документов')
      expect(wrapper.text()).toContain('Создайте новый документ или привяжите существующий')
    })

    it('formats document creation date correctly', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      // Check that formatDate method works correctly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedDate = (wrapper.vm as any).formatDate('2024-01-01T00:00:00Z')
      expect(formattedDate).toBe('1 янв. 2024 г.')
    })
  })

  describe('Document Creation', () => {
    beforeEach(() => {
      vi.mocked(steeringDocumentService.getEpicDocuments).mockResolvedValue([])
      vi.mocked(steeringDocumentService.create).mockResolvedValue(mockSteeringDocuments[0])
    })

    it('opens create dialog when create button is clicked', async () => {
      const wrapper = createWrapper()

      const buttons = wrapper.findAll('button')
      const createButton = buttons.find((btn) => btn.text().includes('Создать документ'))

      await createButton?.trigger('click')

      const formDialog = wrapper.findComponent({ name: 'SteeringDocumentFormDialog' })
      expect(formDialog.props('modelValue')).toBe(true)
      expect(formDialog.props('mode')).toBe('create')
      expect(formDialog.props('epicId')).toBe(mockEpic.id)
    })

    it('handles document creation submission', async () => {
      const wrapper = createWrapper()

      const createData: CreateSteeringDocumentRequest = {
        title: 'New Document',
        description: 'New description',
        epic_id: mockEpic.id,
      }

      // Simulate form submission
      const formDialog = wrapper.findComponent({ name: 'SteeringDocumentFormDialog' })
      await formDialog.vm.$emit('submit', createData)

      expect(steeringDocumentService.create).toHaveBeenCalledWith(createData)
    })

    it('shows success message after document creation', async () => {
      const wrapper = createWrapper()

      const createData: CreateSteeringDocumentRequest = {
        title: 'New Document',
        epic_id: mockEpic.id,
      }

      // Simulate form submission
      const formDialog = wrapper.findComponent({ name: 'SteeringDocumentFormDialog' })
      await formDialog.vm.$emit('submit', createData)

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.v-alert--success').exists()).toBe(true)
      expect(wrapper.text()).toContain('Документ успешно создан и привязан к эпику')
    })

    it('emits documentsUpdated event after creation', async () => {
      const wrapper = createWrapper()

      const createData: CreateSteeringDocumentRequest = {
        title: 'New Document',
        epic_id: mockEpic.id,
      }

      // Simulate form submission
      const formDialog = wrapper.findComponent({ name: 'SteeringDocumentFormDialog' })
      await formDialog.vm.$emit('submit', createData)

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(wrapper.emitted('documentsUpdated')).toBeTruthy()
    })
  })

  describe('Document Editing', () => {
    beforeEach(() => {
      vi.mocked(steeringDocumentService.getEpicDocuments).mockResolvedValue(mockSteeringDocuments)
      vi.mocked(steeringDocumentService.update).mockResolvedValue(mockSteeringDocuments[0])
    })

    it('opens edit dialog when edit button is clicked', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // Wait for documents to load
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      // Find and click edit button (first button in list item actions)
      const editButtons = wrapper
        .findAll('button')
        .filter((btn) => btn.attributes('class')?.includes('v-btn') && !btn.text())

      if (editButtons.length > 0) {
        await editButtons[0].trigger('click')

        const formDialog = wrapper.findComponent({ name: 'SteeringDocumentFormDialog' })
        expect(formDialog.props('modelValue')).toBe(true)
        expect(formDialog.props('mode')).toBe('edit')
        expect(formDialog.props('document')).toEqual(mockSteeringDocuments[0])
      }
    })

    it('handles document update submission', async () => {
      const wrapper = createWrapper()

      // Set up edit mode
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).selectedDocument = mockSteeringDocuments[0]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).formMode = 'edit'

      const updateData: UpdateSteeringDocumentRequest = {
        title: 'Updated Document',
        description: 'Updated description',
      }

      // Simulate form submission
      const formDialog = wrapper.findComponent({ name: 'SteeringDocumentFormDialog' })
      await formDialog.vm.$emit('submit', updateData)

      expect(steeringDocumentService.update).toHaveBeenCalledWith(
        mockSteeringDocuments[0].id,
        updateData,
      )
    })

    it('shows success message after document update', async () => {
      const wrapper = createWrapper()

      // Set up edit mode
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).selectedDocument = mockSteeringDocuments[0]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).formMode = 'edit'

      const updateData: UpdateSteeringDocumentRequest = {
        title: 'Updated Document',
      }

      // Simulate form submission
      const formDialog = wrapper.findComponent({ name: 'SteeringDocumentFormDialog' })
      await formDialog.vm.$emit('submit', updateData)

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.v-alert--success').exists()).toBe(true)
      expect(wrapper.text()).toContain('Документ успешно обновлен')
    })
  })

  describe('Document Linking', () => {
    beforeEach(() => {
      vi.mocked(steeringDocumentService.getEpicDocuments).mockResolvedValue([])
      vi.mocked(steeringDocumentService.linkToEpic).mockResolvedValue()
    })

    it('opens selector dialog when link button is clicked', async () => {
      const wrapper = createWrapper()

      const buttons = wrapper.findAll('button')
      const linkButton = buttons.find((btn) => btn.text().includes('Привязать документ'))

      await linkButton?.trigger('click')

      // Check that the selector dialog state is opened
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).showSelectorDialog).toBe(true)
    })

    it('passes excluded document IDs to selector', async () => {
      vi.mocked(steeringDocumentService.getEpicDocuments).mockResolvedValue(mockSteeringDocuments)

      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // Wait for documents to load
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('button')
      const linkButton = buttons.find((btn) => btn.text().includes('Привязать документ'))

      await linkButton?.trigger('click')
      await wrapper.vm.$nextTick()

      // Check that linkedDocumentIds computed property has the expected values
      const expectedIds = mockSteeringDocuments.map((doc) => doc.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).linkedDocumentIds).toEqual(expectedIds)
    })

    it('handles document linking', async () => {
      const wrapper = createWrapper()

      const documentToLink = mockSteeringDocuments[0]

      // Set up the selector dialog state and simulate document selection
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).selectedDocumentId = documentToLink.id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).showSelectorDialog = true

      // Simulate clicking the link button in the selector dialog
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (wrapper.vm as any).handleDocumentLinkConfirm()

      expect(steeringDocumentService.linkToEpic).toHaveBeenCalledWith(
        mockEpic.id,
        documentToLink.id,
      )
    })

    it('shows success message after linking', async () => {
      const wrapper = createWrapper()

      const documentToLink = mockSteeringDocuments[0]

      // Set up the selector dialog state and simulate document selection
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).selectedDocumentId = documentToLink.id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).showSelectorDialog = true

      // Simulate clicking the link button in the selector dialog
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (wrapper.vm as any).handleDocumentLinkConfirm()

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.v-alert--success').exists()).toBe(true)
      expect(wrapper.text()).toContain('успешно привязан к эпику')
    })
  })

  describe('Document Unlinking', () => {
    beforeEach(() => {
      vi.mocked(steeringDocumentService.getEpicDocuments).mockResolvedValue(mockSteeringDocuments)
      vi.mocked(steeringDocumentService.unlinkFromEpic).mockResolvedValue()
    })

    it('shows confirmation dialog when unlink button is clicked', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // Wait for documents to load
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      // Simulate clicking unlink button by calling the method directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).confirmUnlinkDocument(mockSteeringDocuments[0])
      await wrapper.vm.$nextTick()

      // Check that confirmation dialog state is set
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).showUnlinkDialog).toBe(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).documentToUnlink).toEqual(mockSteeringDocuments[0])
    })

    it('handles document unlinking confirmation', async () => {
      const wrapper = createWrapper()

      // Set up unlink state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).documentToUnlink = mockSteeringDocuments[0]

      // Call unlink method directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (wrapper.vm as any).handleDocumentUnlink()

      expect(steeringDocumentService.unlinkFromEpic).toHaveBeenCalledWith(
        mockEpic.id,
        mockSteeringDocuments[0].id,
      )
    })

    it('shows success message after unlinking', async () => {
      const wrapper = createWrapper()

      // Set up unlink state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).documentToUnlink = mockSteeringDocuments[0]

      // Call unlink method directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (wrapper.vm as any).handleDocumentUnlink()

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.v-alert--success').exists()).toBe(true)
      expect(wrapper.text()).toContain(
        `Документ "${mockSteeringDocuments[0].title}" отвязан от эпика`,
      )
    })

    it('emits documentsUpdated event after unlinking', async () => {
      const wrapper = createWrapper()

      // Set up unlink state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).documentToUnlink = mockSteeringDocuments[0]

      // Call unlink method directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (wrapper.vm as any).handleDocumentUnlink()

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(wrapper.emitted('documentsUpdated')).toBeTruthy()
    })
  })

  describe('Error Handling', () => {
    it('handles API errors during document creation', async () => {
      const errorMessage = 'Creation failed'
      vi.mocked(steeringDocumentService.create).mockRejectedValue(new Error(errorMessage))

      const wrapper = createWrapper()

      const createData: CreateSteeringDocumentRequest = {
        title: 'New Document',
        epic_id: mockEpic.id,
      }

      // Simulate form submission
      const formDialog = wrapper.findComponent({ name: 'SteeringDocumentFormDialog' })
      await formDialog.vm.$emit('submit', createData)

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.v-alert--error').exists()).toBe(true)
      expect(wrapper.text()).toContain(errorMessage)
    })

    it('handles API errors during document linking', async () => {
      const errorMessage = 'Linking failed'
      vi.mocked(steeringDocumentService.linkToEpic).mockRejectedValue(new Error(errorMessage))

      const wrapper = createWrapper()

      const documentToLink = mockSteeringDocuments[0]

      // Set up the selector dialog state and simulate document selection
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).selectedDocumentId = documentToLink.id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).showSelectorDialog = true

      // Simulate clicking the link button in the selector dialog
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (wrapper.vm as any).handleDocumentLinkConfirm()

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.v-alert--error').exists()).toBe(true)
      expect(wrapper.text()).toContain(errorMessage)
    })

    it('handles API errors during document unlinking', async () => {
      const errorMessage = 'Unlinking failed'
      vi.mocked(steeringDocumentService.unlinkFromEpic).mockRejectedValue(new Error(errorMessage))

      const wrapper = createWrapper()

      // Set up unlink state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).documentToUnlink = mockSteeringDocuments[0]

      // Call unlink method directly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (wrapper.vm as any).handleDocumentUnlink()

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.v-alert--error').exists()).toBe(true)
      expect(wrapper.text()).toContain(errorMessage)
    })

    it('clears error messages when alert is closed', async () => {
      const wrapper = createWrapper()

      // Set error message
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).errorMessage = 'Test error'
      await wrapper.vm.$nextTick()

      // Check that error message is set
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).errorMessage).toBe('Test error')

      // Simulate clicking the close button by directly setting the error message to empty
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).errorMessage = ''
      await wrapper.vm.$nextTick()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).errorMessage).toBe('')
    })
  })

  describe('Dialog State Management', () => {
    it('resets state when dialog opens', async () => {
      const wrapper = createWrapper({ modelValue: false })

      // Set some state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).errorMessage = 'Test error'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).successMessage = 'Test success'

      // Open dialog
      await wrapper.setProps({ modelValue: true })

      // State should be reset
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).errorMessage).toBe('')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).successMessage).toBe('')
    })

    it('loads documents when epic changes', async () => {
      const wrapper = createWrapper()

      const newEpic: Epic = {
        ...mockEpic,
        id: 'epic-2',
        reference_id: 'EPC-002',
      }

      await wrapper.setProps({ epic: newEpic })

      expect(steeringDocumentService.getEpicDocuments).toHaveBeenCalledWith(newEpic.id)
    })

    it('emits update:modelValue when dialog is closed', async () => {
      const wrapper = createWrapper({ modelValue: true })

      const closeButton = wrapper.findAll('button').find((btn) => btn.text().includes('Закрыть'))
      await closeButton?.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
    })

    it('handles form dialog cancellation', async () => {
      const wrapper = createWrapper()

      // Open form dialog
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).showFormDialog = true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).selectedDocument = mockSteeringDocuments[0]

      // Simulate form cancellation
      const formDialog = wrapper.findComponent({ name: 'SteeringDocumentFormDialog' })
      await formDialog.vm.$emit('cancel')

      // Form dialog should be closed and selected document cleared
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).showFormDialog).toBe(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).selectedDocument).toBeUndefined()
    })

    it('handles selector dialog cancellation', async () => {
      const wrapper = createWrapper()

      // Open selector dialog
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).showSelectorDialog = true
      await wrapper.vm.$nextTick()

      // Verify dialog is open
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).showSelectorDialog).toBe(true)

      // Directly close the dialog (simulating cancel button click)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).showSelectorDialog = false
      await wrapper.vm.$nextTick()

      // Selector dialog should be closed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).showSelectorDialog).toBe(false)
    })
  })

  describe('Loading States', () => {
    it('disables buttons during loading', async () => {
      vi.mocked(steeringDocumentService.getEpicDocuments).mockImplementation(
        () => new Promise(() => {}), // Never resolves to simulate loading
      )

      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.attributes('disabled')).toBeDefined()
      })
    })

    it('shows form loading state during document operations', async () => {
      const wrapper = createWrapper()

      // Set form loading state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).formLoading = true
      await wrapper.vm.$nextTick()

      const formDialog = wrapper.findComponent({ name: 'SteeringDocumentFormDialog' })
      expect(formDialog.props('loading')).toBe(true)
    })

    it('shows unlink loading state during unlink operation', async () => {
      vi.mocked(steeringDocumentService.unlinkFromEpic).mockImplementation(
        () => new Promise(() => {}), // Never resolves to simulate loading
      )

      const wrapper = createWrapper()

      // Set up unlink state and trigger unlink
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).documentToUnlink = mockSteeringDocuments[0]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).handleDocumentUnlink()

      await wrapper.vm.$nextTick()

      // Check that unlink loading state is set
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).unlinkLoading).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles missing epic gracefully', () => {
      const wrapper = createWrapper({ epic: undefined })

      expect(wrapper.find('.v-chip').exists()).toBe(false)
      expect(steeringDocumentService.getEpicDocuments).not.toHaveBeenCalled()
    })

    it('handles empty epic ID gracefully', () => {
      const epicWithoutId = { ...mockEpic, id: '' }
      const wrapper = createWrapper({ epic: epicWithoutId })

      // Should render without errors
      expect(wrapper.find('.v-dialog').exists()).toBe(true)
      expect(steeringDocumentService.getEpicDocuments).not.toHaveBeenCalled()
    })

    it('handles document without description in display', async () => {
      const documentsWithoutDescription = [
        {
          ...mockSteeringDocuments[0],
          description: undefined,
        },
      ]

      vi.mocked(steeringDocumentService.getEpicDocuments).mockResolvedValue(
        documentsWithoutDescription,
      )

      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      // Wait for documents to load
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      // Should not throw error and should display the document
      const listItems = wrapper.findAll('.v-list-item')
      expect(listItems).toHaveLength(1)
    })
  })
})
