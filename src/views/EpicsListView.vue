<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">Эпики</h1>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="handleCreateEpic">
            Создать эпик
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row>
      <v-col cols="12" md="3">
        <v-select
          v-model="filters.status"
          :items="statusOptions"
          label="Статус"
          variant="outlined"
          density="compact"
          clearable
          @update:model-value="applyFilters"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="filters.priority"
          :items="priorityOptions"
          label="Приоритет"
          variant="outlined"
          density="compact"
          clearable
          @update:model-value="applyFilters"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Поиск эпиков"
          single-line
          hide-details
          variant="outlined"
          density="compact"
          clearable
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table
            :headers="headers"
            :items="filteredEpics"
            :search="search"
            :loading="isLoading"
            class="elevation-1"
            :items-per-page="25"
            :items-per-page-options="[10, 25, 50, 100]"
          >
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
                :to="`/epics/${item.id}`"
                title="Просмотр"
              />
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="handleEditEpic(item)"
                title="Редактировать"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="handleDeleteEpic(item)"
                title="Удалить"
              />
            </template>

            <template v-slot:no-data>
              <div class="text-center pa-4">
                <v-icon size="48" color="grey">mdi-folder-open-outline</v-icon>
                <p class="text-h6 mt-2">Эпики не найдены</p>
                <p class="text-body-2 text-grey">
                  {{
                    search || hasActiveFilters
                      ? 'Попробуйте изменить критерии поиска'
                      : 'Создайте первый эпик'
                  }}
                </p>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      class="mt-4"
      @click:close="clearError"
    >
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEntitiesStore } from '@/stores/entities'
import type { Epic, EpicStatus, Priority } from '@/types'

const router = useRouter()
const entitiesStore = useEntitiesStore()

// Reactive state
const search = ref('')
const filters = ref<{
  status?: EpicStatus
  priority?: Priority
}>({})

// Computed properties
const isLoading = computed(() => entitiesStore.loading.epics)
const error = computed(() => entitiesStore.errors.epics)
const epics = computed(() => entitiesStore.epicsList)

const filteredEpics = computed(() => {
  let result = epics.value

  // Apply status filter
  if (filters.value.status) {
    result = result.filter((epic) => epic.status === filters.value.status)
  }

  // Apply priority filter
  if (filters.value.priority) {
    result = result.filter((epic) => epic.priority === filters.value.priority)
  }

  return result
})

const hasActiveFilters = computed(() => {
  return Boolean(filters.value.status || filters.value.priority)
})

// Table configuration
const headers = [
  { title: 'ID', key: 'reference_id', sortable: true },
  { title: 'Название', key: 'title', sortable: true },
  { title: 'Статус', key: 'status', sortable: true },
  { title: 'Приоритет', key: 'priority', sortable: true },
  { title: 'Ответственный', key: 'assignee', sortable: true },
  { title: 'Создан', key: 'created_at', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false },
]

// Filter options
const statusOptions = [
  { title: 'Бэклог', value: 'Backlog' },
  { title: 'Черновик', value: 'Draft' },
  { title: 'В работе', value: 'In Progress' },
  { title: 'Выполнено', value: 'Done' },
  { title: 'Отменено', value: 'Cancelled' },
]

const priorityOptions = [
  { title: 'Критический', value: 1 },
  { title: 'Высокий', value: 2 },
  { title: 'Средний', value: 3 },
  { title: 'Низкий', value: 4 },
]

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
  }
}

const applyFilters = () => {
  // Filters are applied automatically through computed property
  // This method can be used for additional filter logic if needed
}

const clearError = () => {
  delete entitiesStore.errors.epics
}

const handleCreateEpic = () => {
  router.push('/epics/create')
}

const handleEditEpic = (epic: Epic) => {
  router.push(`/epics/${epic.id}/edit`)
}

const handleDeleteEpic = async (epic: Epic) => {
  if (confirm(`Вы уверены, что хотите удалить эпик "${epic.title}"?`)) {
    try {
      await entitiesStore.deleteEpic(epic.id)
    } catch (error) {
      console.error('Failed to delete epic:', error)
    }
  }
}

// Utility functions
const getStatusColor = (status: EpicStatus) => {
  const colors: Record<EpicStatus, string> = {
    Backlog: 'grey',
    Draft: 'orange',
    'In Progress': 'blue',
    Done: 'green',
    Cancelled: 'red',
  }
  return colors[status] || 'grey'
}

const getStatusText = (status: EpicStatus) => {
  const texts: Record<EpicStatus, string> = {
    Backlog: 'Бэклог',
    Draft: 'Черновик',
    'In Progress': 'В работе',
    Done: 'Выполнено',
    Cancelled: 'Отменено',
  }
  return texts[status] || status
}

const getPriorityColor = (priority: Priority) => {
  const colors: Record<Priority, string> = {
    1: 'red',
    2: 'orange',
    3: 'yellow',
    4: 'green',
  }
  return colors[priority] || 'grey'
}

const getPriorityText = (priority: Priority) => {
  const texts: Record<Priority, string> = {
    1: 'Критический',
    2: 'Высокий',
    3: 'Средний',
    4: 'Низкий',
  }
  return texts[priority] || 'Неизвестно'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// Lifecycle
onMounted(() => {
  loadEpics()
})
</script>
