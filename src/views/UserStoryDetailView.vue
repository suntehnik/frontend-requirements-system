<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4">{{ userStory.reference_id }}: {{ userStory.title }}</h1>
            <div class="text-subtitle-1 text-grey-darken-1 mt-1">
              Эпик:
              <router-link :to="`/epics/${userStory.epic_id}`" class="text-decoration-none">{{
                userStory.epic
              }}</router-link>
            </div>
            <div class="text-subtitle-1 text-grey-darken-1">
              Создана {{ userStory.created_at }} • Обновлена {{ userStory.last_modified }}
            </div>
          </div>
          <div>
            <v-btn color="primary" prepend-icon="mdi-pencil" class="mr-2"> Редактировать </v-btn>
            <v-btn color="success" prepend-icon="mdi-plus"> Добавить требование </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Main Content -->
      <v-col cols="12" md="8">
        <!-- User Story Details -->
        <v-card class="mb-4">
          <v-card-title>Описание истории</v-card-title>
          <v-card-text>
            <div class="mb-4">
              <strong>Статус:</strong>
              <v-chip :color="getStatusColor(userStory.status)" size="small" class="ml-2">
                {{ userStory.status }}
              </v-chip>
            </div>

            <div class="mb-4">
              <strong>Приоритет:</strong>
              <v-chip :color="getPriorityColor(userStory.priority)" size="small" class="ml-2">
                {{ getPriorityText(userStory.priority) }}
              </v-chip>
            </div>

            <div class="mb-4">
              <strong>Ответственный:</strong>
              {{ userStory.assignee || 'Не назначен' }}
            </div>

            <div v-if="userStory.description">
              <strong>Описание:</strong>
              <div class="mt-2" v-html="userStory.description"></div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Acceptance Criteria -->
        <v-card class="mb-4">
          <v-card-title>
            Критерии приемки
            <v-spacer />
            <v-btn color="primary" size="small" prepend-icon="mdi-plus"> Добавить критерий </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list v-if="acceptanceCriteria.length > 0">
              <v-list-item v-for="criteria in acceptanceCriteria" :key="criteria.id">
                <template v-slot:prepend>
                  <v-icon>mdi-check-circle-outline</v-icon>
                </template>
                <v-list-item-title>{{ criteria.reference_id }}</v-list-item-title>
                <v-list-item-subtitle>{{ criteria.description }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn icon="mdi-pencil" size="small" variant="text" />
                  <v-btn icon="mdi-delete" size="small" variant="text" color="error" />
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center text-grey-darken-1 py-4">
              Критерии приемки не найдены
            </div>
          </v-card-text>
        </v-card>

        <!-- Requirements -->
        <v-card>
          <v-card-title>
            Требования
            <v-spacer />
            <v-btn color="primary" size="small" prepend-icon="mdi-plus">
              Добавить требование
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list v-if="requirements.length > 0">
              <v-list-item
                v-for="requirement in requirements"
                :key="requirement.id"
                :to="`/requirements/${requirement.id}`"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-file-document</v-icon>
                </template>
                <v-list-item-title
                  >{{ requirement.reference_id }}: {{ requirement.title }}</v-list-item-title
                >
                <v-list-item-subtitle
                  >{{ requirement.type }} • {{ requirement.status }}</v-list-item-subtitle
                >
                <template v-slot:append>
                  <v-chip :color="getStatusColor(requirement.status)" size="small">
                    {{ requirement.status }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center text-grey-darken-1 py-4">Требования не найдены</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Sidebar -->
      <v-col cols="12" md="4">
        <!-- Actions -->
        <v-card class="mb-4">
          <v-card-title>Действия</v-card-title>
          <v-card-text>
            <v-btn block color="primary" class="mb-2" prepend-icon="mdi-pencil">
              Редактировать историю
            </v-btn>
            <v-btn block color="success" class="mb-2" prepend-icon="mdi-plus">
              Добавить критерий
            </v-btn>
            <v-btn block color="info" class="mb-2" prepend-icon="mdi-plus">
              Добавить требование
            </v-btn>
            <v-btn block color="warning" class="mb-2" prepend-icon="mdi-swap-horizontal">
              Изменить статус
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Statistics -->
        <v-card>
          <v-card-title>Статистика</v-card-title>
          <v-card-text>
            <div class="d-flex justify-space-between mb-2">
              <span>Критериев приемки:</span>
              <strong>{{ acceptanceCriteria.length }}</strong>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Требований:</span>
              <strong>{{ requirements.length }}</strong>
            </div>
            <div class="d-flex justify-space-between">
              <span>Активных требований:</span>
              <strong>{{ requirements.filter((r) => r.status === 'Active').length }}</strong>
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
const userStory = ref({
  id: route.params.id,
  reference_id: 'US-001',
  title: 'Вход в систему',
  description:
    'Как пользователь, я хочу войти в систему, чтобы получить доступ к функциональности управления требованиями.',
  epic: 'EP-001: Система аутентификации',
  epic_id: '1',
  status: 'In Progress',
  priority: 1,
  assignee: 'Иван Иванов',
  created_at: '2024-01-15',
  last_modified: '2024-01-20',
})

const acceptanceCriteria = ref([
  {
    id: '1',
    reference_id: 'AC-001',
    description: 'Пользователь может ввести логин и пароль',
  },
  {
    id: '2',
    reference_id: 'AC-002',
    description: 'Система проверяет корректность учетных данных',
  },
  {
    id: '3',
    reference_id: 'AC-003',
    description: 'При успешной аутентификации пользователь перенаправляется на главную страницу',
  },
])

const requirements = ref([
  {
    id: '1',
    reference_id: 'REQ-001',
    title: 'Валидация пароля',
    type: 'Функциональное',
    status: 'Active',
  },
  {
    id: '2',
    reference_id: 'REQ-002',
    title: 'JWT токен аутентификации',
    type: 'Техническое',
    status: 'Active',
  },
  {
    id: '3',
    reference_id: 'REQ-003',
    title: 'Защита от брутфорса',
    type: 'Безопасность',
    status: 'Draft',
  },
])

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Backlog: 'grey',
    Draft: 'orange',
    'In Progress': 'blue',
    Done: 'green',
    Cancelled: 'red',
    Active: 'green',
    Obsolete: 'red',
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
</script>
