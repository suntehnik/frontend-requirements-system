<template>
  <v-card v-if="description" flat outlined class="mb-4">
    <v-card-title class="text-h6 pb-2">Описание</v-card-title>
    <v-card-text>
      <div 
        class="markdown-content"
        v-html="renderedMarkdown"
      />
    </v-card-text>
    <v-card-actions class="px-4 pb-4">
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-pencil" @click="$emit('edit')">
        Редактировать эпик
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

interface Props {
  description?: string
}

const props = defineProps<Props>()

defineEmits<{
  edit: []
}>()

// Configure marked for safe HTML rendering
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Render markdown to HTML
const renderedMarkdown = computed(() => {
  if (!props.description) return ''
  
  try {
    return marked(props.description)
  } catch (error) {
    console.error('Failed to render markdown:', error)
    // Fallback to plain text with line breaks
    return props.description.replace(/\n/g, '<br>')
  }
})
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
}

.markdown-content :deep(h1) {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 1rem 0 0.5rem 0;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}

.markdown-content :deep(h2) {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 1rem 0 0.5rem 0;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}

.markdown-content :deep(h3) {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0.75rem 0 0.5rem 0;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}

.markdown-content :deep(p) {
  margin: 0.5rem 0;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin: 0.25rem 0;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid rgba(var(--v-theme-primary), 0.3);
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  font-style: italic;
}

.markdown-content :deep(code) {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.875rem;
}

.markdown-content :deep(pre) {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

.markdown-content :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  padding: 0.5rem;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  font-weight: 500;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.2);
  margin: 1.5rem 0;
}
</style>