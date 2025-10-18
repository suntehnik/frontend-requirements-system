<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 400px">
      <v-progress-circular indeterminate size="64" color="primary" />
    </div>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" class="mb-4">
      {{ error }}
      <template v-slot:append>
        <v-btn @click="loadEpic" variant="text" size="small">Повторить</v-btn>
      </template>
    </v-alert>

    <!-- Content -->
    <div v-else-if="epic">
      <!-- Two-Column Layout -->
      <v-row class="fill-height">
        <!-- Left Column: Epic Content -->
        <v-col cols="12" lg="8" md="7" class="pr-md-2">
          <!-- Epic Title -->
          <div class="mb-6">
            <h1 class="text-h4 mb-2">{{ epic.title }}</h1>
          </div>

          <!-- Epic Toolbar (Inline Editing) -->
          <EpicToolbar
            :epic="epic"
            @updated="handleEpicUpdate"
          />

          <!-- Epic Description (Markdown) -->
          <EpicDescription
            :description="epic.description"
            @edit="editEpic"
            @edit-description="editDescription"
          />

          <!-- User Stories Panel -->
          <UserStoriesPanel
            :user-stories="userStories"
            :loading="userStoriesLoading"
            @add-user-story="addUserStory"
          />

          <!-- Steering Documents Section -->
          <v-card flat outlined class="mt-6">
            <v-card-title class="text-h6 pb-2">
              <v-icon start>mdi-file-document-outline</v-icon>
              Связанные документы
            </v-card-title>
            <v-card-text>
              <div v-if="steeringDocumentsLoading" class="text-center py-4">
                <v-progress-circular indeterminate size="32" color="primary" />
              </div>
              <div v-else-if="steeringDocuments && steeringDocuments.length > 0">
                <v-list density="compact">
                  <v-list-item
                    v-for="document in steeringDocuments"
                    :key="document.id"
                    :title="document.title"
                    :subtitle="document.reference_id"
                    @click="navigateToSteeringDocument(document)"
                    class="cursor-pointer"
                  >
                    <template #prepend>
                      <v-icon color="primary">mdi-file-document-outline</v-icon>
                    </template>
                    <template #append>
                      <v-icon>mdi-chevron-right</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
              <div v-else class="text-center text-grey-darken-1 py-4">
                <v-icon size="32" color="grey-lighten-1" class="mb-2"
                  >mdi-file-document-outline</v-icon
                >
                <div class="text-body-2">Нет связанных документов</div>
              </div>
              <v-divider class="my-3" />
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                prepend-icon="mdi-cog"
                @click="showSteeringDocumentsManagement"
              >
                Управлять документами
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column: Comments -->
        <v-col cols="12" lg="4" md="5" class="pl-md-2">
          <!-- Comments Section -->
          <v-card flat outlined class="fill-height d-flex flex-column">
            <v-card-title class="text-h6 pb-2">Комментарии</v-card-title>

            <!-- Comments List -->
            <v-card-text class="flex-grow-1 overflow-y-auto" style="max-height: 60vh">
              <div v-if="commentsLoading" class="text-center py-4">
                <v-progress-circular indeterminate size="32" color="primary" />
              </div>
              <div v-else-if="comments && comments.length > 0">
                <div v-for="comment in comments" :key="comment.id" class="mb-4">
                  <div class="d-flex align-center mb-2">
                    <v-chip
                      color="grey-lighten-3"
                      size="small"
                      rounded="xl"
                      class="author-chip"
                      style="margin-right: 8px"
                    >
                      <v-icon start size="small">mdi-account</v-icon>
                      {{ comment.author?.username || 'Unknown User' }}
                    </v-chip>
                    <span class="text-caption text-grey-darken-1">
                      {{ formatCommentDate(comment.created_at) }}
                    </span>
                  </div>
                  <div class="text-body-2 ml-2">{{ comment.content }}</div>
                </div>
              </div>
              <div v-else class="text-center text-grey-darken-1 py-8">
                <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-comment-outline</v-icon>
                <div class="text-body-2">Комментариев пока нет</div>
              </div>
            </v-card-text>

            <!-- Comment Creation Form -->
            <v-divider />
            <v-card-text class="pt-3">
              <v-form ref="commentFormRef" @submit.prevent="submitComment">
                <v-textarea
                  v-model="newCommentContent"
                  placeholder="Добавить комментарий..."
                  rows="3"
                  variant="outlined"
                  density="compact"
                  :rules="commentRules"
                  counter="1000"
                  class="mb-3"
                />
                <div class="d-flex justify-space-between align-center">
                  <div class="text-caption text-grey-darken-1">
                    {{ newCommentContent.length }}/1000 символов
                  </div>
                  <v-btn
                    type="submit"
                    color="primary"
                    size="small"
                    :disabled="
                      !newCommentContent.trim() ||
                      commentSubmitting ||
                      newCommentContent.length > 1000
                    "
                    :loading="commentSubmitting"
                    prepend-icon="mdi-send"
                  >
                    Отправить
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Not Found State -->
    <div v-else class="text-center py-8">
      <v-icon size="64" color="grey">mdi-file-document-outline</v-icon>
      <h2 class="text-h5 mt-4 mb-2">Эпик не найден</h2>
      <p class="text-grey-darken-1">Эпик с ID {{ route.params.id }} не существует</p>
      <v-btn color="primary" @click="$router.push('/epics')">Вернуться к списку</v-btn>
    </div>

    <!-- Edit Epic Modal -->
    <v-dialog v-model="showEditDialog" max-width="800px" persistent scrollable>
      <EpicForm
        :epic="epic || undefined"
        :loading="formLoading"
        @submit="handleEpicSubmit"
        @cancel="handleEpicCancel"
      />
    </v-dialog>

    <!-- Fullscreen Markdown Editor for Description -->
    <FullscreenMarkdownEditor
      v-model:show="showDescriptionEditor"
      v-model="descriptionEditorValue"
      :saving="descriptionSaving"
      placeholder="Введите описание эпика в формате Markdown..."
      @save="handleDescriptionSave"
      @cancel="handleDescriptionCancel"
    />

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSuccessMessage" color="success" timeout="4000" location="top">
      {{ successMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showSuccessMessage = false"> Закрыть </v-btn>
      </template>
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showErrorMessage" color="error" timeout="6000" location="top">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showErrorMessage = false"> Закрыть </v-btn>
      </template>
    </v-snackbar>

    <!-- Steering Documents Management Dialog -->
    <EpicSteeringDocumentsDialog
      v-model="showSteeringDocumentsDialog"
      :epic="epic || undefined"
      @documents-updated="handleDocumentsUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { epicService } from '@/services/epic-service'
import { commentService } from '@/services/comment-service'
import { steeringDocumentService } from '@/services'

import { useEntitiesStore } from '@/stores/entities'
import { EpicForm, FullscreenMarkdownEditor } from '@/components/forms'
import { EpicToolbar, EpicDescription, UserStoriesPanel } from '@/components/data-display'
import EpicSteeringDocumentsDialog from '@/components/dialogs/EpicSteeringDocumentsDialog.vue'
import type { Epic, UserStory, Comment, UpdateEpicRequest, SteeringDocument } from '@/types'

const route = useRoute()
const router = useRouter()
const entitiesStore = useEntitiesStore()

// Reactive state
const epic = ref<Epic | null>(null)
const userStories = ref<UserStory[] | null>(null)
const comments = ref<Comment[] | null>(null)
const steeringDocuments = ref<SteeringDocument[] | null>(null)
const loading = ref(true)
const userStoriesLoading = ref(false)
const commentsLoading = ref(false)
const steeringDocumentsLoading = ref(false)
const commentSubmitting = ref(false)
const error = ref<string | null>(null)
const newCommentContent = ref('')

// Edit form state
const showEditDialog = ref(false)
const formLoading = ref(false)

// Description editor state
const showDescriptionEditor = ref(false)
const descriptionEditorValue = ref('')
const descriptionSaving = ref(false)

// Steering documents dialog state
const showSteeringDocumentsDialog = ref(false)

// Success/Error messages
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Form refs
const commentFormRef = ref()

// Validation rules
const commentRules = [
  (value: string) => {
    if (!value || !value.trim()) return 'Комментарий не может быть пустым'
    if (value.length > 1000) return 'Комментарий не может быть длиннее 1000 символов'
    return true
  },
]

// Computed properties
const epicId = computed(() => route.params.id as string)

// Methods
const loadEpic = async () => {
  try {
    loading.value = true
    error.value = null

    // Load epic with related data
    const epicData = await epicService.get(epicId.value, 'creator,assignee,user_stories,comments')
    epic.value = epicData

    // Extract user stories from epic data or load separately
    if (epicData.user_stories) {
      userStories.value = epicData.user_stories as UserStory[]
    } else {
      await loadUserStories()
    }

    // Always load comments separately to ensure we get the latest data
    await loadComments()

    // Load steering documents
    await loadSteeringDocuments()
  } catch (err) {
    console.error('Failed to load epic:', err)
    error.value = err instanceof Error ? err.message : 'Не удалось загрузить эпик'
  } finally {
    loading.value = false
  }
}

const loadUserStories = async () => {
  try {
    userStoriesLoading.value = true
    const epicWithStories = await epicService.getUserStories(epicId.value)
    userStories.value = (epicWithStories.user_stories as UserStory[]) || []
  } catch (err) {
    console.error('Failed to load user stories:', err)
    // Don't show error for user stories, just keep empty array
    userStories.value = []
  } finally {
    userStoriesLoading.value = false
  }
}

const loadComments = async () => {
  // Use the epic ID if available, otherwise use the route param
  const entityId = epic.value?.id || epicId.value

  try {
    commentsLoading.value = true
    console.log('Loading comments for entity ID:', entityId, 'Epic object:', epic.value)

    // Use epic.id (UUID) if available, otherwise try with reference_id
    const response = await commentService.getEntityComments('epic', entityId)
    console.log('Loaded comments response:', response)

    // Check if response has comments property or is array directly
    if (Array.isArray(response)) {
      comments.value = response
    } else if (response && typeof response === 'object' && 'comments' in response) {
      comments.value = (response as { comments?: Comment[] }).comments || []
    } else {
      comments.value = []
    }

    console.log('Final comments array:', comments.value)
  } catch (err) {
    console.error('Failed to load comments:', err)
    // Don't show error for comments, just keep empty array
    comments.value = []
  } finally {
    commentsLoading.value = false
  }
}

const loadSteeringDocuments = async () => {
  if (!epic.value?.id) return

  try {
    steeringDocumentsLoading.value = true
    steeringDocuments.value = await steeringDocumentService.getEpicDocuments(epic.value.id)
  } catch (err) {
    console.error('Failed to load steering documents:', err)
    // Don't show error for steering documents, just keep empty array
    steeringDocuments.value = []
  } finally {
    steeringDocumentsLoading.value = false
  }
}

const submitComment = async () => {
  // Validate form
  if (!commentFormRef.value) return
  const { valid } = await commentFormRef.value.validate()
  if (!valid) return

  if (!newCommentContent.value.trim() || !epic.value) return

  try {
    commentSubmitting.value = true

    // Use epic.id (UUID) instead of epicId (reference_id)
    await commentService.createEntityComment('epic', epic.value.id, {
      content: newCommentContent.value.trim(),
    })

    // Clear the form and reset validation
    newCommentContent.value = ''
    commentFormRef.value?.resetValidation()

    // Reload comments to show the new one
    await loadComments()

    // Show success message
    showSuccess('Комментарий успешно добавлен')
  } catch (err) {
    console.error('Failed to submit comment:', err)
    showError('Не удалось добавить комментарий')
  } finally {
    commentSubmitting.value = false
  }
}

const editEpic = () => {
  showEditDialog.value = true
}

const editDescription = () => {
  if (epic.value) {
    descriptionEditorValue.value = epic.value.description || ''
    showDescriptionEditor.value = true
  }
}

const handleEpicSubmit = async (data: UpdateEpicRequest) => {
  if (!epic.value) return

  formLoading.value = true

  try {
    // Update epic using the entities store
    await entitiesStore.updateEpic(epic.value.id, data)

    // Reload the epic to get updated data
    await loadEpic()

    showEditDialog.value = false
    showSuccess('Эпик успешно обновлен')
  } catch (error) {
    console.error('Failed to update epic:', error)
    showError('Не удалось обновить эпик')
  } finally {
    formLoading.value = false
  }
}

const handleEpicCancel = () => {
  showEditDialog.value = false
}

const handleDescriptionSave = async (newDescription: string) => {
  if (!epic.value) return

  try {
    descriptionSaving.value = true

    // Update only the description
    await entitiesStore.updateEpic(epic.value.id, {
      description: newDescription.trim() || undefined,
    })

    // Update local epic data
    epic.value.description = newDescription.trim() || undefined

    showDescriptionEditor.value = false
    showSuccess('Описание успешно обновлено')
  } catch (error) {
    console.error('Failed to update description:', error)
    showError('Не удалось обновить описание')
  } finally {
    descriptionSaving.value = false
  }
}

const handleDescriptionCancel = () => {
  showDescriptionEditor.value = false
}

// Utility functions for messages
const showSuccess = (message: string) => {
  successMessage.value = message
  showSuccessMessage.value = true
}

const showError = (message: string) => {
  errorMessage.value = message
  showErrorMessage.value = true
}

const addUserStory = () => {
  router.push(`/epics/${epicId.value}/user-stories/new`)
}

const handleEpicUpdate = (updatedEpic: Epic) => {
  epic.value = updatedEpic
  showSuccess('Эпик успешно обновлен')
}

const handleDocumentsUpdate = () => {
  // Refresh steering documents when they are updated
  loadSteeringDocuments()
}

const showSteeringDocumentsManagement = () => {
  showSteeringDocumentsDialog.value = true
}

const navigateToSteeringDocument = (document: SteeringDocument) => {
  router.push(`/steering-documents/${document.reference_id}`)
}

const formatCommentDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    return diffInMinutes < 1 ? 'только что' : `${diffInMinutes} мин назад`
  } else if (diffInHours < 24) {
    return `${diffInHours} ч назад`
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }
}

// Lifecycle
onMounted(() => {
  loadEpic()
})
</script>

<style scoped>
.author-chip {
  color: rgb(var(--v-theme-on-surface)) !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
