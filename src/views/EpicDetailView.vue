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
        <v-btn @click="loadEpic" variant="text" size="small">Повторить</v-btn>
      </template>
    </v-alert>

    <!-- Content -->
    <div v-else-if="epic">
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <h1 class="text-h4">{{ epic.reference_id }}: {{ epic.title }}</h1>
              <div class="text-subtitle-1 text-grey-darken-1 mt-1">
                Создан {{ formatDate(epic.created_at) }} • Обновлен {{ formatDate(epic.last_modified) }}
              </div>
            </div>
            <div>
              <v-btn 
                color="primary" 
                prepend-icon="mdi-pencil" 
                class="mr-2"
                @click="editEpic"
              > 
                Редактировать 
              </v-btn>
              <v-btn 
                color="success" 
                prepend-icon="mdi-plus"
                @click="addUserStory"
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
              <v-chip :color="getStatusColor(epic.status)" size="small" class="ml-2">
                {{ epic.status }}
              </v-chip>
            </div>

            <div class="mb-4">
              <strong>Приоритет:</strong>
              <v-chip :color="getPriorityColor(epic.priority)" size="small" class="ml-2">
                {{ getPriorityText(epic.priority) }}
              </v-chip>
            </div>

            <div class="mb-4">
              <strong>Ответственный:</strong>
              {{ epic.assignee?.username || 'Не назначен' }}
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
              @click="addUserStory"
            > 
              Добавить историю 
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="userStoriesLoading" class="text-center py-4">
              <v-progress-circular indeterminate size="32" color="primary" />
            </div>
            <v-list v-else-if="userStories && userStories.length > 0">
              <v-list-item
                v-for="story in userStories"
                :key="story.id"
                :to="`/user-stories/${story.id}`"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-book-open-variant</v-icon>
                </template>
                <v-list-item-title>{{ story.reference_id }}: {{ story.title }}</v-list-item-title>
                <v-list-item-subtitle>
                  Создан {{ formatDate(story.created_at) }}
                  <span v-if="story.assignee"> • {{ story.assignee.username }}</span>
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip :color="getStatusColor(story.status)" size="small">
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
              @click="editEpic"
              :disabled="actionLoading"
            >
              Редактировать эпик
            </v-btn>
            <v-btn 
              block 
              color="success" 
              class="mb-2" 
              prepend-icon="mdi-plus"
              @click="addUserStory"
              :disabled="actionLoading"
            >
              Добавить историю
            </v-btn>
            <v-btn 
              block 
              color="info" 
              class="mb-2" 
              prepend-icon="mdi-account"
              @click="assignUser"
              :disabled="actionLoading"
            >
              Назначить ответственного
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
              <span>Всего историй:</span>
              <strong>{{ userStories?.length || 0 }}</strong>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Завершено:</span>
              <strong>{{ userStories?.filter((s) => s.status === 'Done').length || 0 }}</strong>
            </div>
            <div class="d-flex justify-space-between">
              <span>В работе:</span>
              <strong>{{ userStories?.filter((s) => s.status === 'In Progress').length || 0 }}</strong>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    </div>

    <!-- Not Found State -->
    <div v-else class="text-center py-8">
      <v-icon size="64" color="grey">mdi-file-document-outline</v-icon>
      <h2 class="text-h5 mt-4 mb-2">Эпик не найден</h2>
      <p class="text-grey-darken-1">Эпик с ID {{ route.params.id }} не существует</p>
      <v-btn color="primary" @click="$router.push('/epics')">Вернуться к списку</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { epicService } from '@/services/epic-service'
import type { Epic, UserStory } from '@/types'

const route = useRoute()
const router = useRouter()

// Reactive state
const epic = ref<Epic | null>(null)
const userStories = ref<UserStory[] | null>(null)
const loading = ref(true)
const userStoriesLoading = ref(false)
const actionLoading = ref(false)
const error = ref<string | null>(null)

// Computed properties
const epicId = computed(() => route.params.id as string)

// Methods
const loadEpic = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Load epic with related data
    const epicData = await epicService.get(epicId.value, 'creator,assignee,user_stories')
    epic.value = epicData
    
    // Extract user stories from epic data or load separately
    if (epicData.user_stories) {
      userStories.value = epicData.user_stories as UserStory[]
    } else {
      await loadUserStories()
    }
  } catch (err) {
    console.error('Failed to load epic:', err)
    error.value = err instanceof Error ? err.message : 'Не удалось загрузить эпик'
  } finally {
    loading.value = false
  }
}

const loadUserStories = async () => {
  try {
    userStoriesLoading.value = true
    const epicWithStories = await epicService.getUserStories(epicId.value)
    userStories.value = (epicWithStories.user_stories as UserStory[]) || []
  } catch (err) {
    console.error('Failed to load user stories:', err)
    // Don't show error for user stories, just keep empty array
    userStories.value = []
  } finally {
    userStoriesLoading.value = false
  }
}

const editEpic = () => {
  router.push(`/epics/${epicId.value}/edit`)
}

const addUserStory = () => {
  router.push(`/epics/${epicId.value}/user-stories/new`)
}

const assignUser = () => {
  // TODO: Implement user assignment dialog
  console.log('Assign user functionality to be implemented')
}

const changeStatus = () => {
  // TODO: Implement status change dialog
  console.log('Change status functionality to be implemented')
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
  loadEpic()
})
</script>
