<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4">{{ epic.reference_id }}: {{ epic.title }}</h1>
            <div class="text-subtitle-1 text-grey-darken-1 mt-1">
              Создан {{ epic.created_at }} • Обновлен {{ epic.last_modified }}
            </div>
          </div>
          <div>
            <v-btn
              color="primary"
              prepend-icon="mdi-pencil"
              class="mr-2"
            >
              Редактировать
            </v-btn>
            <v-btn
              color="success"
              prepend-icon="mdi-plus"
            >
              Добавить историю
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Main Content -->
      <v-col cols="12" md="8">
        <!-- Epic Details -->
        <v-card class="mb-4">
          <v-card-title>Описание эпика</v-card-title>
          <v-card-text>
            <div class="mb-4">
              <strong>Статус:</strong>
              <v-chip
                :color="getStatusColor(epic.status)"
                size="small"
                class="ml-2"
              >
                {{ epic.status }}
              </v-chip>
            </div>
            
            <div class="mb-4">
              <strong>Приоритет:</strong>
              <v-chip
                :color="getPriorityColor(epic.priority)"
                size="small"
                class="ml-2"
              >
                {{ getPriorityText(epic.priority) }}
              </v-chip>
            </div>
            
            <div class="mb-4">
              <strong>Ответственный:</strong>
              {{ epic.assignee || 'Не назначен' }}
            </div>
            
            <div v-if="epic.description">
              <strong>Описание:</strong>
              <div class="mt-2" v-html="epic.description"></div>
            </div>
          </v-card-text>
        </v-card>

        <!-- User Stories -->
        <v-card>
          <v-card-title>
            Пользовательские истории
            <v-spacer />
            <v-btn
              color="primary"
              size="small"
              prepend-icon="mdi-plus"
            >
              Добавить историю
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list v-if="userStories.length > 0">
              <v-list-item
                v-for="story in userStories"
                :key="story.id"
                :to="`/user-stories/${story.id}`"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-book-open-variant</v-icon>
                </template>
                <v-list-item-title>{{ story.reference_id }}: {{ story.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ story.status }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip
                    :color="getStatusColor(story.status)"
                    size="small"
                  >
                    {{ story.status }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center text-grey-darken-1 py-4">
              Пользовательские истории не найдены
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Sidebar -->
      <v-col cols="12" md="4">
        <!-- Actions -->
        <v-card class="mb-4">
          <v-card-title>Действия</v-card-title>
          <v-card-text>
            <v-btn
              block
              color="primary"
              class="mb-2"
              prepend-icon="mdi-pencil"
            >
              Редактировать эпик
            </v-btn>
            <v-btn
              block
              color="success"
              class="mb-2"
              prepend-icon="mdi-plus"
            >
              Добавить историю
            </v-btn>
            <v-btn
              block
              color="info"
              class="mb-2"
              prepend-icon="mdi-account"
            >
              Назначить ответственного
            </v-btn>
            <v-btn
              block
              color="warning"
              class="mb-2"
              prepend-icon="mdi-swap-horizontal"
            >
              Изменить статус
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Statistics -->
        <v-card>
          <v-card-title>Статистика</v-card-title>
          <v-card-text>
            <div class="d-flex justify-space-between mb-2">
              <span>Всего историй:</span>
              <strong>{{ userStories.length }}</strong>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Завершено:</span>
              <strong>{{ userStories.filter(s => s.status === 'Done').length }}</strong>
            </div>
            <div class="d-flex justify-space-between">
              <span>В работе:</span>
              <strong>{{ userStories.filter(s => s.status === 'In Progress').length }}</strong>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Mock data - will be replaced with real API calls
const epic = ref({
  id: route.params.id,
  reference_id: 'EP-001',
  title: 'Система аутентификации',
  description: 'Реализация безопасной системы аутентификации пользователей с поддержкой JWT токенов и ролевой модели доступа.',
  status: 'In Progress',
  priority: 1,
  assignee: 'Иван Иванов',
  created_at: '2024-01-15',
  last_modified: '2024-01-20'
})

const userStories = ref([
  {
    id: '1',
    reference_id: 'US-001',
    title: 'Вход в систему',
    status: 'Done'
  },
  {
    id: '2',
    reference_id: 'US-002',
    title: 'Регистрация пользователя',
    status: 'In Progress'
  },
  {
    id: '3',
    reference_id: 'US-003',
    title: 'Восстановление пароля',
    status: 'Draft'
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