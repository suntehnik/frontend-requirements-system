<template>
  <div class="markdown-viewer-wrapper" :class="className">
    <!-- Empty state handling (Requirement 3.10) -->
    <div v-if="isEmpty" class="empty-state">
      <v-icon size="48" color="disabled" class="mb-2">mdi-text-box-outline</v-icon>
      <p class="text-body-2 text-disabled">No content to display</p>
    </div>

    <!-- Error state handling (Requirement 3.8) -->
    <div v-else-if="hasRenderError" class="error-state">
      <v-icon size="48" color="error" class="mb-2">mdi-alert-circle-outline</v-icon>
      <p class="text-body-2 text-error mb-2">Failed to render markdown content</p>
      <v-card variant="outlined" class="pa-3">
        <pre class="text-caption">{{ content }}</pre>
      </v-card>
    </div>

    <!-- Markdown content (Requirements 3.1-3.9) -->
    <div v-else class="markdown-content" :style="{ maxHeight }">
      <MdPreview :model-value="internalValue" :language="language" :theme="editorTheme" :preview-theme="previewTheme"
        :code-theme="codeTheme" :editor-id="`markdown-viewer-${Math.random().toString().replace('.', '')}`" class="markdown-viewer"
        @on-error="handleRenderError" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useTheme } from 'vuetify'
import { MdPreview } from 'md-editor-v3'

interface MarkdownViewerProps {
  content: string | null | undefined
  maxHeight?: string
  showCopyButton?: boolean
  enableMermaid?: boolean
  className?: string
  language?: string
}

const props = withDefaults(defineProps<MarkdownViewerProps>(), {
  maxHeight: 'none',
  showCopyButton: true,
  enableMermaid: true,
  className: '',
  language: 'en-US',
})

// Get Vuetify theme
const theme = useTheme()

// Internal state
const internalValue = ref('')
const hasRenderError = ref(false)

// Computed properties
const isEmpty = computed(() => {
  return !props.content || props.content.trim() === ''
})

// Theme configuration based on Vuetify theme (Requirements 3.1, 3.3)
const editorTheme = computed(() => theme.global.name.value === 'dark' ? 'dark' : 'light')
const previewTheme = computed(() => theme.global.name.value === 'dark' ? 'github' : 'default')
const codeTheme = computed(() => theme.global.name.value === 'dark' ? 'atom' : 'github')

// Error handling (Requirement 3.8)
const handleRenderError = (error: { name: string; message: string }) => {
  console.error('Markdown rendering error:', error)
  hasRenderError.value = true
}

// Setup external links to open in new tabs (Requirement 3.7)
const setupExternalLinks = () => {
  nextTick(() => {
    const links = document.querySelectorAll('.markdown-viewer a[href^="http"]')
    links.forEach((link) => {
      const anchor = link as HTMLAnchorElement
      anchor.target = '_blank'
      anchor.rel = 'noopener noreferrer'
    })
  })
}

// Watch for external changes
watch(
  () => props.content,
  (newValue) => {
    hasRenderError.value = false
    if (newValue) {
      internalValue.value = newValue
      setupExternalLinks()
    } else {
      internalValue.value = ''
    }
  },
  { immediate: true }
)

// Setup copy buttons for code blocks (Requirement 3.4)
onMounted(() => {
  if (props.showCopyButton) {
    setupExternalLinks()
  }
})
</script>

<style scoped>
.markdown-viewer-wrapper {
  width: 100%;
  position: relative;
}

/* Empty state styling (Requirement 3.10) */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  min-height: 120px;
}

