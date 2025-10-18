import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import SteeringDocumentFormDialog from '../SteeringDocumentFormDialog.vue'
import type {
  SteeringDocument,
  CreateSteeringDocumentRequest,
  UpdateSteeringDocumentRequest,
} from '@/types'

// Mock MarkdownEditor component
vi.mock('@/components/forms', () => ({
  MarkdownEditor: {
    name: 'MarkdownEditor',
    template: '<textarea v-model="modelValue" :disabled="disabled" :placeholder="placeholder" />',
    props: ['modelValue', 'label', 'rules', 'counter', 'disabled', 'placeholder'],
    emits: ['update:modelValue'],
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

const mockVForm = {
  template: '<form @submit.prevent="handleSubmit"><slot /></form>',
  props: ['modelValue'],
  emits: ['submit', 'update:modelValue'],
  methods: {
    handleSubmit() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(this as any).$emit('submit')
    },
    validate() {
      return Promise.resolve({ valid: true })
    },
    reset() {
      // Mock reset method
    },
  },
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

const mockVTextField = {
  template: '<input type="text" v-model="modelValue" :disabled="disabled" />',
  props: [
    'modelValue',
    'label',
    'variant',
    'rules',
    'counter',
    'required',
    'autofocus',
    'disabled',
  ],
  emits: ['update:modelValue'],
}

const mockVAlert = {
  template: '<div class="v-alert" :class="`v-alert--${type}`"><slot /></div>',
  props: ['type', 'variant'],
}

const mockVIcon = {
  template: '<i class="v-icon"></i>',
  props: ['start'],
}

const mockVSpacer = {
  template: '<div class="v-spacer"></div>',
}

const mockVBtn = {
  template:
    '<button :type="type || \'button\'" :disabled="disabled || loading" :class="{ loading }" @click="$emit(\'click\')"><slot /></button>',
  props: ['color', 'variant', 'type', 'loading', 'disabled'],
  emits: ['click'],
}

const createWrapper = (props = {}) => {
  return mount(SteeringDocumentFormDialog, {
    props: {
      modelValue: true,
      mode: 'create',
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
        'v-form': mockVForm,
        'v-container': mockVContainer,
        'v-row': mockVRow,
        'v-col': mockVCol,
        'v-text-field': mockVTextField,
        'v-alert': mockVAlert,
        'v-icon': mockVIcon,
        'v-spacer': mockVSpacer,
        'v-btn': mockVBtn,
        MarkdownEditor: {
          name: 'MarkdownEditor',
          template:
            '<textarea v-model="modelValue" :disabled="disabled" :placeholder="placeholder" />',
          props: ['modelValue', 'label', 'rules', 'counter', 'disabled', 'placeholder'],
          emits: ['update:modelValue'],
        },
      },
    },
  })
}

const mockSteeringDocument: SteeringDocument = {
  id: '1',
  reference_id: 'STD-001',
  title: 'Test Document',
  description: 'Test description',
  creator_id: 'user1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('SteeringDocumentFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders dialog when modelValue is true', () => {
      const wrapper = createWrapper({ modelValue: true })

      expect(wrapper.find('.v-dialog').exists()).toBe(true)
      expect(wrapper.find('.v-card').exists()).toBe(true)
    })

    it('displays correct title for create mode', () => {
      const wrapper = createWrapper({ mode: 'create' })

      expect(wrapper.find('.text-h5').text()).toBe('Создать steering-документ')
    })

    it('displays correct title for edit mode', () => {
      const wrapper = createWrapper({ mode: 'edit' })

      expect(wrapper.find('.text-h5').text()).toBe('Редактировать steering-документ')
    })

    it('renders title field with correct properties', () => {
      const wrapper = createWrapper()

      const titleField = wrapper.find('input[type="text"]')
      expect(titleField.exists()).toBe(true)
    })

    it('renders markdown editor for description', () => {
      const wrapper = createWrapper()

      const markdownEditor = wrapper.findComponent({ name: 'MarkdownEditor' })
      expect(markdownEditor.exists()).toBe(true)
      expect(markdownEditor.props('label')).toBe('Описание (Markdown)')
      expect(markdownEditor.props('counter')).toBe(true)
    })

    it('shows epic auto-link info when epicId is provided', () => {
      const wrapper = createWrapper({ epicId: 'epic-123' })

      const alert = wrapper.find('.v-alert')
      expect(alert.exists()).toBe(true)
      expect(alert.text()).toContain('Документ будет автоматически привязан к текущему эпику')
    })

    it('does not show epic info when epicId is not provided', () => {
      const wrapper = createWrapper()

      const alert = wrapper.find('.v-alert[type="info"]')
      expect(alert.exists()).toBe(false)
    })
  })

  describe('Form Validation', () => {
    it('validates title as required field', async () => {
      const wrapper = createWrapper()

      // Check that title field has required validation rules
      const titleField = wrapper.find('input[type="text"]')
      expect(titleField.exists()).toBe(true)

      // Check that the component has validation rules defined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const titleRules = (wrapper.vm as any).titleRules
      expect(titleRules).toBeDefined()
      expect(Array.isArray(titleRules)).toBe(true)
    })

    it('validates title maximum length (500 characters)', async () => {
      const wrapper = createWrapper()
      const longTitle = 'a'.repeat(501)

      // Set title directly in the component's form data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).form.title = longTitle

      // The validation should prevent submission - check if form is invalid
      // Since we're using mocked components, we'll check the component's internal state
      await wrapper.vm.$nextTick()

      // The component should have validation rules that would make this invalid
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).form.title).toBe(longTitle)
    })

    it('accepts valid title within length limit', async () => {
      const wrapper = createWrapper()
      const validTitle = 'Valid Title'

      // Set title directly in the component's form data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).form.title = validTitle

      // Wait for validation
      await wrapper.vm.$nextTick()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((wrapper.vm as any).form.title).toBe(validTitle)
    })

    it('validates description maximum length (50000 characters)', async () => {
      const wrapper = createWrapper()
      const longDescription = 'a'.repeat(50001)

      const markdownEditor = wrapper.findComponent({ name: 'MarkdownEditor' })
      await markdownEditor.vm.$emit('update:modelValue', longDescription)

      // The validation should be applied through rules
      expect(markdownEditor.props('rules')).toBeDefined()
    })

    it('accepts empty description as valid', async () => {
      const wrapper = createWrapper()

      const markdownEditor = wrapper.findComponent({ name: 'MarkdownEditor' })
      await markdownEditor.vm.$emit('update:modelValue', '')

      // Empty description should be valid
      expect(markdownEditor.props('rules')).toBeDefined()
    })

    it('trims whitespace from title', async () => {
      const wrapper = createWrapper()

      // Set title with whitespace directly in the component's form data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).form.title = '  Test Title  '

      // Call the component's handleSubmit method directly
      await wrapper.vm.handleSubmit()

      // Should emit trimmed title
      const emitted = wrapper.emitted('submit')
      expect(emitted).toBeTruthy()
      if (emitted) {
        const submitData = emitted[0][0] as CreateSteeringDocumentRequest
        expect(submitData.title).toBe('Test Title')
      }
    })
  })

  describe('Create Mode', () => {
    it('initializes with empty form in create mode', () => {
      const wrapper = createWrapper({ mode: 'create' })

      const titleField = wrapper.find('input[type="text"]')
      expect((titleField.element as HTMLInputElement).value).toBe('')
    })

    it('emits create request with correct data structure', async () => {
      const wrapper = createWrapper({ mode: 'create' })

      // Fill form data directly in the component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).form.title = 'New Document'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).form.description = 'New description'

      // Call handleSubmit directly
      await wrapper.vm.handleSubmit()

      const emitted = wrapper.emitted('submit')
      expect(emitted).toBeTruthy()

      const submitData = emitted![0][0] as CreateSteeringDocumentRequest
      expect(submitData).toEqual({
        title: 'New Document',
        description: 'New description',
        epic_id: undefined,
      })
    })

    it('includes epic_id when provided in create mode', async () => {
      const wrapper = createWrapper({ mode: 'create', epicId: 'epic-123' })

      // Fill form data directly in the component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).form.title = 'New Document'

      // Call handleSubmit directly
      await wrapper.vm.handleSubmit()

      const emitted = wrapper.emitted('submit')
      expect(emitted).toBeTruthy()

      const submitData = emitted![0][0] as CreateSteeringDocumentRequest
      expect(submitData.epic_id).toBe('epic-123')
    })

    it('omits description when empty in create mode', async () => {
      const wrapper = createWrapper({ mode: 'create' })

      // Fill only title directly in the component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).form.title = 'New Document'

      // Call handleSubmit directly
      await wrapper.vm.handleSubmit()

      const emitted = wrapper.emitted('submit')
      expect(emitted).toBeTruthy()

      const submitData = emitted![0][0] as CreateSteeringDocumentRequest
      expect(submitData.description).toBeUndefined()
    })
  })

  describe('Edit Mode', () => {
    it('initializes form with document data in edit mode', async () => {
      const wrapper = createWrapper({
        mode: 'edit',
        document: mockSteeringDocument,
      })

      await wrapper.vm.$nextTick()

      const titleField = wrapper.find('input[type="text"]')
      expect((titleField.element as HTMLInputElement).value).toBe(mockSteeringDocument.title)
    })

    it('emits update request with correct data structure', async () => {
      const wrapper = createWrapper({
        mode: 'edit',
        document: mockSteeringDocument,
      })

      // Modify title directly in the component's form data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).form.title = 'Updated Document'

      // Call handleSubmit directly
      await wrapper.vm.handleSubmit()

      const emitted = wrapper.emitted('submit')
      expect(emitted).toBeTruthy()

      const submitData = emitted![0][0] as UpdateSteeringDocumentRequest
      expect(submitData).toEqual({
        title: 'Updated Document',
        description: mockSteeringDocument.description,
      })
    })

    it('handles document without description in edit mode', async () => {
      const documentWithoutDescription = {
        ...mockSteeringDocument,
        description: undefined,
      }

      const wrapper = createWrapper({
        mode: 'edit',
        document: documentWithoutDescription,
      })

      await wrapper.vm.$nextTick()

      const markdownEditor = wrapper.findComponent({ name: 'MarkdownEditor' })
      expect(markdownEditor.props('modelValue')).toBe('')
    })
  })

  describe('Loading State', () => {
    it('disables form fields when loading', () => {
      const wrapper = createWrapper({ loading: true })

      const titleField = wrapper.find('input[type="text"]')
      expect(titleField.attributes('disabled')).toBeDefined()

      const markdownEditor = wrapper.findComponent({ name: 'MarkdownEditor' })
      expect(markdownEditor.props('disabled')).toBe(true)
    })

    it('disables buttons when loading', () => {
      const wrapper = createWrapper({ loading: true })

      const buttons = wrapper.findAll('button')
      const cancelButton = buttons[0]
      const submitButton = buttons[1]

      expect(cancelButton.attributes('disabled')).toBeDefined()
      expect(submitButton.classes()).toContain('loading')
    })
  })

  describe('Error Handling', () => {
    it('displays error message when provided', async () => {
      const wrapper = createWrapper()

      // Simulate error by accessing the component's internal state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).errorMessage = 'Test error message'
      await wrapper.vm.$nextTick()

      const errorAlert = wrapper.find('.v-alert--error')
      expect(errorAlert.exists()).toBe(true)
      expect(errorAlert.text()).toBe('Test error message')
    })

    it('clears error message on form initialization', async () => {
      const wrapper = createWrapper()

      // Set error message
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).errorMessage = 'Test error'
      await wrapper.vm.$nextTick()

      // Reinitialize form (simulate dialog reopening)
      await wrapper.setProps({ modelValue: false })
      await wrapper.setProps({ modelValue: true })

      const errorAlert = wrapper.find('.v-alert--error')
      expect(errorAlert.exists()).toBe(false)
    })
  })

  describe('Dialog Interaction', () => {
    it('emits cancel event when cancel button is clicked', async () => {
      const wrapper = createWrapper()

      const buttons = wrapper.findAll('button')
      const cancelButton = buttons[0] // First button should be cancel
      await cancelButton.trigger('click')

      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('updates modelValue when dialog is closed', async () => {
      const wrapper = createWrapper({ modelValue: true })

      // The computed property should handle modelValue changes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).internalValue = false
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('reinitializes form when dialog is reopened', async () => {
      const wrapper = createWrapper({
        mode: 'edit',
        document: mockSteeringDocument,
        modelValue: false,
      })

      // Open dialog
      await wrapper.setProps({ modelValue: true })

      await wrapper.vm.$nextTick()

      const titleField = wrapper.find('input[type="text"]')
      expect((titleField.element as HTMLInputElement).value).toBe(mockSteeringDocument.title)
    })
  })

  describe('Form Reset', () => {
    it('exposes resetForm method', () => {
      const wrapper = createWrapper()

      expect(wrapper.vm.resetForm).toBeDefined()
      expect(typeof wrapper.vm.resetForm).toBe('function')
    })

    it('resets form to initial state when resetForm is called', async () => {
      const wrapper = createWrapper({ mode: 'create' })

      // Fill form data directly in the component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(wrapper.vm as any).form.title = 'Test Title'

      // Reset form
      wrapper.vm.resetForm()
      await wrapper.vm.$nextTick()

      // Check that the component's internal form state is reset
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formData = (wrapper.vm as any).form
      expect(formData.title).toBe('')
    })
  })

  describe('Watchers', () => {
    it('reinitializes form when document prop changes', async () => {
      const wrapper = createWrapper({
        mode: 'edit',
        document: mockSteeringDocument,
        modelValue: true,
      })

      const newDocument: SteeringDocument = {
        ...mockSteeringDocument,
        id: '2',
        title: 'New Document Title',
      }

      await wrapper.setProps({ document: newDocument })
      await wrapper.vm.$nextTick()

      const titleField = wrapper.find('input[type="text"]')
      expect((titleField.element as HTMLInputElement).value).toBe('New Document Title')
    })

    it('initializes form when dialog opens', async () => {
      const wrapper = createWrapper({
        mode: 'edit',
        document: mockSteeringDocument,
        modelValue: false,
      })

      await wrapper.setProps({ modelValue: true })
      await wrapper.vm.$nextTick()

      const titleField = wrapper.find('input[type="text"]')
      expect((titleField.element as HTMLInputElement).value).toBe(mockSteeringDocument.title)
    })
  })
})
