<template>
  <v-dialog v-model="internalValue" max-width="800" persistent>
    <v-card>
      <v-form ref="formRef" v-model="isValid" @submit.prevent="handleSubmit">
        <v-card-title>
          <span class="text-h5">
            {{
              mode === 'create' ? 'Создать steering-документ' : 'Редактировать steering-документ'
            }}
          </span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <!-- Title field -->
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.title"
                  label="Название документа"
                  variant="outlined"
                  :rules="titleRules"
                  :counter="500"
                  required
                  autofocus
                  :disabled="loading"
                />
              </v-col>
            </v-row>

            <!-- Description field with Markdown support -->
            <v-row>
              <v-col cols="12">
                <MarkdownEditor
                  v-model="form.description"
                  label="Описание (Markdown)"
                  :rules="descriptionRules"
                  :counter="true"
                  :max-length="50000"
                  :disabled="loading"
                  placeholder="Подробное описание steering-документа с поддержкой Markdown..."
                />
              </v-col>
            </v-row>

            <!-- Epic selection (if epicId is provided for auto-linking) -->
            <v-row v-if="epicId">
              <v-col cols="12">
                <v-alert type="info" variant="tonal" class="mb-0">
                  <v-icon start>mdi-link</v-icon>
                  Документ будет автоматически привязан к текущему эпику
                </v-alert>
              </v-col>
            </v-row>

            <!-- Error display -->
            <v-row v-if="errorMessage">
              <v-col cols="12">
                <v-alert type="error" variant="tonal">
                  {{ errorMessage }}
                </v-alert>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="grey-darken-1" variant="text" @click="handleCancel" :disabled="loading">
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            type="submit"
            :loading="loading"
            :disabled="!isValid"
          >
            {{ mode === 'create' ? 'Создать' : 'Сохранить' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { MarkdownEditor } from '@/components/forms'
import type {
  SteeringDocument,
  CreateSteeringDocumentRequest,
  UpdateSteeringDocumentRequest,
} from '@/types'

interface Props {
  modelValue: boolean
  document?: SteeringDocument
  epicId?: string
  mode: 'create' | 'edit'
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: CreateSteeringDocumentRequest | UpdateSteeringDocumentRequest): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

// Form state
const formRef = ref()
const isValid = ref(false)
const errorMessage = ref('')

const form = ref<{
  title: string
  description: string
}>({
  title: '',
  description: '',
})

// Computed
const internalValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

// Validation rules
const titleRules = [
  (v: string) => !!v || 'Название обязательно',
  (v: string) => (v && v.length <= 500) || 'Название не должно превышать 500 символов',
  (v: string) => (v && v.trim().length > 0) || 'Название не может быть пустым',
]

const descriptionRules = [
  (v: string) => !v || v.length <= 50000 || 'Описание не должно превышать 50000 символов',
]

// Methods
const initializeForm = () => {
  errorMessage.value = ''

  if (props.mode === 'edit' && props.document) {
    form.value = {
      title: props.document.title,
      description: props.document.description || '',
    }
  } else {
    form.value = {
      title: '',
      description: '',
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    errorMessage.value = ''

    const baseData = {
      title: form.value.title.trim(),
      description: form.value.description.trim() || undefined,
    }

    if (props.mode === 'create') {
      const createData: CreateSteeringDocumentRequest = {
        ...baseData,
        epic_id: props.epicId, // Include epic_id if provided for auto-linking
      }
      emit('submit', createData)
    } else {
      const updateData: UpdateSteeringDocumentRequest = baseData
      emit('submit', updateData)
    }
  } catch (error: unknown) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Произошла ошибка при сохранении документа'
  }
}

const handleCancel = () => {
  emit('cancel')
}

const resetForm = () => {
  formRef.value?.reset()
  initializeForm()
}

// Watch for dialog open/close
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      initializeForm()
    }
  },
)

// Watch for document changes (when switching between edit modes)
watch(
  () => props.document,
  () => {
    if (props.modelValue) {
      initializeForm()
    }
  },
)

// Lifecycle
onMounted(() => {
  initializeForm()
})

// Expose methods for parent component
defineExpose({
  resetForm,
  handleSubmit,
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
