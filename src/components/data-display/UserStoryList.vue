<template>
  <div>
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Пользовательские истории</h1>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="handleCreateUserStory" :disabled="loading">
          Создать историю
        </v-btn>
      </div>
    </div>

    <!-- Filters -->
    <v-row>
      <v-col cols="12" md="3">
        <v-select v-model="filters.status" :items="statusOptions" label="Статус" variant="outlined" density="compact"
          clearable @update:model-value="applyFilters" />
      </v-col>
      <v-col cols="12" md="3">
        <v-select v-model="filters.priority" :items="priorityOptions" label="Приоритет" variant="outlined"
          density="compact" clearable @update:model-value="applyFilters" />
      </v-col>
      <v-col cols="12" md="3">
        <v-select v-model="filters.epic_id" :items="epicOptions" label="Эпик" variant="outlined" density="compact"
          clearable @update:model-value="applyFilters" />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Поиск пользовательских историй" single-line
          hide-details variant="outlined" density="compact" clearable @update:model-value="handleSearchChange" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-data-table-server :headers="headers" :items="userStories" :loading="loading" class="elevation-1"
            :items-per-page="pageSize" :items-per-page-options="pageSizeOptions" :page="currentPage" :sort-by="sortBy"
            @update:options="handleOptionsChange" @click:row="handleRowClick" :items-length="totalCount"
            :multi-sort="false" :must-sort="false" :hide-default-footer="!shouldShowPagination">
            <!-- Table content templates -->
            <template v-slot:[`item.epic`]="{ item }">
              <v-btn v-if="item.epic" variant="text" size="small" color="primary"
                @click="handleEpicClick($event, item.epic)">
                {{ item.epic.reference_id }}
              </v-btn>
              <span v-else class="text-grey">Не указан</span>
            </template>

            <template v-slot:[`item.status`]="{ item }">
              <div @click.stop>
                <WorkflowStatusChip :status="item.status" size="medium"
                  @status-change="(newStatus) => handleStatusChange(item, newStatus)" />
              </div>
            </template>

            <template v-slot:[`item.priority`]="{ item }">
              <PriorityChip :priority="item.priority" size="medium" readonly />
            </template>

            <template v-slot:[`item.assignee`]="{ item }">
              <span v-if="item.assignee">{{ item.assignee.username }}</span>
              <span v-else class="text-grey">Не назначен</span>
            </template>

            <template v-slot:[`item.actions`]="{ item }">
              <v-btn icon="mdi-delete" size="small" variant="text" color="error"
                @click="handleDeleteClick($event, item)" title="Удалить" />
            </template>

            <template v-slot:no-data>
              <div class="text-center pa-8">
                <!-- Empty state for filtered results -->
                <div v-if="search || hasActiveFilters">
                  <v-icon size="64" color="grey-lighten-1">mdi-filter-remove-outline</v-icon>
                  <p class="text-h6 mt-4 mb-2">Пользовательские истории не найдены</p>
                  <p class="text-body-2 text-grey mb-4">
                    По вашим критериям поиска ничего не найдено.
                  </p>
                  <v-btn variant="outlined" color="primary" @click="clearFiltersAndSearch"
                    prepend-icon="mdi-filter-off">
                    Очистить фильтры
                  </v-btn>
                </div>

                <!-- Empty state for no user stories at all -->
                <div v-else>
                  <v-icon size="64" color="grey-lighten-1">mdi-book-open-outline</v-icon>
                  <p class="text-h6 mt-4 mb-2">Пока нет пользовательских историй</p>
                  <p class="text-body-2 text-grey mb-6">
                    Создайте первую пользовательскую историю, чтобы начать детализацию требований.
                    Пользовательские истории помогают описать функциональность с точки зрения
                    пользователя.
                  </p>
                  <v-btn variant="elevated" color="primary" size="large" @click="handleCreateUserStory"
                    prepend-icon="mdi-plus">
                    Создать первую пользовательскую историю
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
import type {
  UserStory,
  UserStoryListProps,
  UserStoryListEmits,
  UserStoryFilterState,
  DataTableOptions,
  SortItem,
  TableHeader,
  FilterOption,
  UserStoryStatus,
} from '@/types'
import type { BaseEpic } from '@/types/base-entities'
import WorkflowStatusChip from '@/components/data-display/WorkflowStatusChip.vue'
import PriorityChip from '@/components/data-display/PriorityChip.vue'

const props = withDefaults(defineProps<UserStoryListProps>(), {
  loading: false,
  totalCount: 0,
  currentPage: 1,
  pageSize: 25,
  epics: () => [],
})

const emit = defineEmits<UserStoryListEmits>()

// Router
const router = useRouter()

// State
const search = ref('')
const filters = ref<UserStoryFilterState>({})
const sortBy = ref<SortItem[]>([])

// Table configuration
const headers: TableHeader[] = [
  { title: 'ID', key: 'reference_id', sortable: true },
  { title: 'Название', key: 'title', sortable: true },
  { title: 'Эпик', key: 'epic', sortable: true, class: 'd-none d-md-table-cell' },
  { title: 'Статус', key: 'status', sortable: true, class: 'd-none d-md-table-cell' },
  { title: 'Приоритет', key: 'priority', sortable: true, class: 'd-none d-lg-table-cell' },
  { title: 'Ответственный', key: 'assignee', sortable: true, class: 'd-none d-lg-table-cell' },
  { title: '', key: 'actions', sortable: false },
]

// Filter options
const statusOptions: FilterOption[] = [
  { title: 'Бэклог', value: 'Backlog' },
  { title: 'Черновик', value: 'Draft' },
  { title: 'В работе', value: 'In Progress' },
  { title: 'Выполнено', value: 'Done' },
  { title: 'Отменено', value: 'Cancelled' },
]

const priorityOptions: FilterOption[] = [
  { title: 'Критический', value: 1 },
  { title: 'Высокий', value: 2 },
  { title: 'Средний', value: 3 },
  { title: 'Низкий', value: 4 },
]

// Epic options for filtering
const epicOptions = computed(() => {
  return props.epics.map((epic) => ({
    title: `${epic.reference_id} - ${epic.title}`,
    value: epic.id,
  }))
})

// Computed
const hasActiveFilters = computed(() => {
  return Boolean(filters.value.status || filters.value.priority || filters.value.epic_id)
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

const handleRowClick = (_event: Event, { item }: { item: UserStory }) => {
  router.push(`/user-stories/${item.reference_id}`)
}

const handleEpicClick = (event: Event, epic: BaseEpic) => {
  event.stopPropagation() // Prevent row click event
  router.push(`/epics/${epic.reference_id}`)
}

const handleDeleteClick = (event: Event, item: UserStory) => {
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

const handleCreateUserStory = () => {
  emit('create')
}

const handleStatusChange = (item: UserStory, newStatus: UserStoryStatus) => {
  emit('status-change', item, newStatus)
}
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.page-header h1 {
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.2;
}

/* Responsive design using Vuetify classes */
.v-data-table {
  overflow-x: auto;
}

/* Truncate long titles */
:deep(.v-data-table td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* Title column should be wider */
:deep(.v-data-table td:nth-child(2)) {
  max-width: 300px;
}

/* Hover effect for table rows */
:deep(.v-data-table tbody tr) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

/* Remove hover effect from action buttons */
:deep(.v-data-table tbody tr:hover td:last-child) {
  background-color: transparent;
}
</style>
