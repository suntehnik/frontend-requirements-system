<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">Эпики</h1>
          <v-btn color="primary" prepend-icon="mdi-plus">
            Создать эпик
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Поиск эпиков"
              single-line
              hide-details
              variant="outlined"
              density="compact"
            />
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="epics"
            :search="search"
            class="elevation-1"
          >
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
                :to="`/epics/${item.id}`"
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
import { ref } from 'vue'

const search = ref('')

const headers = [
  { title: 'ID', key: 'reference_id', sortable: true },
  { title: 'Название', key: 'title', sortable: true },
  { title: 'Статус', key: 'status', sortable: true },
  { title: 'Приоритет', key: 'priority', sortable: true },
  { title: 'Ответственный', key: 'assignee', sortable: true },
  { title: 'Создан', key: 'created_at', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

// Mock data - will be replaced with real API calls
const epics = ref([
  {
    id: '1',
    reference_id: 'EP-001',
    title: 'Система аутентификации',
    status: 'In Progress',
    priority: 1,
    assignee: 'Иван Иванов',
    created_at: '2024-01-15'
  },
  {
    id: '2',
    reference_id: 'EP-002',
    title: 'Управление требованиями',
    status: 'Draft',
    priority: 2,
    assignee: 'Петр Петров',
    created_at: '2024-01-16'
  }
])

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