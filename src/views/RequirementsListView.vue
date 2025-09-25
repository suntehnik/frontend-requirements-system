<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">Требования</h1>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="handleCreateRequirement">
            Создать требование
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
                  label="Поиск требований"
                  single-line
                  hide-details
                  variant="outlined"
                  density="compact"
                  @input="debouncedSearch"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedUserStory"
                  :items="userStoryOptions"
                  :loading="loadingUserStories"
                  label="Фильтр по истории"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:model-value="handleFilterChange"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedType"
                  :items="typeOptions"
                  :loading="loadingTypes"
                  label="Фильтр по типу"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  @update:model-value="handleFilterChange"
                />
              </v-col>
            </v-row>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="displayRequirements"
            :loading="loading"
            :search="search"
            class="elevation-1"
            :items-per-page="itemsPerPage"
            :server-items-length="totalCount"
            @update:options="handleTableOptionsUpdate"
          >
            <template v-slot:[`item.title`]="{ item }">
              <div class="text-truncate" style="max-width: 230px;" :title="item.title">
                {{ item.title }}
              </div>
            </template>
            <template v-slot:[`item.user_story`]="{ item }">
              <div class="text-truncate" style="max-width: 180px;">
                <router-link 
                  v-if="item.user_story"
                  :to="`/user-stories/${item.user_story_id}`" 
                  class="text-decoration-none"
                  :title="`${item.user_story.reference_id}: ${item.user_story.title}`"
                >
                  {{ item.user_story.reference_id }}
                </router-link>
                <span v-else-if="getUserStoryById(item.user_story_id)" class="text-decoration-none">
                  <router-link 
                    :to="`/user-stories/${item.user_story_id}`"
                    class="text-decoration-none"
                    :title="getUserStoryById(item.user_story_id)?.title"
                  >
                    {{ getUserStoryById(item.user_story_id)?.reference_id }}
                  </router-link>
                </span>
                <span v-else class="text-grey" :title="item.user_story_id">-</span>
              </div>
            </template>

            <template v-slot:[`item.type`]="{ item }">
              <div class="text-truncate" style="max-width: 100px;">
                <span v-if="item.type" :title="item.type.name">{{ item.type.name }}</span>
                <span v-else-if="getRequirementTypeById(item.type_id)" :title="getRequirementTypeById(item.type_id)?.name">
                  {{ getRequirementTypeById(item.type_id)?.name }}
                </span>
                <span v-else class="text-grey" :title="item.type_id">-</span>
              </div>
            </template>

            <template v-slot:[`item.status`]="{ item }">
              <v-chip :color="getStatusColor(item.status)" size="small">
                {{ getStatusText(item.status) }}
              </v-chip>
            </template>

            <template v-slot:[`item.priority`]="{ item }">
              <v-chip :color="getPriorityColor(item.priority)" size="small">
                {{ getPriorityText(item.priority) }}
              </v-chip>
            </template>

            <template v-slot:[`item.assignee`]="{ item }">
              <div class="text-truncate" style="max-width: 120px;">
                <span v-if="item.assignee" :title="item.assignee.username">{{ item.assignee.username }}</span>
                <span v-else class="text-grey">Не назначен</span>
              </div>
            </template>

            <template v-slot:[`item.created_at`]="{ item }">
              {{ formatDate(item.created_at) }}
            </template>

            <template v-slot:[`item.actions`]="{ item }">
              <v-btn 
                icon="mdi-eye" 
                size="small" 
                variant="text" 
                :to="`/requirements/${item.id}`"
                title="Просмотр"
              />
              <v-btn 
                icon="mdi-pencil" 
                size="small" 
                variant="text"
                @click="handleEditRequirement(item)"
                title="Редактировать"
              />
              <v-btn 
                icon="mdi-delete" 
                size="small" 
                variant="text" 
                color="error"
                @click="handleDeleteRequirement(item)"
                title="Удалить"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      dismissible
      @click:close="error = ''"
      class="mt-4"
    >
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEntitiesStore } from '@/stores/entities'
import { configService } from '@/services'
import type { 
  Requirement, 
  RequirementListParams, 
  RequirementType, 
  UserStory,
  RequirementStatus 
} from '@/types'

const router = useRouter()
const entitiesStore = useEntitiesStore()

// Reactive state
const search = ref('')
const selectedUserStory = ref<string>('')
const selectedType = ref<string>('')
const loading = ref(false)
const loadingUserStories = ref(false)
const loadingTypes = ref(false)
const error = ref('')
const itemsPerPage = ref(25)
const totalCount = ref(0)
const currentPage = ref(1)

// Configuration data
const requirementTypes = ref<RequirementType[]>([])
const userStories = ref<UserStory[]>([])

const headers = [
  { title: 'ID', key: 'reference_id', sortable: true, width: '100px' },
  { title: 'Название', key: 'title', sortable: true, width: '250px' },
  { title: 'История', key: 'user_story', sortable: false, width: '200px' },
  { title: 'Тип', key: 'type', sortable: false, width: '120px' },
  { title: 'Статус', key: 'status', sortable: true, width: '100px' },
  { title: 'Приоритет', key: 'priority', sortable: true, width: '120px' },
  { title: 'Ответственный', key: 'assignee', sortable: false, width: '140px' },
  { title: 'Создано', key: 'created_at', sortable: true, width: '110px' },
  { title: 'Действия', key: 'actions', sortable: false, width: '120px' },
]

