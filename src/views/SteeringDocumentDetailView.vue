<template>
  <div class="steering-document-detail">
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 200px">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <!-- Error state (404) -->
    <div
      v-else-if="error"
      class="d-flex flex-column align-center justify-center"
      style="min-height: 400px"
    >
      <v-icon size="120" color="error" class="mb-4">mdi-file-document-remove-outline</v-icon>
      <h2 class="text-h4 mb-2">Документ не найден</h2>
      <p class="text-body-1 text-medium-emphasis mb-4">
        Запрашиваемый steering-документ не существует или был удален.
      </p>
      <v-btn color="primary" variant="elevated" @click="$router.push('/admin/config')">
        Вернуться к списку документов
      </v-btn>
    </div>

    <!-- Document content -->
    <div v-else-if="document" class="document-content">
      <!-- Header with title and actions -->
      <div class="d-flex justify-space-between align-start mb-6">
        <div class="flex-grow-1">
          <div class="d-flex align-center mb-2">
            <v-chip color="primary" variant="outlined" size="small" class="me-3">
              {{ document.reference_id }}
            </v-chip>
            <v-chip color="success" variant="tonal" size="small"> Steering Document </v-chip>
          </div>
          <h1 class="text-h4 mb-2">{{ document.title }}</h1>
          <div class="text-body-2 text-medium-emphasis">
            <span>Создан: {{ formatDate(document.created_at) }}</span>
            <span v-if="document.updated_at !== document.created_at" class="ms-4">
              Обновлен: {{ formatDate(document.updated_at) }}
            </span>
            <span v-if="document.creator" class="ms-4">
              Автор: {{ document.creator.username }}
            </span>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="d-flex gap-2">
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-pencil"
            @click="openEditDialog"
            :disabled="actionLoading"
          >
            Редактировать
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            prepend-icon="mdi-delete"
            @click="openDeleteDialog"
            :disabled="actionLoading"
          >
            Удалить
          </v-btn>
        </div>
      </div>

      <!-- Document description -->
      <v-card v-if="document.description" class="mb-6">
        <v-card-title class="text-h6">Описание</v-card-title>
        <v-card-text>
          <MarkdownViewer :content="document.description" />
        </v-card-text>
      </v-card>

      <!-- Empty description state -->
      <v-card v-else class="mb-6">
        <v-card-text class="text-center py-8">
          <v-icon size="48" color="disabled" class="mb-2">mdi-text-box-outline</v-icon>
          <p class="text-body-2 text-disabled">Описание не добавлено</p>
        </v-card-text>
      </v-card>

      <!-- Related epics section -->
      <v-card v-if="document.epics && document.epics.length > 0">
        <v-card-title class="text-h6">Связанные эпики</v-card-title>
        <v-card-text>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="epic in document.epics"
              :key="epic.id"
              color="primary"
              variant="outlined"
              :to="`/epics/${epic.id}`"
              clickable
            >
              {{ epic.reference_id }}: {{ epic.title }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Edit Dialog -->
    <SteeringDocumentFormDialog
      v-model="editDialogOpen"
      :document="document || undefined"
      mode="edit"
      @submit="handleUpdate"
      @cancel="editDialogOpen = false"
    />

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialogOpen" max-width="500">
      <v-card>
        <v-card-title class="text-h6">Подтверждение удаления</v-card-title>
        <v-card-text>
          <p class="mb-2">
            Вы уверены, что хотите удалить steering-документ
            <strong>{{ document?.title }}</strong
            >?
          </p>
          <p class="text-body-2 text-error">
            Это действие нельзя отменить. Документ будет удален навсегда.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="deleteDialogOpen = false"
            :disabled="actionLoading"
          >
            Отмена
          </v-btn>
          <v-btn color="error" variant="elevated" @click="handleDelete" :loading="actionLoading">
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { steeringDocumentService } from '@/services'
import { MarkdownViewer } from '@/components/data-display'
import SteeringDocumentFormDialog from '@/components/dialogs/SteeringDocumentFormDialog.vue'
import type { SteeringDocument, UpdateSteeringDocumentRequest } from '@/types'

// Router
const route = useRoute()
const router = useRouter()

// State
const document = ref<SteeringDocument | null>(null)
const loading = ref(true)
const error = ref(false)
const actionLoading = ref(false)
const editDialogOpen = ref(false)
const deleteDialogOpen = ref(false)

// Computed
const referenceId = computed(() => route.params.referenceId as string)

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadDocument = async () => {
  try {
    loading.value = true
    error.value = false

    // Load document with creator and epics information
    document.value = await steeringDocumentService.get(referenceId.value, 'creator,epics')
  } catch (err: unknown) {
    console.error('Failed to load steering document:', err)

    // Check if it's a 404 error
    if (err && typeof err === 'object' && 'response' in err) {
      const errorWithResponse = err as { response?: { status?: number } }
      if (errorWithResponse.response?.status === 404) {
        error.value = true
      } else {
        // For other errors, show a generic error message
        // You might want to show a toast notification here
        error.value = true
      }
    } else {
      error.value = true
    }
  } finally {
    loading.value = false
  }
}

const openEditDialog = () => {
  editDialogOpen.value = true
}

const openDeleteDialog = () => {
  deleteDialogOpen.value = true
}

const handleUpdate = async (updateData: UpdateSteeringDocumentRequest) => {
  if (!document.value) return

  try {
    actionLoading.value = true

    const updatedDocument = await steeringDocumentService.update(document.value.id, updateData)

    // Update local document data
    document.value = { ...document.value, ...updatedDocument }

    editDialogOpen.value = false

    // Show success message (you might want to use a toast notification)
    console.log('Document updated successfully')
  } catch (err) {
    console.error('Failed to update document:', err)
    // Handle error (show error message)
  } finally {
    actionLoading.value = false
  }
}

const handleDelete = async () => {
  if (!document.value) return

  try {
    actionLoading.value = true

    await steeringDocumentService.delete(document.value.id)

    // Navigate back to config page
    router.push('/admin/config')

    // Show success message (you might want to use a toast notification)
    console.log('Document deleted successfully')
  } catch (err) {
    console.error('Failed to delete document:', err)
    // Handle error (show error message)
    deleteDialogOpen.value = false
  } finally {
    actionLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadDocument()
})
</script>

<style scoped>
.steering-document-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.document-content {
  width: 100%;
}

.gap-2 {
  gap: 8px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .steering-document-detail {
    padding: 16px;
  }

  .d-flex.justify-space-between {
    flex-direction: column;
    gap: 16px;
  }

  .d-flex.gap-2 {
    width: 100%;
  }

  .d-flex.gap-2 .v-btn {
    flex: 1;
  }
}
</style>
