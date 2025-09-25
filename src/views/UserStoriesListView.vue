<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">Пользовательские истории</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="createUserStory"
            :disabled="loading"
          >
            Создать историю
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Поиск историй"
                  single-line
                  hide-details
                  variant="outlined"
                  density="compact"
                  @input="debouncedSearch"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="selectedEpic"
                  :items="epicOptions"
                  :loading="epicsLoading"
                  label="Фильтр по эпику"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:model-value="applyFilters"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="selectedStatus"
                  :items="statusOptions"
                  label="Статус"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:model-value="applyFilters"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="selectedPriority"
                  :items="priorityOptions"
                  label="Приоритет"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:model-value="applyFilters"
                />
              </v-col>
              <v-col cols="12" md="1">
                <v-btn
                  icon="mdi-refresh"
                  variant="text"
                  @click="refreshData"
                  :loading="loading"
                  title="Обновить"
                />
              </v-col>
            </v-row>
          </v-card-title>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <v-progress-circular indeterminate size="64" color="primary" />
            <div class="mt-4">Загрузка пользовательских историй...</div>
          </div>

          <!-- Error State -->
          <v-alert v-else-if="error" type="error" class="ma-4">
            {{ error }}
            <template v-slot:append>
              <v-btn @click="loadUserStories" variant="text" size="small">Повторить</v-btn>
            </template>
          </v-alert>

          <!-- Data Table -->
          <v-data-table
            v-else
            :headers="headers"
            :items="userStories"
            :items-length="totalCount"
            :loading="loading"
            :items-per-page="itemsPerPage"
            :page="currentPage"
            @update:page="handlePageChange"
            @update:items-per-page="handleItemsPerPageChange"
            @update:sort-by="handleSortChange"
            class="elevation-1"
          >
            <template v-slot:[`item.epic`]="{ item }">
              <router-link
                v-if="item.epic"
                :to="`/epics/${item.epic_id}`"
                class="text-decoration-none"
              >
                {{ item.epic.reference_id }}: {{ item.epic.title }}
              </router-link>
              <span v-else class="text-grey">Эпик не указан</span>
            </template>

            <template v-slot:[`item.status`]="{ item }">
              <v-chip :color="getStatusColor(item.status)" size="small">
                {{ item.status }}
              </v-chip>
            </template>

            <template v-slot:[`item.priority`]="{ item }">
              <v-chip :color="getPriorityColor(item.priority)" size="small">
                {{ getPriorityText(item.priority) }}
              </v-chip>
            </template>

            <template v-slot:[`item.assignee`]="{ item }">
              <span v-if="item.assignee">{{ item.assignee.username }}</span>
              <span v-else class="text-grey">Не назначен</span>
            </template>

            <template v-slot:[`item.created_at`]="{ item }">
              {{ formatDate(item.created_at) }}
            </template>

            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                :to="`/user-stories/${item.id}`"
                title="Просмотр"
              />
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="editUserStory(item.id)"
                title="Редактировать"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteUserStory(item)"
                title="Удалить"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { userStoryService } from '@/services/user-story-service'
import { epicService } from '@/services/epic-service'
import type { UserStory, Epic, UserStoryListParams, UserStoryStatus, Priority } from '@/types'

const router = useRouter()

// Reactive state
const userStories = ref<UserStory[]>([])
const epics = ref<Epic[]>([])
const loading = ref(true)
const epicsLoading = ref(false)
const error = ref<string | null>(null)

