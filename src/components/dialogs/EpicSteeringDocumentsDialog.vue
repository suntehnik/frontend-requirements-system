<template>
  <v-dialog v-model="internalValue" max-width="900" persistent>
    <v-card>
      <v-card-title>
        <span class="text-h5">Управление steering-документами</span>
        <v-spacer />
        <v-chip v-if="epic" color="primary" variant="tonal">
          {{ epic.reference_id }}
        </v-chip>
      </v-card-title>

      <v-card-text>
        <v-container>
          <!-- Action buttons -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-plus"
                @click="showCreateDialog"
                :disabled="loading"
                class="mr-2"
              >
                Создать документ
              </v-btn>
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-link"
                @click="showLinkDialog"
                :disabled="loading"
              >
                Привязать документ
              </v-btn>
            </v-col>
          </v-row>

          <!-- Loading state -->
          <v-row v-if="loading">
            <v-col cols="12" class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-2">Загрузка документов...</p>
            </v-col>
          </v-row>

          <!-- Error state -->
          <v-row v-else-if="errorMessage">
            <v-col cols="12">
              <v-alert type="error" variant="tonal" closable @click:close="errorMessage = ''">
                {{ errorMessage }}
              </v-alert>
            </v-col>
          </v-row>

          <!-- Documents list -->
          <v-row v-else-if="epicDocuments && epicDocuments.length > 0">
            <v-col cols="12">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1">
                  Привязанные документы ({{ epicDocuments?.length || 0 }})
                </v-card-title>
                <v-list>
                  <v-list-item
                    v-for="document in epicDocuments || []"
                    :key="document.id"
                    :title="document.title"
                    :subtitle="`${document.reference_id} • Создан: ${formatDate(document.created_at)}`"
                  >
                    <template #prepend>
                      <v-icon color="primary">mdi-file-document-outline</v-icon>
                    </template>
                    <template #append>
                      <v-btn
                        icon="mdi-pencil"
                        size="small"
                        color="primary"
                        variant="text"
                        @click="editDocument(document)"
                        :disabled="loading"
                        class="mr-1"
                      />
                      <v-btn
                        icon="mdi-link-off"
                        size="small"
                        color="error"
                        variant="text"
                        @click="confirmUnlinkDocument(document)"
                        :disabled="loading"
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>

          <!-- Empty state -->
          <v-row v-else>
            <v-col cols="12" class="text-center">
              <v-icon size="64" color="grey-lighten-1">mdi-file-document-outline</v-icon>
              <p class="text-grey-darken-1 mt-2">Нет привязанных документов</p>
              <p class="text-grey-darken-2">Создайте новый документ или привяжите существующий</p>
            </v-col>
          </v-row>

          <!-- Success message -->
          <v-row v-if="successMessage">
            <v-col cols="12">
              <v-alert type="success" variant="tonal" closable @click:close="successMessage = ''">
                {{ successMessage }}
              </v-alert>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="grey-darken-1" variant="text" @click="handleClose" :disabled="loading">
          Закрыть
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Create/Edit Document Dialog -->
    <SteeringDocumentFormDialog
      v-model="showFormDialog"
      :mode="formMode"
      :document="selectedDocument"
      :epic-id="epic?.id"
      :loading="formLoading"
      @submit="handleDocumentSubmit"
      @cancel="handleFormCancel"
    />

    <!-- Link Document Selector Dialog -->
    <v-dialog v-model="showSelectorDialog" max-width="600">
      <v-card>
        <v-card-title>Выберите документ для привязки</v-card-title>
        <v-card-text>
          <SteeringDocumentSelector
            ref="selectorRef"
            v-model="selectedDocumentId"
            :exclude-document-ids="linkedDocumentIds"
            label="Документ"
            placeholder="Выберите документ для привязки к эпику"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showSelectorDialog = false"
            :disabled="loading"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="handleDocumentLinkConfirm"
            :disabled="!selectedDocumentId || loading"
            :loading="loading"
          >
            Привязать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Unlink Dialog -->
    <v-dialog v-model="showUnlinkDialog" max-width="400">
      <v-card>
        <v-card-title>Подтверждение</v-card-title>
        <v-card-text>
          Вы уверены, что хотите отвязать документ "{{ documentToUnlink?.title }}" от эпика?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showUnlinkDialog = false"
            :disabled="unlinkLoading"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="handleDocumentUnlink"
            :loading="unlinkLoading"
          >
            Отвязать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { steeringDocumentService } from '@/services'
import SteeringDocumentFormDialog from './SteeringDocumentFormDialog.vue'
import SteeringDocumentSelector from '@/components/forms/SteeringDocumentSelector.vue'
import type {
  Epic,
  SteeringDocument,
  CreateSteeringDocumentRequest,
  UpdateSteeringDocumentRequest,
} from '@/types'

