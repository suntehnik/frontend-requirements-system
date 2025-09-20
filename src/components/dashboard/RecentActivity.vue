<template>
  <v-card elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-history</v-icon>
      Последние изменения
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-0">
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
        />
        <div class="text-body-2 text-medium-emphasis mt-2">
          Загрузка активности...
        </div>
      </div>

      <div v-else-if="recentActivity.length === 0" class="text-center py-8">
        <v-icon
          size="64"
          color="grey-lighten-1"
          class="mb-2"
        >
          mdi-history
        </v-icon>
        <div class="text-body-1 text-medium-emphasis">
          Нет недавней активности
        </div>
        <div class="text-body-2 text-disabled">
          Создайте эпик, историю или требование, чтобы увидеть активность
        </div>
      </div>

      <v-list v-else class="py-0">
        <template
          v-for="(activity, index) in recentActivity"
          :key="`${activity.type}-${activity.entity.id}`"
        >
          <v-list-item
            :to="getEntityRoute(activity)"
            class="activity-item"
          >
            <template #prepend>
              <v-avatar
                :color="getEntityColor(activity.type)"
                size="40"
                class="me-3"
              >
                <v-icon
                  :icon="getEntityIcon(activity.type)"
                  color="white"
                  size="20"
                />
              </v-avatar>
            </template>

            <v-list-item-title class="text-body-1 font-weight-medium">
              {{ getActivityTitle(activity) }}
            </v-list-item-title>

            <v-list-item-subtitle class="d-flex align-center mt-1">
              <v-chip
                :color="getStatusColor(activity.entity.status)"
                size="x-small"
                variant="flat"
                class="me-2"
              >
                {{ activity.entity.status }}
              </v-chip>
              <span class="text-caption text-medium-emphasis">
                {{ formatRelativeTime(activity.lastModified) }}
              </span>
            </v-list-item-subtitle>

            <template #append>
              <v-icon
                color="grey-lighten-1"
                size="16"
              >
                mdi-chevron-right
              </v-icon>
            </template>
          </v-list-item>

          <v-divider
            v-if="index < recentActivity.length - 1"
            :key="`divider-${index}`"
          />
        </template>
      </v-list>
    </v-card-text>

    <v-divider />

    <v-card-actions>
      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        to="/search"
      >
        Посмотреть все
        <v-icon end>mdi-arrow-right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEntitiesStore } from '@/stores/entities'
import type { Epic, UserStory, Requirement } from '@/types'

// Props
interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

// Store
const entitiesStore = useEntitiesStore()

// Computed
const recentActivity = computed(() => entitiesStore.recentActivity)

// Helper functions
function getEntityIcon(type: 'epic' | 'user_story' | 'requirement'): string {
  switch (type) {
    case 'epic':
      return 'mdi-folder-multiple'
    case 'user_story':
      return 'mdi-book-open-page-variant'
    case 'requirement':
      return 'mdi-file-document'
    default:
      return 'mdi-file'
  }
}

function getEntityColor(type: 'epic' | 'user_story' | 'requirement'): string {
  switch (type) {
    case 'epic':
      return 'primary'
    case 'user_story':
      return 'success'
    case 'requirement':
      return 'info'
    default:
      return 'grey'
  }
}

function getEntityRoute(activity: { type: string; entity: Epic | UserStory | Requirement }) {
  switch (activity.type) {
    case 'epic':
      return `/epics/${activity.entity.id}`
    case 'user_story':
      return `/user-stories/${activity.entity.id}`
    case 'requirement':
      return `/requirements/${activity.entity.id}`
    default:
      return '/'
  }
}

function getActivityTitle(activity: { type: string; entity: Epic | UserStory | Requirement }): string {
  const entity = activity.entity
  const typeLabel = getEntityTypeLabel(activity.type)
  
  return `${typeLabel} "${entity.title}"`
}

function getEntityTypeLabel(type: string): string {
  switch (type) {
    case 'epic':
      return 'Эпик'
    case 'user_story':
      return 'История'
    case 'requirement':
      return 'Требование'
    default:
      return 'Элемент'
  }
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'backlog':
      return 'grey'
    case 'draft':
      return 'orange'
    case 'in progress':
      return 'blue'
    case 'active':
      return 'green'
    case 'done':
      return 'success'
    case 'cancelled':
    case 'obsolete':
      return 'error'
    default:
      return 'grey'
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'только что'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} мин назад`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ч назад`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} дн назад`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} нед назад`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} мес назад`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} г назад`
}
</script>

<style scoped>
.activity-item {
  transition: background-color 0.2s ease-in-out;
}

.activity-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.v-list-item-title {
  line-height: 1.3;
}

.v-list-item-subtitle {
  margin-top: 4px;
}
</style>