// Filters and search
const search = ref('')
const selectedEpic = ref<string>('')
const selectedStatus = ref<string>('')
const selectedPriority = ref<number | ''>('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(25)
const totalCount = ref(0)

// Sorting
const sortBy = ref<string>('last_modified')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Table headers
const headers = [
  { title: 'ID', key: 'reference_id', sortable: true },
  { title: 'Название', key: 'title', sortable: true },
  { title: 'Эпик', key: 'epic', sortable: false },
  { title: 'Статус', key: 'status', sortable: true },
  { title: 'Приоритет', key: 'priority', sortable: true },
  { title: 'Ответственный', key: 'assignee', sortable: false },
  { title: 'Создана', key: 'created_at', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false },
]

// Filter options
const statusOptions = [
  { title: 'Backlog', value: 'Backlog' },
  { title: 'Draft', value: 'Draft' },
  { title: 'In Progress', value: 'In Progress' },
  { title: 'Done', value: 'Done' },
  { title: 'Cancelled', value: 'Cancelled' },
]

const priorityOptions = [
  { title: 'Критический', value: 1 },
  { title: 'Высокий', value: 2 },
  { title: 'Средний', value: 3 },
  { title: 'Низкий', value: 4 },
]

// Computed
const epicOptions = computed(() => {
  return epics.value.map((epic) => ({
    title: `${epic.reference_id}: ${epic.title}`,
    value: epic.id,
  }))
})

// Methods
const loadUserStories = async () => {
  try {
    loading.value = true
    error.value = null

    // Start with no parameters to test basic API
    let params: UserStoryListParams | undefined = undefined

    // If no filters are applied, try without any parameters
    if (!selectedEpic.value && !selectedStatus.value && !selectedPriority.value) {
      console.log('Trying API call without parameters first')
      params = undefined
    } else {
      // Only add parameters if filters are applied
      params = {}
      if (selectedEpic.value) {
        params.epic_id = selectedEpic.value
      }
      if (selectedStatus.value) {
        params.status = selectedStatus.value as UserStoryStatus
      }
      if (selectedPriority.value) {
        params.priority = selectedPriority.value as Priority
      }
    }

    console.log('Loading user stories with params:', params)
    const response = await userStoryService.list(params)
    console.log('Raw API response:', response)

    // Handle different response formats
    if (response && response.data && Array.isArray(response.data)) {
      // Standard format: {data: Array, total_count: number}
      userStories.value = response.data
      totalCount.value = response.total_count || response.data.length
      console.log(
        'Loaded user stories (standard format):',
        response.data.length,
        'total:',
        totalCount.value,
      )
    } else if (
      response &&
      'user_stories' in response &&
      Array.isArray((response as { user_stories: UserStory[] }).user_stories)
    ) {
      // Alternative format: {user_stories: Array, count: number}
      const altResponse = response as { user_stories: UserStory[]; count?: number }
      userStories.value = altResponse.user_stories
      totalCount.value = altResponse.count || altResponse.user_stories.length
      console.log(
        'Loaded user stories (alternative format):',
        altResponse.user_stories.length,
        'total:',
        totalCount.value,
      )
    } else if (Array.isArray(response)) {
      // Direct array response
      userStories.value = response
      totalCount.value = response.length
      console.log('Loaded user stories (direct array):', response.length)
    } else {
      console.warn('Unexpected response format:', response)
      userStories.value = []
      totalCount.value = 0
    }
  } catch (err) {
    console.error('Failed to load user stories:', err)
    error.value =
      err instanceof Error ? err.message : 'Не удалось загрузить пользовательские истории'
  } finally {
    loading.value = false
  }
}

const loadEpics = async () => {
  try {
    epicsLoading.value = true

    // Try without parameters first
    const params = undefined

    console.log('Loading epics with params:', params)
    const response = await epicService.list(params)
    console.log('Raw epics response:', response)

    // Handle different response formats
    if (response && response.data && Array.isArray(response.data)) {
      epics.value = response.data
      console.log('Loaded epics:', response.data.length)
    } else if (Array.isArray(response)) {
      // Direct array response
      epics.value = response
      console.log('Loaded epics (direct array):', response.length)
    } else {
      console.warn('Unexpected epics response format:', response)
      epics.value = []
    }
  } catch (err) {
    console.error('Failed to load epics:', err)
    // Don't show error for epics, just keep empty array
    epics.value = []
  } finally {
    epicsLoading.value = false
  }
}

const refreshData = async () => {
  await Promise.all([loadUserStories(), loadEpics()])
}

const applyFilters = () => {
  currentPage.value = 1
  loadUserStories()
}

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

// Pagination handlers
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadUserStories()
}

const handleItemsPerPageChange = (items: number) => {
  itemsPerPage.value = items
  currentPage.value = 1
  loadUserStories()
}

const handleSortChange = (sortItems: { key: string; order: 'asc' | 'desc' }[]) => {
  if (sortItems.length > 0) {
    const sortItem = sortItems[0]
    sortBy.value = sortItem.key
    sortOrder.value = sortItem.order
    loadUserStories()
  }
}

// Actions
const createUserStory = () => {
  router.push('/user-stories/new')
}

const editUserStory = (id: string) => {
  router.push(`/user-stories/${id}/edit`)
}

const deleteUserStory = async (userStory: UserStory) => {
  if (
    confirm(
      `Вы уверены, что хотите удалить историю "${userStory.reference_id}: ${userStory.title}"?`,
    )
  ) {
    try {
      await userStoryService.delete(userStory.id)
      await loadUserStories()
    } catch (err) {
      console.error('Failed to delete user story:', err)
      alert('Не удалось удалить пользовательскую историю')
    }
  }
}

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Backlog: 'grey',
    Draft: 'orange',
    'In Progress': 'blue',
    Done: 'green',
    Cancelled: 'red',
  }
  return colors[status] || 'grey'
}

const getPriorityColor = (priority: number) => {
  const colors: Record<number, string> = {
    1: 'red',
    2: 'orange',
    3: 'yellow',
    4: 'green',
  }
  return colors[priority] || 'grey'
}

const getPriorityText = (priority: number) => {
  const texts: Record<number, string> = {
    1: 'Критический',
    2: 'Высокий',
    3: 'Средний',
    4: 'Низкий',
  }
  return texts[priority] || 'Неизвестно'
}

// Lifecycle
onMounted(() => {
  refreshData()
})

// Watch for search changes
watch(search, () => {
  debouncedSearch()
})
</script>
