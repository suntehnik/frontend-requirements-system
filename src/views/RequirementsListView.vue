<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">Требования</h1>
          <v-btn color="primary" prepend-icon="mdi-plus">
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
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedUserStory"
                  :items="userStoryOptions"
                  label="Фильтр по истории"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedType"
                  :items="typeOptions"
                  label="Фильтр по типу"
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
            :items="filteredRequirements"
            :search="search"
            class="elevation-1"
          >
            <template v-slot:item.user_story="{ item }">
              <router-link :to="`/user-stories/${item.user_story_id}`" class="text-decoration-none">
                {{ item.user_story }}
              </router-link>
            </template>
            
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
              >
                {{ item.status }}
              </v-chip>
            </template>
            
            <template v-slot:item.priority="{ item }">
              <v-chip
                :color="getPriorityColor(item.priority)"
                size="small"
              >
                {{ getPriorityText(item.priority) }}
              </v-chip>
            </template>
            
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                :to="`/requirements/${item.id}`"
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
const selectedUserStory = ref('')
const selectedType = ref('')

const headers = [
  { title: 'ID', key: 'reference_id', sortable: true },
  { title: 'Название', key: 'title', sortable: true },
  { title: 'История', key: 'user_story', sortable: true },
  { title: 'Тип', key: 'type', sortable: true },
  { title: 'Статус', key: 'status', sortable: true },
  { title: 'Приоритет', key: 'priority', sortable: true },
  { title: 'Ответственный', key: 'assignee', sortable: true },
  { title: 'Создано', key: 'created_at', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

// Mock data - will be replaced with real API calls
const requirements = ref([
  {
    id: '1',
    reference_id: 'REQ-001',
    title: 'Валидация пароля',
    user_story: 'US-001: Вход в систему',
    user_story_id: '1',
    type: 'Функциональное',
    status: 'Active',
    priority: 1,
    assignee: 'Иван Иванов',
    created_at: '2024-01-15'
  },
  {
    id: '2',
    reference_id: 'REQ-002',
    title: 'JWT токен аутентификации',
    user_story: 'US-001: Вход в систему',
    user_story_id: '1',
    type: 'Техническое',
    status: 'Active',
    priority: 2,
    assignee: 'Петр Петров',
    created_at: '2024-01-16'
  },
  {
    id: '3',
    reference_id: 'REQ-003',
    title: 'Защита от брутфорса',
    user_story: 'US-001: Вход в систему',
    user_story_id: '1',
    type: 'Безопасность',
    status: 'Draft',
    priority: 3,
    assignee: 'Анна Сидорова',
    created_at: '2024-01-17'
  },
  {
    id: '4',
    reference_id: 'REQ-004',
    title: 'Форма регистрации',
    user_story: 'US-002: Регистрация пользователя',
    user_story_id: '2',
    type: 'Функциональное',
    status: 'Active',
    priority: 2,
    assignee: 'Мария Петрова',
    created_at: '2024-01-18'
  }
])

const userStoryOptions = [
  { title: 'US-001: Вход в систему', value: '1' },
  { title: 'US-002: Регистрация пользователя', value: '2' },
  { title: 'US-003: Управление профилем', value: '3' }
]

const typeOptions = [
  { title: 'Функциональное', value: 'Функциональное' },
  { title: 'Техническое', value: 'Техническое' },
  { title: 'Безопасность', value: 'Безопасность' },
  { title: 'Производительность', value: 'Производительность' }
]

const filteredRequirements = computed(() => {
  let filtered = requirements.value

  if (selectedUserStory.value) {
    filtered = filtered.filter(req => req.user_story_id === selectedUserStory.value)
  }

  if (selectedType.value) {
    filtered = filtered.filter(req => req.type === selectedType.value)
  }

  return filtered
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Draft': 'orange',
    'Active': 'green',
    'Obsolete': 'red'
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