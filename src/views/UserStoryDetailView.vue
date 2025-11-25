<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 400px">
      <v-progress-circular indeterminate size="64" color="primary" />
    </div>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" class="mb-4">
      {{ error }}
      <template v-slot:append>
        <v-btn @click="loadUserStory" variant="text" size="small">Повторить</v-btn>
      </template>
    </v-alert>

    <!-- Content -->
    <div v-else-if="userStory">
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h1 class="text-h4">{{ userStory.reference_id }}: {{ userStory.title }}</h1>
              <div class="text-subtitle-1 text-grey-darken-1 mt-1">
                Эпик:
                <router-link :to="`/epics/${userStory.epic_id}`" class="text-decoration-none">
                  {{ userStory.epic?.reference_id }}: {{ userStory.epic?.title }}
                </router-link>
              </div>
              <div class="text-subtitle-1 text-grey-darken-1">
                Создана {{ formatDate(userStory.created_at) }} • Обновлена
                {{ formatDate(userStory.updated_at) }}
              </div>
            </div>
            <div>
              <v-btn
                color="primary"
                prepend-icon="mdi-pencil"
                class="mr-2"
                @click="editUserStory"
                :disabled="actionLoading"
              >
                Редактировать
              </v-btn>
              <v-btn
                color="success"
                prepend-icon="mdi-plus"
                @click="addRequirement"
                :disabled="actionLoading"
              >
                Добавить требование
              </v-btn>
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
                {{ userStory.assignee?.username || 'Не назначен' }}
              </div>

              <div v-if="userStory.description">
                <strong>Описание:</strong>
                <div class="mt-2" v-html="userStory.description"></div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Requirements -->
          <v-card class="mb-4">
            <v-card-title>
              Требования
              <v-spacer />
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-plus"
                @click="addRequirement"
                :disabled="actionLoading"
              >
                Добавить требование
              </v-btn>
            </v-card-title>
            <v-card-text>
              <div v-if="requirementsLoading" class="text-center py-4">
                <v-progress-circular indeterminate size="32" color="primary" />
              </div>
              <v-list v-else-if="requirements && requirements.length > 0">
                <v-list-item
                  v-for="requirement in requirements"
                  :key="requirement.id"
                  :to="`/requirements/${requirement.id}`"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-file-document</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ requirement.reference_id }}: {{ requirement.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ requirement.type?.name || 'Неизвестный тип' }} • Создано
                    {{ formatDate(requirement.created_at) }}
                    <span v-if="requirement.assignee"> • {{ requirement.assignee.username }}</span>
                  </v-list-item-subtitle>
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

          <!-- Acceptance Criteria -->
          <v-card>
            <v-card-title>
              Критерии приемки
              <v-spacer />
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-plus"
                @click="addAcceptanceCriteria"
                :disabled="actionLoading"
              >
                Добавить критерий
              </v-btn>
            </v-card-title>
            <v-card-text>
              <div v-if="acceptanceCriteriaLoading" class="text-center py-4">
                <v-progress-circular indeterminate size="32" color="primary" />
              </div>
              <v-list v-else-if="acceptanceCriteria && acceptanceCriteria.length > 0">
                <v-list-item v-for="criteria in acceptanceCriteria" :key="criteria.id">
                  <template v-slot:prepend>
                    <v-icon>mdi-check-circle-outline</v-icon>
                  </template>
                  <v-list-item-title>{{ criteria.reference_id }}</v-list-item-title>
                  <v-list-item-subtitle>{{ criteria.description }}</v-list-item-subtitle>
                  <template v-slot:append>
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editAcceptanceCriteria(criteria.id)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deleteAcceptanceCriteria(criteria.id)"
                    />
                  </template>
                </v-list-item>
              </v-list>
              <div v-else class="text-center text-grey-darken-1 py-4">
                Критерии приемки не найдены
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
                @click="editUserStory"
                :disabled="actionLoading"
              >
                Редактировать историю
              </v-btn>
              <v-btn
                block
                color="info"
                class="mb-2"
                prepend-icon="mdi-plus"
                @click="addRequirement"
                :disabled="actionLoading"
              >
                Добавить требование
              </v-btn>
              <v-btn
                block
                color="success"
                class="mb-2"
                prepend-icon="mdi-plus"
                @click="addAcceptanceCriteria"
                :disabled="actionLoading"
              >
                Добавить критерий
              </v-btn>
              <v-btn
                block
                color="warning"
                class="mb-2"
                prepend-icon="mdi-swap-horizontal"
                @click="changeStatus"
                :disabled="actionLoading"
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
                <span>Требований:</span>
                <strong>{{ Array.isArray(requirements) ? requirements.length : 0 }}</strong>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span>Критериев приемки:</span>
                <strong>{{
                  Array.isArray(acceptanceCriteria) ? acceptanceCriteria.length : 0
                }}</strong>
              </div>
              <div class="d-flex justify-space-between">
                <span>Активных требований:</span>
                <strong>{{
                  (Array.isArray(requirements)
                    ? requirements.filter((r) => r.status === 'Active')
                    : []
                  ).length
                }}</strong>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Not Found State -->
    <div v-else class="text-center py-8">
      <v-icon size="64" color="grey">mdi-book-open-variant</v-icon>
      <h2 class="text-h5 mt-4 mb-2">Пользовательская история не найдена</h2>
      <p class="text-grey-darken-1">История с ID {{ route.params.id }} не существует</p>
      <v-btn color="primary" @click="$router.push('/user-stories')">Вернуться к списку</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userStoryService } from '@/services/user-story-service'
