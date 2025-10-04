<template>
  <div class="markdown-editor-wrapper">
    <label v-if="label" class="v-label mb-2">{{ label }}</label>
    <MdEditor
      v-model="internalValue"
      :language="language"
      :theme="editorTheme"
      :preview-theme="previewTheme"
      :code-theme="codeTheme"
      :placeholder="placeholder"
      :toolbars="toolbars"
      :footers="footers"
      :scroll-auto="scrollAuto"
      :auto-focus="autoFocus"
      :disabled="disabled"
      :readonly="readonly"
      :max-length="maxLength"
      :auto-detect-code="autoDetectCode"
      :tab-width="tabWidth"
      :show-code-row-number="showCodeRowNumber"
      :preview-only="previewOnly"
      :html-preview="htmlPreview"
      @on-upload-img="handleUploadImg"
      @on-html-changed="handleHtmlChanged"
      @on-get-catalog="handleGetCatalog"
      @on-error="handleError"
      @on-blur="handleBlur"
      @on-focus="handleFocus"
      @on-input="handleInput"
      @on-save="handleSave"
      :class="editorClass"
    />
    <div v-if="hasError" class="error-message">
      {{ validationResult.message }}
    </div>
    <div v-if="counter && maxLength" class="counter">
      {{ internalValue.length }} / {{ maxLength }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTheme } from 'vuetify'
import { MdEditor } from 'md-editor-v3'
import type { ToolbarNames, Footers } from 'md-editor-v3'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  previewOnly?: boolean
  maxLength?: number
  counter?: boolean
  rules?: Array<(value: string) => boolean | string>
  language?: string
  autoFocus?: boolean
  scrollAuto?: boolean
  tabWidth?: number
  showCodeRowNumber?: boolean
  htmlPreview?: boolean
  autoDetectCode?: boolean
  toolbars?: ToolbarNames[]
  footers?: Footers[]
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'input', value: string): void
  (e: 'save', value: string, html: Promise<string>): void
  (e: 'upload-img', files: File[], callback: (urls: string[]) => void): void
  (e: 'html-changed', html: string): void
  (e: 'get-catalog', list: unknown[]): void
  (e: 'error', error: { name: string; message: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Введите текст в формате Markdown...',
  disabled: false,
  readonly: false,
  previewOnly: false,
  counter: false,
  language: 'ru-RU',
  autoFocus: false,
  scrollAuto: true,
  tabWidth: 2,
  showCodeRowNumber: true,
  htmlPreview: false,
  autoDetectCode: true,
  toolbars: () => [
    'bold',
    'underline',
    'italic',
    '-',
    'title',
    'strikeThrough',
    'sub',
    'sup',
    'quote',
    'unorderedList',
    'orderedList',
    'task',
    '-',
    'codeRow',
    'code',
    'link',
    'image',
    'table',
    'mermaid',
    'katex',
    '-',
    'revoke',
    'next',
    'save',
    '=',
    'pageFullscreen',
    'fullscreen',
    'preview',
    'previewOnly',
    'htmlPreview',
    'catalog',
  ],
  footers: () => ['markdownTotal', '=', 'scrollSwitch'] as Footers[],
})

const emit = defineEmits<Emits>()

// Get Vuetify theme
const theme = useTheme()

// Internal state
const internalValue = ref(props.modelValue)

// Computed properties
const validationResult = computed(() => {
  if (!props.rules) return { isValid: true, message: '' }

  for (const rule of props.rules) {
    const result = rule(internalValue.value)
    if (result !== true) {
      return {
        isValid: false,
        message: typeof result === 'string' ? result : 'Validation error',
      }
    }
  }

  return { isValid: true, message: '' }
})

const hasError = computed(() => !validationResult.value.isValid)

const editorClass = computed(() => {
  return hasError.value ? 'markdown-editor markdown-editor--error' : 'markdown-editor'
})

// Theme configuration based on Vuetify theme
const editorTheme = computed(() => (theme.global.name.value === 'dark' ? 'dark' : 'light'))
const previewTheme = computed(() => (theme.global.name.value === 'dark' ? 'github' : 'default'))
const codeTheme = computed(() => (theme.global.name.value === 'dark' ? 'atom' : 'github'))

// Mermaid configuration is handled by the editor itself

// Event handlers
const handleUploadImg = (files: File[], callback: (urls: string[]) => void) => {
  emit('upload-img', files, callback)
}

const handleHtmlChanged = (html: string) => {
  emit('html-changed', html)
}

const handleGetCatalog = (list: unknown[]) => {
  emit('get-catalog', list)
}

const handleError = (error: { name: string; message: string }) => {
  emit('error', error)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleInput = (value: string) => {
  emit('input', value)
}

const handleSave = (value: string, html: Promise<string>) => {
  emit('save', value, html)
}

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== internalValue.value) {
      internalValue.value = newValue
    }
  },
)

// Watch for internal changes
watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue)
})

// Mermaid is built-in to md-editor-v3, no need to register separately
</script>

<style scoped>
.markdown-editor-wrapper {
  width: 100%;
}

.markdown-editor {
  border-radius: 4px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: border-color 0.2s ease-in-out;
}

.markdown-editor:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.markdown-editor:focus-within {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}

.markdown-editor--error {
  border-color: rgb(var(--v-theme-error)) !important;
}

.markdown-editor--error:focus-within {
  box-shadow: 0 0 0 2px rgba(var(--v-theme-error), 0.2);
}

.error-message {
  color: rgb(var(--v-theme-error));
  font-size: 0.75rem;
  margin-top: 4px;
  margin-left: 16px;
}

.counter {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.75rem;
  margin-top: 4px;
  margin-left: 16px;
  text-align: right;
}

/* Override md-editor-v3 styles to match Vuetify theme */
:deep(.md-editor) {
  --md-color: rgb(var(--v-theme-on-surface));
  --md-hover-color: rgb(var(--v-theme-primary));
  --md-bk-color: rgb(var(--v-theme-surface));
  --md-bk-color-outstand: rgb(var(--v-theme-surface-variant));
  --md-bk-hover-color: rgba(var(--v-theme-primary), 0.1);
  --md-border-color: rgba(var(--v-border-color), var(--v-border-opacity));
  --md-border-hover-color: rgba(var(--v-theme-primary), 0.5);
  --md-border-active-color: rgb(var(--v-theme-primary));
  --md-modal-mask: rgba(0, 0, 0, 0.5);
  --md-scrollbar-bg-color: rgba(var(--v-theme-on-surface), 0.1);
  --md-scrollbar-thumb-color: rgba(var(--v-theme-on-surface), 0.3);
  --md-scrollbar-thumb-hover-color: rgba(var(--v-theme-on-surface), 0.5);
  --md-scrollbar-thumb-active-color: rgba(var(--v-theme-on-surface), 0.7);
}

:deep(.md-editor-dark) {
  --md-color: rgb(var(--v-theme-on-surface));
  --md-hover-color: rgb(var(--v-theme-primary));
  --md-bk-color: rgb(var(--v-theme-surface));
  --md-bk-color-outstand: rgb(var(--v-theme-surface-variant));
  --md-bk-hover-color: rgba(var(--v-theme-primary), 0.1);
  --md-border-color: rgba(var(--v-border-color), var(--v-border-opacity));
  --md-border-hover-color: rgba(var(--v-theme-primary), 0.5);
  --md-border-active-color: rgb(var(--v-theme-primary));
}
</style>
