<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4">{{ requirement.reference_id }}: {{ requirement.title }}</h1>
            <div class="text-subtitle-1 text-grey-darken-1 mt-1">
              История:
              <router-link
                :to="`/user-stories/${requirement.user_story_id}`"
                class="text-decoration-none"
                >{{ requirement.user_story }}</router-link
              >
            </div>
            <div class="text-subtitle-1 text-grey-darken-1">
              Создано {{ requirement.created_at }} • Обновлено {{ requirement.last_modified }}
            </div>
          </div>
          <div>
            <v-btn color="primary" prepend-icon="mdi-pencil" class="mr-2"> Редактировать </v-btn>
            <v-btn color="success" prepend-icon="mdi-link"> Добавить связь </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Main Content -->
      <v-col cols="12" md="8">
        <!-- Requirement Details -->
        <v-card class="mb-4">
          <v-card-title>Описание требования</v-card-title>
          <v-card-text>
            <div class="mb-4">
              <strong>Тип:</strong>
              <v-chip size="small" class="ml-2">
                {{ requirement.type }}
              </v-chip>
            </div>

            <div class="mb-4">
              <strong>Статус:</strong>
              <v-chip :color="getStatusColor(requirement.status)" size="small" class="ml-2">
                {{ requirement.status }}
              </v-chip>
            </div>

            <div class="mb-4">
              <strong>Приоритет:</strong>
              <v-chip :color="getPriorityColor(requirement.priority)" size="small" class="ml-2">
                {{ getPriorityText(requirement.priority) }}
              </v-chip>
            </div>

            <div class="mb-4">
              <strong>Ответственный:</strong>
              {{ requirement.assignee || 'Не назначен' }}
            </div>

            <div v-if="requirement.description">
              <strong>Описание:</strong>
              <div class="mt-2" v-html="requirement.description"></div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Relationships -->
        <v-card class="mb-4">
          <v-card-title>
            Связи с другими требованиями
            <v-spacer />
            <v-btn color="primary" size="small" prepend-icon="mdi-plus"> Добавить связь </v-btn>
          </v-card-title>
          <v-card-text>
            <v-tabs v-model="relationshipTab">
              <v-tab value="outgoing">Исходящие связи</v-tab>
              <v-tab value="incoming">Входящие связи</v-tab>
            </v-tabs>

            <v-tabs-window v-model="relationshipTab">
              <v-tabs-window-item value="outgoing">
                <v-list v-if="outgoingRelationships.length > 0">
                  <v-list-item
                    v-for="rel in outgoingRelationships"
                    :key="rel.id"
                    :to="`/requirements/${rel.target_id}`"
                  >
                    <template v-slot:prepend>
                      <v-icon>mdi-arrow-right</v-icon>
                    </template>
                    <v-list-item-title
                      >{{ rel.target_reference }}: {{ rel.target_title }}</v-list-item-title
                    >
                    <v-list-item-subtitle>{{ rel.relationship_type }}</v-list-item-subtitle>
                    <template v-slot:append>
                      <v-btn icon="mdi-delete" size="small" variant="text" color="error" />
                    </template>
                  </v-list-item>
                </v-list>
                <div v-else class="text-center text-grey-darken-1 py-4">
                  Исходящие связи не найдены
                </div>
              </v-tabs-window-item>

              <v-tabs-window-item value="incoming">
                <v-list v-if="incomingRelationships.length > 0">
                  <v-list-item
                    v-for="rel in incomingRelationships"
                    :key="rel.id"
                    :to="`/requirements/${rel.source_id}`"
                  >
                    <template v-slot:prepend>
                      <v-icon>mdi-arrow-left</v-icon>
                    </template>
                    <v-list-item-title
                      >{{ rel.source_reference }}: {{ rel.source_title }}</v-list-item-title
                    >
                    <v-list-item-subtitle>{{ rel.relationship_type }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <div v-else class="text-center text-grey-darken-1 py-4">
                  Входящие связи не найдены
                </div>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>

        <!-- Relationship Graph -->
        <v-card>
          <v-card-title>Граф связей</v-card-title>
          <v-card-text>
            <div class="text-center text-grey-darken-1 py-8">
              <v-icon size="64" class="mb-4">mdi-graph</v-icon>
              <div>Визуализация связей будет реализована позже</div>
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
            <v-btn block color="primary" class="mb-2" prepend-icon="mdi-pencil">
              Редактировать требование
            </v-btn>
            <v-btn block color="success" class="mb-2" prepend-icon="mdi-link">
              Добавить связь
            </v-btn>
            <v-btn block color="info" class="mb-2" prepend-icon="mdi-account">
              Назначить ответственного
            </v-btn>
            <v-btn block color="warning" class="mb-2" prepend-icon="mdi-swap-horizontal">
              Изменить статус
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Statistics -->
        <v-card class="mb-4">
          <v-card-title>Статистика связей</v-card-title>
          <v-card-text>
            <div class="d-flex justify-space-between mb-2">
              <span>Исходящие связи:</span>
              <strong>{{ outgoingRelationships.length }}</strong>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Входящие связи:</span>
              <strong>{{ incomingRelationships.length }}</strong>
            </div>
            <div class="d-flex justify-space-between">
              <span>Всего связей:</span>
              <strong>{{ outgoingRelationships.length + incomingRelationships.length }}</strong>
            </div>
          </v-card-text>
        </v-card>

        <!-- Hierarchy -->
        <v-card>
          <v-card-title>Иерархия</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item :to="`/epics/${requirement.epic_id}`">
                <template v-slot:prepend>
                  <v-icon>mdi-folder</v-icon>
                </template>
                <v-list-item-title>{{ requirement.epic }}</v-list-item-title>
              </v-list-item>
              <v-list-item :to="`/user-stories/${requirement.user_story_id}`">
                <template v-slot:prepend>
                  <v-icon>mdi-book-open-variant</v-icon>
                </template>
                <v-list-item-title>{{ requirement.user_story }}</v-list-item-title>
              </v-list-item>
              <v-list-item disabled>
                <template v-slot:prepend>
                  <v-icon>mdi-file-document</v-icon>
                </template>
                <v-list-item-title
                  >{{ requirement.reference_id }}: {{ requirement.title }}</v-list-item-title
                >
              </v-list-item>
            </v-list>
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
const relationshipTab = ref('outgoing')

// Mock data - will be replaced with real API calls
const requirement = ref({
  id: route.params.id,
  reference_id: 'REQ-001',
  title: 'Валидация пароля',
  description:
    'Система должна проверять пароль пользователя согласно политике безопасности: минимум 8 символов, содержать буквы и цифры.',
  type: 'Функциональное',
  status: 'Active',
  priority: 1,
  assignee: 'Иван Иванов',
  user_story: 'US-001: Вход в систему',
  user_story_id: '1',
  epic: 'EP-001: Система аутентификации',
  epic_id: '1',
  created_at: '2024-01-15',
  last_modified: '2024-01-20',
})

const outgoingRelationships = ref([
  {
    id: '1',
    target_id: '2',
    target_reference: 'REQ-002',
    target_title: 'JWT токен аутентификации',
    relationship_type: 'Зависит от',
  },
  {
    id: '2',
    target_id: '3',
    target_reference: 'REQ-003',
    target_title: 'Защита от брутфорса',
    relationship_type: 'Связано с',
  },
])

const incomingRelationships = ref([
  {
    id: '3',
    source_id: '4',
    source_reference: 'REQ-004',
    source_title: 'Форма регистрации',
    relationship_type: 'Использует',
  },
])

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Draft: 'orange',
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
