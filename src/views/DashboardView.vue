<template>
  <div class="dashboard">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div>
          <h1 class="text-h4 font-weight-bold text-primary mb-2">Главная страница</h1>
          <p class="text-body-1 text-medium-emphasis mb-0">
            Добро пожаловать в систему управления требованиями
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Statistics -->
    <DashboardStats :loading="isLoadingDashboard" class="mb-6" />

    <!-- Main Content -->
    <v-row>
      <!-- Recent Activity -->
      <v-col cols="12" lg="8">
        <RecentActivity :loading="isLoadingDashboard" />
      </v-col>

      <!-- Quick Actions -->
      <v-col cols="12" lg="4">
        <QuickActions />
      </v-col>
    </v-row>

    <!-- Error Display -->
    <v-row v-if="error" class="mt-4">
      <v-col cols="12">
        <v-alert type="error" variant="tonal" closable @click:close="clearError">
          <v-alert-title>Ошибка загрузки данных</v-alert-title>
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useEntitiesStore } from '@/stores/entities'
import { useUIStore } from '@/stores/ui'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'
import RecentActivity from '@/components/dashboard/RecentActivity.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'

// Stores
const entitiesStore = useEntitiesStore()
const uiStore = useUIStore()

// Computed
const isLoadingDashboard = computed(() => entitiesStore.loading.dashboard)
const error = computed(() => entitiesStore.errors.dashboard)

// Methods
function clearError() {
  delete entitiesStore.errors.dashboard
}

// Lifecycle
onMounted(async () => {
  try {
    // Load dashboard data
    await entitiesStore.loadDashboardData()

    // Show success notification
    uiStore.showSuccess('Данные загружены', 'Информация на главной странице обновлена')
  } catch (error) {
    console.error('Failed to load dashboard data:', error)

    // Show error notification
    uiStore.showError(
      'Ошибка загрузки',
      'Не удалось загрузить данные для главной страницы. Попробуйте обновить страницу.',
      true, // persistent
    )
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 0 8px;
  }
}
</style>
