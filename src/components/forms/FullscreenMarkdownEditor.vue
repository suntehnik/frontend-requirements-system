<template>
  <v-dialog
    v-model="internalShow"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
    persistent
  >
    <v-card class="d-flex flex-column">
      <!-- Header -->
      <v-toolbar color="primary" dark>
        <v-btn icon @click="handleCancel">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Редактирование описания</v-toolbar-title>
        <v-spacer />
        <v-btn variant="text" @click="handleSave" :loading="saving" :disabled="!hasChanges">
          Сохранить
        </v-btn>
      </v-toolbar>

      <!-- Editor Content -->
      <v-card-text class="flex-grow-1 pa-0">
        <MarkdownEditor
          v-model="internalValue"
          :placeholder="placeholder"
          :disabled="saving"
          class="fullscreen-editor"
          :toolbars="toolbars"
          :footers="footers"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { MarkdownEditor } from '@/components/forms'
import type { ToolbarNames, Footers } from 'md-editor-v3'

interface Props {
  show: boolean
  modelValue: string
  placeholder?: string
  saving?: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'update:modelValue', value: string): void
  (e: 'save', value: string): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Введите описание в формате Markdown...',
  saving: false,
})

const emit = defineEmits<Emits>()

// Internal state
const internalShow = ref(props.show)
const internalValue = ref(props.modelValue)
const originalValue = ref(props.modelValue)

// Computed
const hasChanges = computed(() => internalValue.value !== originalValue.value)

// Toolbar configuration for fullscreen editor
const toolbars: ToolbarNames[] = [
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  '-',
  'title',
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
  '=',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'previewOnly',
  'htmlPreview',
  'catalog',
]

const footers: Footers[] = ['markdownTotal', '=', 'scrollSwitch']

// Methods
const handleSave = () => {
  emit('save', internalValue.value)
}

const handleCancel = () => {
  if (hasChanges.value) {
    // Show confirmation dialog
    if (confirm('У вас есть несохраненные изменения. Вы уверены, что хотите закрыть редактор?')) {
      // Reset to original value
      internalValue.value = originalValue.value
      emit('cancel')
    }
  } else {
    emit('cancel')
  }
}

// Watch for external changes
watch(
  () => props.show,
  (newValue) => {
    internalShow.value = newValue
    if (newValue) {
      // Reset internal state when opening
      internalValue.value = props.modelValue
      originalValue.value = props.modelValue
    }
  },
)

watch(
  () => props.modelValue,
  (newValue) => {
    if (!internalShow.value) {
      // Only update if dialog is closed
      internalValue.value = newValue
      originalValue.value = newValue
    }
  },
)

// Watch for internal show changes
watch(internalShow, (newValue) => {
  emit('update:show', newValue)
})

// Watch for internal value changes
watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>

<style scoped>
.fullscreen-editor {
  height: 100%;
}

:deep(.fullscreen-editor .md-editor) {
  height: 100%;
  border: none;
  border-radius: 0;
}

:deep(.fullscreen-editor .md-editor .md-editor-content) {
  height: calc(100vh - 64px - 40px); /* Subtract toolbar and footer height */
}
</style>
