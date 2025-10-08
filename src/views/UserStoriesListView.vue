<template>
  <div class="user-stories-list-view">
    <!-- User Story List Component -->
    <UserStoryList
      :user-stories="userStories"
      :loading="isLoading"
      :total-count="totalCount"
      :current-page="currentPage"
      :page-size="pageSize"
      :epics="epics"
      @create="handleCreateUserStory"
      @delete="handleDeleteUserStory"
      @filter-change="handleFilterChange"
      @options-change="handleOptionsChange"
      @search-change="handleSearchChange"
      @clear-filters="handleClearFilters"
    />

    <!-- Create User Story Modal -->
    <v-dialog v-model="showUserStoryDialog" max-width="800px" persistent scrollable>
      <UserStoryForm
        :loading="formLoading"
        @submit="handleUserStorySubmit"
        @cancel="handleUserStoryCancel"
      />
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5"> Подтверждение удаления </v-card-title>
        <v-card-text>
          <p>Вы уверены, что хотите удалить пользовательскую историю?</p>
          <v-alert v-if="userStoryToDelete" type="warning" variant="tonal" class="mt-4">
            <strong>{{ userStoryToDelete.reference_id }}: {{ userStoryToDelete.title }}</strong>
          </v-alert>
          <p class="mt-4 text-body-2 text-grey">
            Это действие нельзя отменить. Все связанные критерии приемки и требования также будут
            удалены.
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEntitiesStore } from '@/stores/entities'
import { UserStoryList } from '@/components/data-display'
import { UserStoryForm } from '@/components/forms'
import type {
  UserStory,
  CreateUserStoryRequest,
  UserStoryListParams,
  DataTableOptions,
  UserStoryFilterState,
} from '@/types'

const entitiesStore = useEntitiesStore()

// State
const showUserStoryDialog = ref(false)
const showDeleteDialog = ref(false)
const userStoryToDelete = ref<UserStory | undefined>()
const formLoading = ref(false)
const deleteLoading = ref(false)

// Filter, search, and sort state
const currentFilters = ref<UserStoryFilterState>({})
const currentSearch = ref('')
const currentSort = ref<{ key: string; order: 'asc' | 'desc' }>({
  key: 'created_at',
  order: 'desc',
})

// Success/Error messages
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Computed properties
const isLoading = computed(() => entitiesStore.loading['user-stories'] || false)
const userStories = computed(() => entitiesStore.userStoriesList)
const totalCount = computed(() => entitiesStore.userStoriesPagination.totalCount)
const currentPage = computed(() => entitiesStore.userStoriesPagination.page)
const pageSize = computed(() => entitiesStore.userStoriesPagination.pageSize)
const epics = computed(() => entitiesStore.epicsList)

// Methods
const loadUserStories = async () => {
  try {
    const params: UserStoryListParams = {
      include: 'epic,creator,assignee',
      order_by: `${currentSort.value.key} ${currentSort.value.order}`,
    }

    // Add filters if they exist
    if (currentFilters.value.status) {
      params.status = currentFilters.value.status
    }
    if (currentFilters.value.priority) {
      params.priority = currentFilters.value.priority
    }
    if (currentFilters.value.epic_id) {
      params.epic_id = currentFilters.value.epic_id
    }
    if (currentSearch.value) {
      params.search = currentSearch.value
    }

    await entitiesStore.fetchUserStories(params)
  } catch (error) {
    console.error('Failed to load user stories:', error)
    showError('Не удалось загрузить список пользовательских историй')
  }
}

const loadEpics = async () => {
  try {
    // Load epics if not already loaded or if the list is empty
    if (entitiesStore.epicsList.length === 0) {
      await entitiesStore.fetchEpics({ limit: 100, order_by: 'title' })
    }
  } catch (error) {
    console.error('Failed to load epics:', error)
    // Don't show error for epics, just keep empty array
  }
}

const handleUserStorySubmit = async (data: CreateUserStoryRequest) => {
  formLoading.value = true

  try {
    await entitiesStore.createUserStory(data)
    showSuccess('Пользовательская история успешно создана')
    showUserStoryDialog.value = false

    // Refresh the list to show the new user story
    await loadUserStories()
  } catch (error) {
    console.error('Failed to create user story:', error)
    showError('Не удалось создать пользовательскую историю')
  } finally {
    formLoading.value = false
  }
}

const handleUserStoryCancel = () => {
  showUserStoryDialog.value = false
}

const handleDeleteUserStory = (userStory: UserStory) => {
  userStoryToDelete.value = userStory
  showDeleteDialog.value = true
}

const handleDeleteConfirm = async () => {
  if (!userStoryToDelete.value) return

  deleteLoading.value = true

  try {
    await entitiesStore.deleteUserStory(userStoryToDelete.value.id)
    showSuccess('Пользовательская история успешно удалена')
    showDeleteDialog.value = false
    userStoryToDelete.value = undefined

    // Refresh the list to reflect the deletion
    await loadUserStories()
  } catch (error) {
    console.error('Failed to delete user story:', error)
    showError('Не удалось удалить пользовательскую историю')
  } finally {
    deleteLoading.value = false
  }
}

const handleDeleteCancel = () => {
  showDeleteDialog.value = false
  userStoryToDelete.value = undefined
}

const handleFilterChange = (filters: UserStoryFilterState) => {
  currentFilters.value = { ...filters }
  // Reset to first page when filters change
  entitiesStore.setUserStoriesPage(1)
  loadUserStories()
}

const handleOptionsChange = (options: DataTableOptions) => {
  // Handle sorting changes
  if (options.sortBy.length > 0) {
    currentSort.value = { ...options.sortBy[0] }
  } else {
    currentSort.value = { key: 'created_at', order: 'desc' }
  }

  // Handle page changes
  entitiesStore.setUserStoriesPage(options.page)

  // Handle page size changes
  if (options.itemsPerPage !== pageSize.value) {
    entitiesStore.setUserStoriesPageSize(options.itemsPerPage)
  }

  // Reload data with new options
  loadUserStories()
}

const handleSearchChange = (query: string) => {
  currentSearch.value = query
  // Reset to first page when search changes
  entitiesStore.setUserStoriesPage(1)
  loadUserStories()
}

const handleCreateUserStory = () => {
  showUserStoryDialog.value = true
}

const handleClearFilters = () => {
  currentFilters.value = {}
  currentSearch.value = ''
  // Reset to first page when clearing filters
  entitiesStore.setUserStoriesPage(1)
  loadUserStories()
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
onMounted(async () => {
  // Load both epics and user stories
  await Promise.all([loadEpics(), loadUserStories()])
})
</script>

<style scoped>
.user-stories-list-view {
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
