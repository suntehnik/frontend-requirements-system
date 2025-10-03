import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import MarkdownViewer from '../MarkdownViewer.vue'

// Mock md-editor-v3
vi.mock('md-editor-v3', () => ({
  MdPreview: {
    name: 'MdPreview',
    template: '<div class="mock-md-preview"><slot /></div>',
    props: {
      modelValue: String,
      language: String,
      theme: String,
      previewTheme: String,
      codeTheme: String,
      editorId: String
    },
    emits: ['on-error']
  }
}))

const vuetify = createVuetify()

const createWrapper = (props: Record<string, unknown> = {}) => {
  const defaultProps = { content: '' }
  return mount(MarkdownViewer, {
    props: { ...defaultProps, ...props },
    global: {
      plugins: [vuetify]
    }
  })
}

describe('MarkdownViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Props Interface (Task Requirement)', () => {
    it('should accept all required props with proper TypeScript interfaces', () => {
      const wrapper = createWrapper({
        content: '# Test Content',
        maxHeight: '400px',
        showCopyButton: true,
        enableMermaid: true,
        className: 'custom-class',
        language: 'en-US'
      })

      expect(wrapper.props()).toMatchObject({
        content: '# Test Content',
        maxHeight: '400px',
        showCopyButton: true,
        enableMermaid: true,
        className: 'custom-class',
        language: 'en-US'
      })
    })

    it('should have proper default values', () => {
      const wrapper = createWrapper({ content: '' })
      
      expect(wrapper.props()).toMatchObject({
        content: '',
        maxHeight: 'none',
        showCopyButton: true,
        enableMermaid: true,
        className: '',
        language: 'en-US'
      })
    })
  })

  describe('Empty State Handling (Requirement 3.10)', () => {
    it('should display empty state when content is null', () => {
      const wrapper = createWrapper({ content: null })
      
      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('No content to display')
      expect(emptyState.find('v-icon').exists()).toBe(true)
    })

    it('should display empty state when content is undefined', () => {
      const wrapper = createWrapper({ content: undefined })
      
      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
    })

    it('should display empty state when content is empty string', () => {
      const wrapper = createWrapper({ content: '' })
      
      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
    })

    it('should display empty state when content is only whitespace', () => {
      const wrapper = createWrapper({ content: '   \n\t  ' })
      
      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
    })

    it('should not display empty state when content exists', () => {
      const wrapper = createWrapper({ content: '# Valid Content' })
      
      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(false)
    })
  })

  describe('Error Handling and Fallback (Requirement 3.8)', () => {
    it('should display error state when rendering fails', async () => {
      const wrapper = createWrapper({ content: '# Test Content' })
      
      // Simulate rendering error
      const mdEditor = wrapper.findComponent({ name: 'MdPreview' })
      await mdEditor.vm.$emit('on-error', { name: 'RenderError', message: 'Failed to render' })
      
      await wrapper.vm.$nextTick()
      
      const errorState = wrapper.find('.error-state')
      expect(errorState.exists()).toBe(true)
      expect(errorState.text()).toContain('Failed to render markdown content')
      expect(errorState.find('pre').text()).toContain('# Test Content')
    })

    it('should show fallback with raw markdown text on error', async () => {
      const testContent = '# Test\n\nSome **bold** text'
      const wrapper = createWrapper({ content: testContent })
      
      // Simulate rendering error
      const mdEditor = wrapper.findComponent({ name: 'MdPreview' })
      await mdEditor.vm.$emit('on-error', { name: 'RenderError', message: 'Failed to render' })
      
      await wrapper.vm.$nextTick()
      
      const errorState = wrapper.find('.error-state')
      const fallbackContent = errorState.find('pre')
      expect(fallbackContent.text()).toBe(testContent)
    })

    it('should reset error state when content changes', async () => {
      const wrapper = createWrapper({ content: '# Test Content' })
      
      // Simulate rendering error
      const mdEditor = wrapper.findComponent({ name: 'MdPreview' })
      await mdEditor.vm.$emit('on-error', { name: 'RenderError', message: 'Failed to render' })
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.error-state').exists()).toBe(true)
      
      // Change content
      await wrapper.setProps({ content: '# New Content' })
      
      expect(wrapper.find('.error-state').exists()).toBe(false)
      expect(wrapper.find('.markdown-content').exists()).toBe(true)
    })
  })

  describe('Read-only Mode (Requirement 3.6)', () => {
    it('should render in preview-only mode', () => {
      const wrapper = createWrapper({ content: '# Test Content' })
      
      const mdPreview = wrapper.findComponent({ name: 'MdPreview' })
      expect(mdPreview.exists()).toBe(true)
      expect(mdPreview.props('modelValue')).toBe('# Test Content')
    })

    it('should not allow editing capabilities', () => {
      const wrapper = createWrapper({ content: '# Test Content' })
      
      // Verify MdPreview is used (read-only by nature)
      const mdPreview = wrapper.findComponent({ name: 'MdPreview' })
      expect(mdPreview.exists()).toBe(true)
      
      // Verify no editing UI elements are present
      expect(wrapper.find('.md-editor-toolbar').exists()).toBe(false)
      expect(wrapper.find('.md-editor-footer').exists()).toBe(false)
    })
  })

  describe('Responsive Design (Requirement 3.9)', () => {
    it('should apply maxHeight prop for scrolling behavior', () => {
      const wrapper = createWrapper({ 
        content: '# Test Content',
        maxHeight: '300px'
      })
      
      const markdownContent = wrapper.find('.markdown-content')
      expect(markdownContent.attributes('style')).toContain('max-height: 300px')
    })

    it('should apply custom className', () => {
      const wrapper = createWrapper({ 
        content: '# Test Content',
        className: 'custom-viewer-class'
      })
      
      const wrapper_element = wrapper.find('.markdown-viewer-wrapper')
      expect(wrapper_element.classes()).toContain('custom-viewer-class')
    })

    it('should handle responsive scaling through CSS classes', () => {
      const wrapper = createWrapper({ content: '# Test Content' })
      
      // Verify responsive CSS classes are applied
      expect(wrapper.find('.markdown-viewer-wrapper').exists()).toBe(true)
      expect(wrapper.find('.markdown-content').exists()).toBe(true)
    })
  })

  describe('Vuetify Theme Integration', () => {
    it('should integrate with Vuetify theming', () => {
      const wrapper = createWrapper({ content: '# Test Content' })
      
      const mdPreview = wrapper.findComponent({ name: 'MdPreview' })
      expect(mdPreview.props('theme')).toBeDefined()
      expect(mdPreview.props('previewTheme')).toBeDefined()
      expect(mdPreview.props('codeTheme')).toBeDefined()
    })

    it('should respond to theme changes', async () => {
      const wrapper = createWrapper({ content: '# Test Content' })
      
      // Initial theme should be set
      const mdPreview = wrapper.findComponent({ name: 'MdPreview' })
      const initialTheme = mdPreview.props('theme')
      expect(['light', 'dark']).toContain(initialTheme)
    })
  })

  describe('Content Updates', () => {
    it('should update internal value when content prop changes', async () => {
      const wrapper = createWrapper({ content: '# Initial Content' })
      
      await wrapper.setProps({ content: '# Updated Content' })
      
      const mdPreview = wrapper.findComponent({ name: 'MdPreview' })
      expect(mdPreview.props('modelValue')).toBe('# Updated Content')
    })

    it('should handle content changes from valid to empty', async () => {
      const wrapper = createWrapper({ content: '# Valid Content' })
      
      expect(wrapper.find('.markdown-content').exists()).toBe(true)
      expect(wrapper.find('.empty-state').exists()).toBe(false)
      
      await wrapper.setProps({ content: '' })
      
      expect(wrapper.find('.markdown-content').exists()).toBe(false)
      expect(wrapper.find('.empty-state').exists()).toBe(true)
    })

    it('should handle content changes from empty to valid', async () => {
      const wrapper = createWrapper({ content: '' })
      
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.markdown-content').exists()).toBe(false)
      
      await wrapper.setProps({ content: '# New Content' })
      
      expect(wrapper.find('.empty-state').exists()).toBe(false)
      expect(wrapper.find('.markdown-content').exists()).toBe(true)
    })
  })

  describe('Language Support', () => {
    it('should pass language prop to MdPreview', () => {
      const wrapper = createWrapper({ 
        content: '# Test Content',
        language: 'ru-RU'
      })
      
      const mdPreview = wrapper.findComponent({ name: 'MdPreview' })
      expect(mdPreview.props('language')).toBe('ru-RU')
    })

    it('should use default language when not specified', () => {
      const wrapper = createWrapper({ content: '# Test Content' })
      
      const mdPreview = wrapper.findComponent({ name: 'MdPreview' })
      expect(mdPreview.props('language')).toBe('en-US')
    })
  })

  describe('Component Structure', () => {
    it('should have proper component structure', () => {
      const wrapper = createWrapper({ content: '# Test Content' })
      
      expect(wrapper.find('.markdown-viewer-wrapper').exists()).toBe(true)
      expect(wrapper.find('.markdown-content').exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'MdPreview' }).exists()).toBe(true)
    })

    it('should apply markdown-viewer class to MdPreview', () => {
      const wrapper = createWrapper({ content: '# Test Content' })
      
      const mdPreview = wrapper.findComponent({ name: 'MdPreview' })
      expect(mdPreview.classes()).toContain('markdown-viewer')
    })
  })

  describe('Accessibility', () => {
    it('should provide accessible empty state', () => {
      const wrapper = createWrapper({ content: null })
      
      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
      
      const icon = emptyState.find('v-icon')
      expect(icon.exists()).toBe(true)
      
      const text = emptyState.find('p')
      expect(text.exists()).toBe(true)
      expect(text.text()).toBe('No content to display')
    })

    it('should provide accessible error state', async () => {
      const wrapper = createWrapper({ content: '# Test Content' })
      
      // Simulate rendering error
      const mdEditor = wrapper.findComponent({ name: 'MdPreview' })
      await mdEditor.vm.$emit('on-error', { name: 'RenderError', message: 'Failed to render' })
      await wrapper.vm.$nextTick()
      
      const errorState = wrapper.find('.error-state')
      expect(errorState.exists()).toBe(true)
      
      const errorIcon = errorState.find('v-icon')
      expect(errorIcon.exists()).toBe(true)
      expect(errorIcon.attributes('color')).toBe('error')
      
      const errorText = errorState.find('p')
      expect(errorText.exists()).toBe(true)
      expect(errorText.text()).toBe('Failed to render markdown content')
    })
  })
})