// Computed properties
const displayRequirements = computed(() => {
  return entitiesStore.requirementsList
})

const userStoryOptions = computed(() => {
  return userStories.value.map(story => ({
    title: `${story.reference_id}: ${story.title}`,
    value: story.id,
  }))
})

const typeOptions = computed(() => {
  return requirementTypes.value.map(type => ({
    title: type.name,
    value: type.id,
  }))
})

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadRequirements()
  }, 500)
}

// Load requirements with current filters
const loadRequirements = async () => {
  loading.value = true
  error.value = ''

  try {
    const params: RequirementListParams = {
      limit: itemsPerPage.value,
      offset: (currentPage.value - 1) * itemsPerPage.value,
      include: 'user_story,type,creator,assignee',
    }

    if (selectedUserStory.value) {
      params.user_story_id = selectedUserStory.value
    }

    if (selectedType.value) {
      params.type_id = selectedType.value
    }

    const response = await entitiesStore.fetchRequirements(params)
    
    if (response && typeof response === 'object' && 'total_count' in response) {
      totalCount.value = response.total_count
    } else if (response && Array.isArray(response)) {
      // Fallback if response is just an array
      totalCount.value = response.length
    }
  } catch (err) {
    console.error('Error loading requirements:', err)
    error.value = err instanceof Error ? err.message : 'Ошибка загрузки требований'
  } finally {
    loading.value = false
  }
}

// Load configuration data
const loadConfigData = async () => {
  try {
    // Load requirement types
    loadingTypes.value = true
    const typesResponse = await configService.getRequirementTypes()
    requirementTypes.value = typesResponse.requirement_types || []
  } catch (err) {
    console.error('Error loading requirement types:', err)
  } finally {
    loadingTypes.value = false
  }

  try {
    // Load user stories for filter
    loadingUserStories.value = true
    const storiesResponse = await entitiesStore.fetchUserStories({ 
      limit: 100,
      include: 'epic'
    })
    
    if (storiesResponse && Array.isArray(storiesResponse.data)) {
      userStories.value = storiesResponse.data
    } else if (Array.isArray(storiesResponse)) {
      userStories.value = storiesResponse
    }
  } catch (err) {
    console.error('Error loading user stories:', err)
  } finally {
    loadingUserStories.value = false
  }
}

// Event handlers
const handleFilterChange = () => {
  currentPage.value = 1
  loadRequirements()
}

const handleTableOptionsUpdate = (options: { page: number; itemsPerPage: number }) => {
  if (options.page !== currentPage.value) {
    currentPage.value = options.page
    loadRequirements()
  }
  if (options.itemsPerPage !== itemsPerPage.value) {
    itemsPerPage.value = options.itemsPerPage
    currentPage.value = 1
    loadRequirements()
  }
}

const handleCreateRequirement = () => {
  // Navigate to create requirement page or open dialog
  router.push('/requirements/create')
}

const handleEditRequirement = (requirement: Requirement) => {
  router.push(`/requirements/${requirement.id}/edit`)
}

const handleDeleteRequirement = async (requirement: Requirement) => {
  if (confirm(`Вы уверены, что хотите удалить требование "${requirement.title}"?`)) {
    try {
      await entitiesStore.deleteRequirement(requirement.id)
      await loadRequirements() // Reload the list
    } catch (err) {
      console.error('Error deleting requirement:', err)
      error.value = err instanceof Error ? err.message : 'Ошибка удаления требования'
    }
  }
}

// Utility functions
const getStatusColor = (status: RequirementStatus) => {
  const colors: Record<RequirementStatus, string> = {
    Draft: 'orange',
    Active: 'green',
    Obsolete: 'red',
  }
  return colors[status] || 'grey'
}

const getStatusText = (status: RequirementStatus) => {
  const texts: Record<RequirementStatus, string> = {
    Draft: 'Черновик',
    Active: 'Активно',
    Obsolete: 'Устарело',
  }
  return texts[status] || status
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// Helper functions to find related data
const getUserStoryById = (id: string) => {
  return userStories.value.find(story => story.id === id)
}

const getRequirementTypeById = (id: string) => {
  return requirementTypes.value.find(type => type.id === id)
}

// Lifecycle
onMounted(async () => {
  await loadConfigData()
  await loadRequirements()
})

// Watch for search changes
watch(search, () => {
  debouncedSearch()
})
</script>

<style scoped>
/* Ensure table cells don't wrap */
:deep(.v-data-table__td) {
  white-space: nowrap !important;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ensure table headers don't wrap */
:deep(.v-data-table__th) {
  white-space: nowrap !important;
}

/* Fix table layout */
:deep(.v-data-table) {
  table-layout: fixed;
}

/* Ensure text truncation works properly */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
