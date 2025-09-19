<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">Пользовательские истории</h1>
          <v-btn color="primary" prepend-icon="mdi-plus">
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
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Поиск историй"
                  single-line
                  hide-details
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedEpic"
                  :items="epicOptions"
                  label="Фильтр по эпику"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </v-col>
            </v-row>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="filteredUserStories"
            :search="search"
            class="elevation-1"
          >
            <template v-slot:[`item.epic`]="{ item }">
              <router-link :to="`/epics/${item.epic_id}`" class="text-decoration-none">
                {{ item.epic }}
              </router-link>
            </template>
            
            <template v-slot:[`item.status`]="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
              >
                {{ item.status }}
              </v-chip>
            </template>
            
            <template v-slot:[`item.priority`]="{ item }">
              <v-chip
                :color="getPriorityColor(item.priority)"
                size="small"
              >
                {{ getPriorityText(item.priority) }}
              </v-chip>
            </template>
            
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                :to="`/user-stories/${item.id}`"
              />
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const search = ref('')
const selectedEpic = ref('')

const headers = [
  { title: 'ID', key: 'reference_id', sortable: true },
  { title: 'Название', key: 'title', sortable: true },
  { title: 'Эпик', key: 'epic', sortable: true },
  { title: 'Статус', key: 'status', sortable: true },
  { title: 'Приоритет', key: 'priority', sortable: true },
  { title: 'Ответственный', key: 'assignee', sortable: true },
  { title: 'Создана', key: 'created_at', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

// Mock data - will be replaced with real API calls
const userStories = ref([
  {
    id: '1',
    reference_id: 'US-001',
    title: 'Вход в систему',
    epic: 'EP-001: Система аутентификации',
    epic_id: '1',
    status: 'Done',
    priority: 1,
    assignee: 'Иван Иванов',
    created_at: '2024-01-15'
  },
  {
    id: '2',
    reference_id: 'US-002',
    title: 'Регистрация пользователя',
    epic: 'EP-001: Система аутентификации',
    epic_id: '1',
    status: 'In Progress',
    priority: 2,
    assignee: 'Петр Петров',
    created_at: '2024-01-16'
  },
  {
    id: '3',
    reference_id: 'US-003',
    title: 'Управление профилем',
    epic: 'EP-002: Управление требованиями',
    epic_id: '2',
    status: 'Draft',
    priority: 3,
    assignee: 'Анна Сидорова',
    created_at: '2024-01-17'
  }
])

const epicOptions = [
  { title: 'EP-001: Система аутентификации', value: '1' },
  { title: 'EP-002: Управление требованиями', value: '2' }
]

const filteredUserStories = computed(() => {
  if (!selectedEpic.value) {
    return userStories.value
  }
  return userStories.value.filter(story => story.epic_id === selectedEpic.value)
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Backlog': 'grey',
    'Draft': 'orange',
    'In Progress': 'blue',
    'Done': 'green',
    'Cancelled': 'red'
  }
  return colors[status] || 'grey'
}

const getPriorityColor = (priority: number) => {
  const colors: Record<number, string> = {
    1: 'red',
    2: 'orange',
    3: 'yellow',
    4: 'green'
  }
  return colors[priority] || 'grey'
}

const getPriorityText = (priority: number) => {
  const texts: Record<number, string> = {
    1: 'Критический',
    2: 'Высокий',
    3: 'Средний',
    4: 'Низкий'
  }
  return texts[priority] || 'Неизвестно'
}
</script>