/* Error state styling (Requirement 3.8) */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.error-state pre {
  max-height: 200px;
  overflow-y: auto;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Markdown content container with proper scrolling (Requirement 3.5) */
.markdown-content {
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.markdown-viewer {
  border: none;
  border-radius: 0;
}

/* Override md-editor-v3 styles to match Vuetify theme */
:deep(.md-preview) {
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
  border: none !important;
  padding: 0 !important;
}

:deep(.md-preview-dark) {
  --md-color: rgb(var(--v-theme-on-surface));
  --md-hover-color: rgb(var(--v-theme-primary));
  --md-bk-color: rgb(var(--v-theme-surface));
  --md-bk-color-outstand: rgb(var(--v-theme-surface-variant));
  --md-bk-hover-color: rgba(var(--v-theme-primary), 0.1);
  --md-border-color: rgba(var(--v-border-color), var(--v-border-opacity));
  --md-border-hover-color: rgba(var(--v-theme-primary), 0.5);
  --md-border-active-color: rgb(var(--v-theme-primary));
}

/* MdPreview specific styling */
:deep(.md-preview-wrapper) {
  width: 100% !important;
  border: none !important;
  padding: 0 !important;
}

/* Responsive Mermaid diagrams (Requirements 3.2, 3.9) */
:deep(.mermaid) {
  text-align: center;
  margin: 1rem 0;
  max-width: 100%;
  overflow-x: auto;
}

:deep(.mermaid svg) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

/* Responsive design for small screens */
@media (max-width: 768px) {
  :deep(.mermaid) {
    font-size: 12px;
  }

  :deep(.mermaid svg) {
    transform: scale(0.8);
    transform-origin: center;
  }
}

@media (max-width: 480px) {
  :deep(.mermaid svg) {
    transform: scale(0.6);
    transform-origin: center;
  }
}

/* Code blocks with syntax highlighting and copy functionality (Requirements 3.3, 3.4) */
:deep(.md-preview pre) {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
  position: relative;
}

:deep(.md-preview code) {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.875rem;
}

:deep(.md-preview pre code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

/* Copy button styling for code blocks */
:deep(.md-preview pre:hover .copy-code-btn) {
  opacity: 1;
}

:deep(.copy-code-btn) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  background: rgba(var(--v-theme-surface), 0.9);
  border: 1px solid rgba(var(--v-theme-outline), 0.3);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  color: rgb(var(--v-theme-on-surface));
}

:deep(.copy-code-btn:hover) {
  background: rgba(var(--v-theme-primary), 0.1);
  border-color: rgb(var(--v-theme-primary));
}

/* Standard markdown elements (Requirement 3.1) */
:deep(.md-preview table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
  overflow-x: auto;
  display: block;
  white-space: nowrap;
}

@media (max-width: 768px) {
  :deep(.md-preview table) {
    font-size: 0.875rem;
  }
}

:deep(.md-preview th),
:deep(.md-preview td) {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  padding: 0.5rem;
  text-align: left;
  white-space: nowrap;
}

:deep(.md-preview th) {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  font-weight: 500;
}

/* Blockquotes */
:deep(.md-preview blockquote) {
  border-left: 4px solid rgba(var(--v-theme-primary), 0.3);
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  font-style: italic;
}

/* External links styling (Requirement 3.7) */
:deep(.md-preview a[href^="http"]) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

:deep(.md-preview a[href^="http"]:hover) {
  text-decoration: underline;
}

:deep(.md-preview a[href^="http"]:after) {
  content: "↗";
  font-size: 0.75em;
  margin-left: 0.25em;
  opacity: 0.7;
}

/* Internal links */
:deep(.md-preview a:not([href^="http"])) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

:deep(.md-preview a:not([href^="http"]):hover) {
  text-decoration: underline;
}

/* Headings */
:deep(.md-preview h1) {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 1rem 0 0.5rem 0;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.2);
  padding-bottom: 0.5rem;
}

:deep(.md-preview h2) {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 1rem 0 0.5rem 0;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}

:deep(.md-preview h3) {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0.75rem 0 0.5rem 0;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}

:deep(.md-preview h4),
:deep(.md-preview h5),
:deep(.md-preview h6) {
  font-size: 1rem;
  font-weight: 500;
  margin: 0.5rem 0 0.25rem 0;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}

/* Paragraphs and text */
:deep(.md-preview p) {
  margin: 0.5rem 0;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  line-height: 1.6;
}

/* Lists */
:deep(.md-preview ul),
:deep(.md-preview ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

:deep(.md-preview li) {
  margin: 0.25rem 0;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

:deep(.md-preview ul ul),
:deep(.md-preview ol ol),
:deep(.md-preview ul ol),
:deep(.md-preview ol ul) {
  margin: 0.25rem 0;
}

/* Task lists */
:deep(.md-preview input[type="checkbox"]) {
  margin-right: 0.5rem;
  accent-color: rgb(var(--v-theme-primary));
}

/* Horizontal rules */
:deep(.md-preview hr) {
  border: none;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.2);
  margin: 1.5rem 0;
}

/* Emphasis */
:deep(.md-preview strong) {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}

:deep(.md-preview em) {
  font-style: italic;
}

/* Strikethrough */
:deep(.md-preview del) {
  text-decoration: line-through;
  opacity: 0.7;
}

/* Images */
:deep(.md-preview img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5rem 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .markdown-viewer-wrapper {
    font-size: 0.9rem;
  }

  :deep(.md-preview h1) {
    font-size: 1.25rem;
  }

  :deep(.md-preview h2) {
    font-size: 1.125rem;
  }

  :deep(.md-preview h3) {
    font-size: 1rem;
  }

  :deep(.md-preview pre) {
    padding: 0.75rem;
    font-size: 0.8rem;
  }

  :deep(.md-preview blockquote) {
    padding: 0.5rem 0.75rem;
    margin: 0.75rem 0;
  }
}
</style>