import { useEntitiesStore } from '@/stores/entities'
import type { UserStory, AcceptanceCriteria, Requirement, UserStoryStatus } from '@/types'

const route = useRoute()
const router = useRouter()
const entitiesStore = useEntitiesStore()

// Reactive state
const userStory = ref<UserStory | null>(null)
const acceptanceCriteria = ref<AcceptanceCriteria[] | null>(null)
const requirements = ref<Requirement[] | null>(null)
const loading = ref(true)
const acceptanceCriteriaLoading = ref(false)
const requirementsLoading = ref(false)
const actionLoading = ref(false)
const error = ref<string | null>(null)

// Computed properties
const userStoryId = computed(() => route.params.id as string)

// Methods
const loadUserStory = async () => {
  try {
    loading.value = true
    error.value = null

    // Load user story basic data
    const userStoryData = await userStoryService.get(userStoryId.value)
    userStory.value = userStoryData

    // Load acceptance criteria and requirements separately
    await Promise.all([loadAcceptanceCriteria(), loadRequirements()])
  } catch (err) {
    console.error('Failed to load user story:', err)
    error.value =
      err instanceof Error ? err.message : 'Не удалось загрузить пользовательскую историю'
  } finally {
    loading.value = false
  }
}

const loadAcceptanceCriteria = async () => {
  try {
    acceptanceCriteriaLoading.value = true
    acceptanceCriteria.value = await userStoryService.getAcceptanceCriteria(userStoryId.value)
  } catch (err) {
    console.error('Failed to load acceptance criteria:', err)
    // Don't show error for acceptance criteria, just keep empty array
    acceptanceCriteria.value = []
  } finally {
    acceptanceCriteriaLoading.value = false
  }
}

const loadRequirements = async () => {
  try {
    requirementsLoading.value = true
    requirements.value = await userStoryService.getRequirements(userStoryId.value)
  } catch (err) {
    console.error('Failed to load requirements:', err)
    // Don't show error for requirements, just keep empty array
    requirements.value = []
  } finally {
    requirementsLoading.value = false
  }
}

const editUserStory = () => {
  router.push(`/user-stories/${userStoryId.value}/edit`)
}

const addAcceptanceCriteria = () => {
  router.push(`/user-stories/${userStoryId.value}/acceptance-criteria/new`)
}

const addRequirement = () => {
  router.push(`/user-stories/${userStoryId.value}/requirements/new`)
}

const editAcceptanceCriteria = (criteriaId: string) => {
  router.push(`/acceptance-criteria/${criteriaId}/edit`)
}

const deleteAcceptanceCriteria = (criteriaId: string) => {
  // TODO: Implement delete confirmation dialog
  console.log('Delete acceptance criteria:', criteriaId)
}

const changeStatus = async () => {
  if (!userStory.value) return
  
  try {
    actionLoading.value = true
    
    // For now, let's cycle through statuses as a demo
    const statuses = ['Backlog', 'Draft', 'In Progress', 'Done', 'Cancelled']
    const currentIndex = statuses.indexOf(userStory.value.status)
    const nextStatus = statuses[(currentIndex + 1) % statuses.length]
    
    // Update the user story status via store (which will update both local and global state)
    const updatedStory = await entitiesStore.changeUserStoryStatus(userStoryId.value, nextStatus as UserStoryStatus)
    
    // Update local state
    userStory.value = updatedStory
    
    console.log(`Status changed from ${userStory.value.status} to ${nextStatus}`)
  } catch (err) {
    console.error('Failed to change status:', err)
    error.value = err instanceof Error ? err.message : 'Не удалось изменить статус'
  } finally {
    actionLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

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

// Lifecycle
onMounted(() => {
  loadUserStory()
})
</script>
