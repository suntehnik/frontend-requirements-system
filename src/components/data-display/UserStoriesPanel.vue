<template>
  <v-card flat outlined>
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-h6">Пользовательские истории</span>
      <v-btn color="primary" size="small" prepend-icon="mdi-plus" @click="$emit('add-user-story')">
        Добавить историю
      </v-btn>
    </v-card-title>
    <v-card-text>
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate size="32" color="primary" />
      </div>

      <!-- User Stories List -->
      <v-list v-else-if="userStories && userStories.length > 0" class="pa-0">
        <v-list-item
          v-for="story in userStories"
          :key="story.id"
          :to="`/user-stories/${story.reference_id}`"
          class="px-0 py-2"
          rounded
        >
          <template v-slot:prepend>
            <v-icon color="primary" class="mr-3">mdi-book-open-variant</v-icon>
          </template>

          <v-list-item-title class="text-body-1 font-weight-medium mb-1">
            {{ story.reference_id }}: {{ story.title }}
          </v-list-item-title>

          <v-list-item-subtitle>
            <div class="d-flex align-center gap-3 flex-wrap">
              <v-chip :color="getStatusColor(story.status)" size="x-small" variant="flat">
                {{ getStatusText(story.status) }}
              </v-chip>

              <v-chip :color="getPriorityColor(story.priority)" size="x-small" variant="outlined">
                {{ getPriorityText(story.priority) }}
              </v-chip>

              <span v-if="story.assignee" class="text-caption text-grey-darken-1">
                <v-icon size="12" class="mr-1">mdi-account</v-icon>
                {{ story.assignee.username }}
              </span>
              <span v-else class="text-caption text-grey-darken-1">
                <v-icon size="12" class="mr-1">mdi-account-outline</v-icon>
                Не назначен
              </span>
            </div>
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-icon color="grey-lighten-1">mdi-chevron-right</v-icon>
          </template>
        </v-list-item>
      </v-list>

      <!-- Empty State -->
      <div v-else class="text-center text-grey-darken-1 py-8">
        <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-book-open-variant</v-icon>
        <div class="text-body-1 mb-2">Пользовательские истории не найдены</div>
        <div class="text-body-2 mb-4 text-grey-darken-2">
          Создайте первую пользовательскую историю для этого эпика
        </div>
        <v-btn
          color="primary"
          size="small"
          prepend-icon="mdi-plus"
          @click="$emit('add-user-story')"
        >
          Создать первую историю
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { UserStory } from '@/types'

interface Props {
  userStories?: UserStory[] | null
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

defineEmits<{
  'add-user-story': []
}>()

// Utility functions for status and priority display
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

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    Backlog: 'Бэклог',
    Draft: 'Черновик',
    'In Progress': 'В работе',
    Done: 'Выполнено',
    Cancelled: 'Отменено',
  }
  return texts[status] || status
}

const getPriorityColor = (priority: number) => {
  const colors: Record<number, string> = {
    1: 'red',
    2: 'orange',
    3: 'blue',
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

<style scoped>
.v-list-item {
  border-radius: 8px;
  margin-bottom: 4px;
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
