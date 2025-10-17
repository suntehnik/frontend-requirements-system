<template>
  <v-autocomplete
    :model-value="modelValue"
    :items="filteredDocuments"
    :label="label"
    :placeholder="placeholder"
    :rules="rules"
    :error-messages="errorMessages"
    :disabled="disabled"
    :loading="loading"
    :clearable="clearable"
    :variant="variant"
    :density="density"
    :class="$props.class"
    :search="searchQuery"
    item-title="title"
    item-value="id"
    no-filter
    @update:model-value="handleUpdate"
    @update:search="handleSearch"
  >
    <template #selection="{ item }">
      <div class="d-flex align-center">
        <v-icon icon="mdi-file-document-outline" class="mr-2" />
        <span>{{ item.raw.title }}</span>
        <v-chip :text="item.raw.reference_id" size="x-small" variant="outlined" class="ml-2" />
      </div>
    </template>

    <template #item="{ item, props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-icon icon="mdi-file-document-outline" />
        </template>
        <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
        <v-list-item-subtitle>{{ item.raw.reference_id }}</v-list-item-subtitle>
        <template #append>
          <v-chip :text="item.raw.reference_id" size="x-small" variant="outlined" />
        </template>
      </v-list-item>
    </template>

    <template #no-data>
      <v-list-item>
        <v-list-item-title>
          {{ searchQuery ? 'Документы не найдены' : 'Начните вводить для поиска' }}
        </v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { steeringDocumentService } from '@/services'
import type { SteeringDocument } from '@/types'

interface Props {
  modelValue?: string | null
  label?: string
  placeholder?: string
  rules?: Array<(value: string | null) => boolean | string>
  errorMessages?: string | string[]
  disabled?: boolean
  clearable?: boolean
  variant?:
    | 'filled'
    | 'outlined'
    | 'plain'
    | 'underlined'
    | 'solo'
    | 'solo-inverted'
    | 'solo-filled'
  density?: 'default' | 'comfortable' | 'compact'
  class?: string
  excludeDocumentIds?: string[]
}

interface Emits {
  (e: 'update:modelValue', value: string | null): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: 'Steering Document',
  placeholder: 'Выберите документ',
  disabled: false,
  clearable: true,
  variant: 'outlined',
  density: 'default',
  excludeDocumentIds: () => [],
})

const emit = defineEmits<Emits>()

// Local state
const searchQuery = ref('')
const loading = ref(false)
const documents = ref<SteeringDocument[]>([])
const error = ref<string | null>(null)

// Computed
const filteredDocuments = computed<SteeringDocument[]>(() => {
  let filteredDocs = documents.value

  // Exclude already linked documents
  if (props.excludeDocumentIds.length > 0) {
    filteredDocs = filteredDocs.filter((doc) => !props.excludeDocumentIds.includes(doc.id))
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filteredDocs = filteredDocs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.reference_id.toLowerCase().includes(query) ||
        (doc.description && doc.description.toLowerCase().includes(query)),
    )
  }

  return filteredDocs
})

const selectedDocument = computed(() => {
  if (!props.modelValue) return null
  return documents.value.find((doc) => doc.id === props.modelValue) || null
})

// Methods
const handleUpdate = (value: string | null): void => {
  emit('update:modelValue', value)
}

const handleSearch = (value: string): void => {
  searchQuery.value = value
}

const loadDocuments = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = null
    const response = await steeringDocumentService.list()
    documents.value = response.steering_documents
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка загрузки документов'
    console.error('Error loading steering documents:', err)
  } finally {
    loading.value = false
  }
}

// Load documents on mount
onMounted(async () => {
  await loadDocuments()
})

// Watch for errors and handle them
watch(
  () => error.value,
  (newError) => {
    if (newError) {
      console.error('SteeringDocumentSelector error:', newError)
    }
  },
)

// Expose helper functions and state for external use
defineExpose({
  selectedDocument,
  filteredDocuments,
  documents,
  loading,
  error,
  loadDocuments,
  handleUpdate,
  handleSearch,
})
</script>
