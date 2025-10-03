<template>
  <div class="epics-list-view">
    <!-- Epic List Component with wireframe layout -->
    <EpicList :epics="epics" :loading="isLoading" :total-count="totalCount" :current-page="currentPage"
      :page-size="pageSize" @create="handleCreateEpic" @delete="handleDeleteEpic" @filter-change="handleFilterChange"
      @options-change="handleOptionsChange" @search-change="handleSearchChange" @clear-filters="handleClearFilters" />

    <!-- Create/Edit Epic Modal -->
    <v-dialog v-model="showEpicDialog" max-width="800px" persistent scrollable>
      <EpicForm :epic="selectedEpic" :loading="formLoading" @submit="handleEpicSubmit" @cancel="handleEpicCancel"
        @status-change="handleStatusChange" />
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          Подтверждение удаления
        </v-card-title>
        <v-card-text>
          <p>Вы уверены, что хотите удалить эпик?</p>
          <v-alert v-if="epicToDelete" type="warning" variant="tonal" class="mt-4">
            <strong>{{ epicToDelete.reference_id }}: {{ epicToDelete.title }}</strong>
          </v-alert>
          <p class="mt-4 text-body-2 text-grey">
            Это действие нельзя отменить. Все связанные пользовательские истории и требования также будут удалены.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey-darken-1" variant="text" @click="handleDeleteCancel" :disabled="deleteLoading">
            Отмена
          </v-btn>
          <v-btn color="error" variant="elevated" @click="handleDeleteConfirm" :loading="deleteLoading">
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSuccessMessage" color="success" timeout="4000" location="top">
      {{ successMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showSuccessMessage = false">
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showErrorMessage" color="error" timeout="6000" location="top">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showErrorMessage = false">
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
import type { Epic, EpicStatus, Priority, CreateEpicRequest, UpdateEpicRequest, EpicListParams } from '@/types'

interface DataTableOptions {
  page: number
  itemsPerPage: number
  sortBy: { key: string; order: 'asc' | 'desc' }[]
}

const entitiesStore = useEntitiesStore()

// State
const showEpicDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedEpic = ref<Epic | undefined>()
const epicToDelete = ref<Epic | undefined>()
const formLoading = ref(false)
const deleteLoading = ref(false)

// Filter, search, and sort state
const currentFilters = ref<{ status?: EpicStatus; priority?: Priority }>({})
const currentSearch = ref('')
const currentSort = ref<{ key: string; order: 'asc' | 'desc' }>({ key: 'created_at', order: 'desc' })

// Success/Error messages
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Computed properties
const isLoading = computed(() => entitiesStore.loading.epics)
const epics = computed(() => entitiesStore.epicsList)
const totalCount = computed(() => entitiesStore.epicsPagination.totalCount)
const currentPage = computed(() => entitiesStore.epicsPagination.page)
const pageSize = computed(() => entitiesStore.epicsPagination.pageSize)

// Methods
const loadEpics = async () => {
  try {
    const params: EpicListParams = {
      include: 'creator,assignee',
      order_by: `${currentSort.value.key} ${currentSort.value.order}`,
    }

    // Add filters if they exist
    if (currentFilters.value.status) {
      params.status = currentFilters.value.status
    }
    if (currentFilters.value.priority) {
      params.priority = currentFilters.value.priority
    }
    if (currentSearch.value) {
      params.search = currentSearch.value
    }

    await entitiesStore.fetchEpics(params)
  } catch (error) {
    console.error('Failed to load epics:', error)
    showError('Failed to load epics list')
  }
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
  currentFilters.value = { ...filters }
  // Reset to first page when filters change
  entitiesStore.setEpicsPage(1)
  loadEpics()
}



const handleOptionsChange = (options: DataTableOptions) => {
  // Handle sorting changes
  if (options.sortBy.length > 0) {
    currentSort.value = { ...options.sortBy[0] }
  } else {
    currentSort.value = { key: 'created_at', order: 'desc' }
  }
  
  // Handle page changes
  entitiesStore.setEpicsPage(options.page)
  
  // Handle page size changes
  if (options.itemsPerPage !== pageSize.value) {
    entitiesStore.setEpicsPageSize(options.itemsPerPage)
  }
  
  // Reload data with new options
  loadEpics()
}

const handleSearchChange = (query: string) => {
  currentSearch.value = query
  // Reset to first page when search changes
  entitiesStore.setEpicsPage(1)
  loadEpics()
}

const handleCreateEpic = () => {
  selectedEpic.value = undefined
  showEpicDialog.value = true
}

const handleClearFilters = () => {
  currentFilters.value = {}
  currentSearch.value = ''
  // Reset to first page when clearing filters
  entitiesStore.setEpicsPage(1)
  loadEpics()
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

<style scoped>
.epics-list-view {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

/* Ensure proper spacing and layout matching wireframe design */
.page-header h1 {
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.2;
}
</style>
