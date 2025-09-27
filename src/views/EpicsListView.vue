<template>
  <div>
    <!-- Page Header -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4">Эпики</h1>
            <p class="text-body-2 text-grey mt-1">
              Управление эпиками проекта
            </p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            size="large"
            @click="handleCreateEpic"
          >
            Создать эпик
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Epic List Component -->
    <EpicList
      :epics="epics"
      :loading="isLoading"
      @create="handleCreateEpic"
      @edit="handleEditEpic"
      @delete="handleDeleteEpic"
      @filter-change="handleFilterChange"
    />

    <!-- Create/Edit Epic Modal -->
    <v-dialog
      v-model="showEpicDialog"
      max-width="800px"
      persistent
      scrollable
    >
      <EpicForm
        :epic="selectedEpic"
        :loading="formLoading"
        @submit="handleEpicSubmit"
        @cancel="handleEpicCancel"
        @status-change="handleStatusChange"
      />
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          Подтверждение удаления
        </v-card-title>
        <v-card-text>
          <p>Вы уверены, что хотите удалить эпик?</p>
          <v-alert
            v-if="epicToDelete"
            type="warning"
            variant="tonal"
            class="mt-4"
          >
            <strong>{{ epicToDelete.reference_id }}: {{ epicToDelete.title }}</strong>
          </v-alert>
          <p class="mt-4 text-body-2 text-grey">
            Это действие нельзя отменить. Все связанные пользовательские истории и требования также будут удалены.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="handleDeleteCancel"
            :disabled="deleteLoading"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="handleDeleteConfirm"
            :loading="deleteLoading"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccessMessage"
      color="success"
      timeout="4000"
      location="top"
    >
      {{ successMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSuccessMessage = false"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showErrorMessage"
      color="error"
      timeout="6000"
      location="top"
    >
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showErrorMessage = false"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEntitiesStore } from '@/stores/entities'
import { epicService } from '@/services'
import { EpicList } from '@/components/data-display'
import { EpicForm } from '@/components/forms'
import type { Epic, EpicStatus, Priority, CreateEpicRequest, UpdateEpicRequest } from '@/types'

const entitiesStore = useEntitiesStore()

// State
const showEpicDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedEpic = ref<Epic | undefined>()
const epicToDelete = ref<Epic | undefined>()
const formLoading = ref(false)
const deleteLoading = ref(false)

// Success/Error messages
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Computed properties
const isLoading = computed(() => entitiesStore.loading.epics)
const epics = computed(() => entitiesStore.epicsList)

// Methods
const loadEpics = async () => {
  try {
    await entitiesStore.fetchEpics({
      include: 'creator,assignee',
      limit: 100,
      order_by: 'last_modified',
    })
  } catch (error) {
    console.error('Failed to load epics:', error)
    showError('Не удалось загрузить список эпиков')
  }
}

const handleCreateEpic = () => {
  selectedEpic.value = undefined
  showEpicDialog.value = true
}

const handleEditEpic = (epic: Epic) => {
  selectedEpic.value = epic
  showEpicDialog.value = true
}

const handleEpicSubmit = async (data: CreateEpicRequest | UpdateEpicRequest) => {
  formLoading.value = true
  
  try {
    if (selectedEpic.value) {
      // Update existing epic
      await entitiesStore.updateEpic(selectedEpic.value.id, data as UpdateEpicRequest)
      showSuccess('Эпик успешно обновлен')
    } else {
      // Create new epic
      await entitiesStore.createEpic(data as CreateEpicRequest)
      showSuccess('Эпик успешно создан')
    }
    
    showEpicDialog.value = false
    selectedEpic.value = undefined
  } catch (error) {
    console.error('Failed to save epic:', error)
    showError(selectedEpic.value ? 'Не удалось обновить эпик' : 'Не удалось создать эпик')
  } finally {
    formLoading.value = false
  }
}

const handleEpicCancel = () => {
  showEpicDialog.value = false
  selectedEpic.value = undefined
}

const handleStatusChange = async (epicId: string, status: EpicStatus) => {
  try {
    await epicService.changeStatus(epicId, status)
    await loadEpics() // Refresh the list
    showSuccess('Статус эпика изменен')
  } catch (error) {
    console.error('Failed to change epic status:', error)
    showError('Не удалось изменить статус эпика')
  }
}

const handleDeleteEpic = (epic: Epic) => {
  epicToDelete.value = epic
  showDeleteDialog.value = true
}

const handleDeleteConfirm = async () => {
  if (!epicToDelete.value) return

  deleteLoading.value = true
  
  try {
    await entitiesStore.deleteEpic(epicToDelete.value.id)
    showSuccess('Эпик успешно удален')
    showDeleteDialog.value = false
    epicToDelete.value = undefined
  } catch (error) {
    console.error('Failed to delete epic:', error)
    showError('Не удалось удалить эпик')
  } finally {
    deleteLoading.value = false
  }
}

const handleDeleteCancel = () => {
  showDeleteDialog.value = false
  epicToDelete.value = undefined
}

const handleFilterChange = (filters: { status?: EpicStatus; priority?: Priority }) => {
  // Filters are handled by the EpicList component
  // This could be used for additional filter logic if needed
  console.log('Filters changed:', filters)
}

// Utility functions
const showSuccess = (message: string) => {
  successMessage.value = message
  showSuccessMessage.value = true
}

const showError = (message: string) => {
  errorMessage.value = message
  showErrorMessage.value = true
}

// Lifecycle
onMounted(() => {
  loadEpics()
})
</script>