interface Props {
  modelValue: boolean
  epic?: Epic
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'documentsUpdated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)
const formLoading = ref(false)
const unlinkLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const epicDocuments = ref<SteeringDocument[]>([])

// Dialog states
const showFormDialog = ref(false)
const showSelectorDialog = ref(false)
const showUnlinkDialog = ref(false)

// Form state
const formMode = ref<'create' | 'edit'>('create')
const selectedDocument = ref<SteeringDocument>()
const documentToUnlink = ref<SteeringDocument>()
const selectedDocumentId = ref<string | null>(null)

// Component refs
const selectorRef = ref()

// Computed
const internalValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const linkedDocumentIds = computed(() => epicDocuments.value?.map((doc) => doc.id) || [])

// Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const loadEpicDocuments = async () => {
  if (!props.epic?.id) return

  try {
    loading.value = true
    errorMessage.value = ''

    epicDocuments.value = await steeringDocumentService.getEpicDocuments(props.epic.id)
  } catch (error: unknown) {
    console.error('Error loading epic documents:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Ошибка загрузки документов'
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  formMode.value = 'create'
  selectedDocument.value = undefined
  showFormDialog.value = true
}

const editDocument = (document: SteeringDocument) => {
  formMode.value = 'edit'
  selectedDocument.value = document
  showFormDialog.value = true
}

const showLinkDialog = async () => {
  // Refresh the selector data before showing the dialog
  if (selectorRef.value?.loadDocuments) {
    await selectorRef.value.loadDocuments()
  }
  showSelectorDialog.value = true
}

const confirmUnlinkDocument = (document: SteeringDocument) => {
  documentToUnlink.value = document
  showUnlinkDialog.value = true
}

const handleDocumentSubmit = async (
  data: CreateSteeringDocumentRequest | UpdateSteeringDocumentRequest,
) => {
  if (!props.epic?.id) return

  try {
    formLoading.value = true
    errorMessage.value = ''

    if (formMode.value === 'create') {
      const createData = data as CreateSteeringDocumentRequest
      await steeringDocumentService.create(createData)
      successMessage.value = 'Документ успешно создан и привязан к эпику'
    } else if (selectedDocument.value) {
      const updateData = data as UpdateSteeringDocumentRequest
      await steeringDocumentService.update(selectedDocument.value.id, updateData)
      successMessage.value = 'Документ успешно обновлен'
    }

    showFormDialog.value = false
    await loadEpicDocuments()

    // Refresh the selector to update available documents
    if (selectorRef.value?.loadDocuments) {
      await selectorRef.value.loadDocuments()
    }

    emit('documentsUpdated')
  } catch (error: unknown) {
    console.error('Error saving document:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Ошибка сохранения документа'
  } finally {
    formLoading.value = false
  }
}

const handleFormCancel = () => {
  showFormDialog.value = false
  selectedDocument.value = undefined
}

const handleDocumentLinkConfirm = async () => {
  if (!props.epic?.id || !selectedDocumentId.value) return

  try {
    loading.value = true
    errorMessage.value = ''

    await steeringDocumentService.linkToEpic(props.epic.id, selectedDocumentId.value)

    // Get the document title from the selector before clearing
    const linkedDocument = selectorRef.value?.selectedDocument
    successMessage.value = `Документ "${linkedDocument?.title || 'выбранный документ'}" успешно привязан к эпику`

    showSelectorDialog.value = false
    selectedDocumentId.value = null
    await loadEpicDocuments()

    // Refresh the selector to update available documents
    if (selectorRef.value?.loadDocuments) {
      await selectorRef.value.loadDocuments()
    }

    emit('documentsUpdated')
  } catch (error: unknown) {
    console.error('Error linking document:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Ошибка привязки документа'
  } finally {
    loading.value = false
  }
}

const handleDocumentUnlink = async () => {
  if (!props.epic?.id || !documentToUnlink.value) return

  try {
    unlinkLoading.value = true
    errorMessage.value = ''

    await steeringDocumentService.unlinkFromEpic(props.epic.id, documentToUnlink.value.id)
    successMessage.value = `Документ "${documentToUnlink.value.title}" отвязан от эпика`

    showUnlinkDialog.value = false
    documentToUnlink.value = undefined
    await loadEpicDocuments()

    // Refresh the selector to update available documents
    if (selectorRef.value?.loadDocuments) {
      await selectorRef.value.loadDocuments()
    }

    emit('documentsUpdated')
  } catch (error: unknown) {
    console.error('Error unlinking document:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Ошибка отвязки документа'
  } finally {
    unlinkLoading.value = false
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const resetState = () => {
  errorMessage.value = ''
  successMessage.value = ''
  epicDocuments.value = []
  selectedDocument.value = undefined
  documentToUnlink.value = undefined
  selectedDocumentId.value = null
}

// Watch for dialog open/close
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      resetState()
      loadEpicDocuments()
    }
  },
)

// Watch for epic changes
watch(
  () => props.epic?.id,
  () => {
    if (props.modelValue) {
      resetState()
      loadEpicDocuments()
    }
  },
)

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    loadEpicDocuments()
  }
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
