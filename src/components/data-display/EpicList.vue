<template>
  <div>
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
          @update:model-value="handleSearchChange"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table-server
            :headers="headers"
            :items="props.epics"
            :loading="loading"
            class="elevation-1"
            :items-per-page="pageSize"
            :items-per-page-options="pageSizeOptions"
            :page="currentPage"
            :sort-by="sortBy"
            @update:options="handleOptionsChange"
            @click:row="handleRowClick"
            :items-length="totalCount"
            :multi-sort="false"
            :must-sort="false"
            :hide-default-footer="!shouldShowPagination"
          >
            <!-- Table content templates -->
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
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="handleDeleteClick($event, item)"
                title="Удалить"
              />
            </template>

            <template v-slot:no-data>
              <div class="text-center pa-8">
                <!-- Empty state for filtered results -->
                <div v-if="search || hasActiveFilters">
                  <v-icon size="64" color="grey-lighten-1">mdi-filter-remove-outline</v-icon>
                  <p class="text-h6 mt-4 mb-2">Эпики не найдены</p>
                  <p class="text-body-2 text-grey mb-4">
                    По вашим критериям поиска ничего не найдено.
                  </p>
                  <v-btn
                    variant="outlined"
                    color="primary"
                    @click="clearFiltersAndSearch"
                    prepend-icon="mdi-filter-off"
                  >
                    Очистить фильтры
                  </v-btn>
                </div>

                <!-- Empty state for no epics at all -->
                <div v-else>
                  <v-icon size="64" color="grey-lighten-1">mdi-rocket-launch-outline</v-icon>
                  <p class="text-h6 mt-4 mb-2">Пока нет эпиков</p>
                  <p class="text-body-2 text-grey mb-6">
                    Создайте первый эпик, чтобы начать планирование проекта. Эпики помогают
                    организовать пользовательские истории по функциональным областям.
                  </p>
                  <v-btn
                    variant="elevated"
                    color="primary"
                    size="large"
                    @click="handleCreateEpic"
                    prepend-icon="mdi-plus"
                  >
                    Создать первый эпик
                  </v-btn>
                </div>
              </div>
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Epic, EpicStatus, Priority } from '@/types'

interface Props {
  epics: Epic[]
  loading?: boolean
  totalCount?: number
  currentPage?: number
  pageSize?: number
}

interface Emits {
  (e: 'create'): void
  (e: 'delete', epic: Epic): void
  (e: 'filter-change', filters: FilterState): void
  (e: 'options-change', options: DataTableOptions): void
  (e: 'search-change', query: string): void
  (e: 'clear-filters'): void
}

interface FilterState {
  status?: EpicStatus
  priority?: Priority
}

interface SortItem {
  key: string
  order: 'asc' | 'desc'
}

interface DataTableOptions {
  page: number
  itemsPerPage: number
  sortBy: { key: string; order: 'asc' | 'desc' }[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  totalCount: 0,
  currentPage: 1,
  pageSize: 25,
})

const emit = defineEmits<Emits>()

// Router
const router = useRouter()

// State
const search = ref('')
const filters = ref<FilterState>({})
const sortBy = ref<SortItem[]>([])

// Table configuration
const headers = [
  { title: 'ID', key: 'reference_id', sortable: true },
  { title: 'Название', key: 'title', sortable: true },
  { title: 'Статус', key: 'status', sortable: true, class: 'd-none d-md-table-cell' },
  { title: 'Приоритет', key: 'priority', sortable: true, class: 'd-none d-lg-table-cell' },
  { title: 'Ответственный', key: 'assignee', sortable: true, class: 'd-none d-lg-table-cell' },
  { title: 'Создан', key: 'created_at', sortable: true, class: 'd-none d-xl-table-cell' },
  { title: '', key: 'actions', sortable: false },
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

// Computed
const hasActiveFilters = computed(() => {
  return Boolean(filters.value.status || filters.value.priority)
})

const totalCount = computed(() => props.totalCount || 0)
const pageSize = computed(() => props.pageSize || 25)
const currentPage = computed(() => props.currentPage || 1)

// Show pagination when there are more than one page of results
const shouldShowPagination = computed(() => totalCount.value > pageSize.value)

// Page size options as specified in requirements (10, 25-default, 50, 100)
const pageSizeOptions = [10, 25, 50, 100]

// Methods
const applyFilters = () => {
  emit('filter-change', { ...filters.value })
}

const handleRowClick = (_event: Event, { item }: { item: Epic }) => {
  router.push(`/epics/${item.reference_id}`)
}

const handleDeleteClick = (event: Event, item: Epic) => {
  event.stopPropagation() // Prevent row click event
  emit('delete', item)
}

const handleOptionsChange = (options: DataTableOptions) => {
  // Update local sortBy state
  sortBy.value = options.sortBy

  // Emit the options change to parent
  emit('options-change', options)
}

const handleSearchChange = (query: string) => {
  emit('search-change', query)
}

const clearFiltersAndSearch = () => {
  // Clear local state
  search.value = ''
  filters.value = {}

  // Emit events to parent to clear filters and search
  emit('clear-filters')
  emit('search-change', '')
  emit('filter-change', {})
}

const handleCreateEpic = () => {
  emit('create')
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
</script>

<style scoped>
/* Простой responsive дизайн с использованием Vuetify классов */
.v-data-table {
  overflow-x: auto;
}

/* Обрезка длинных заголовков */
:deep(.v-data-table td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* Заголовок всегда виден полностью */
:deep(.v-data-table td:nth-child(2)) {
  max-width: 300px;
}

/* Hover эффект для строк таблицы */
:deep(.v-data-table tbody tr) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

/* Убираем hover эффект с кнопок действий */
:deep(.v-data-table tbody tr:hover td:last-child) {
  background-color: transparent;
}
</style>
