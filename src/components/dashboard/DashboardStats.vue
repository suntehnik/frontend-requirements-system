<template>
  <v-row class="dashboard-stats-row">
    <v-col cols="12" sm="6" md="3">
      <v-card :loading="loading" class="dashboard-stat-card h-100" elevation="2">
        <v-card-text class="text-center d-flex flex-column justify-center h-100">
          <v-icon size="48" color="primary" class="mb-2"> mdi-folder-multiple </v-icon>
          <div class="text-h6 text-medium-emphasis mb-1">Эпики</div>
          <div class="text-h3 text-primary font-weight-bold">
            {{ stats.epics }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card :loading="loading" class="dashboard-stat-card h-100" elevation="2">
        <v-card-text class="text-center d-flex flex-column justify-center h-100">
          <v-icon size="48" color="success" class="mb-2"> mdi-book-open-page-variant </v-icon>
          <div class="text-h6 text-medium-emphasis mb-1">Пользовательские истории</div>
          <div class="text-h3 text-success font-weight-bold">
            {{ stats.userStories }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card :loading="loading" class="dashboard-stat-card h-100" elevation="2">
        <v-card-text class="text-center d-flex flex-column justify-center h-100">
          <v-icon size="48" color="info" class="mb-2"> mdi-file-document-multiple </v-icon>
          <div class="text-h6 text-medium-emphasis mb-1">Требования</div>
          <div class="text-h3 text-info font-weight-bold">
            {{ stats.requirements }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card :loading="loading" class="dashboard-stat-card h-100" elevation="2">
        <v-card-text class="text-center d-flex flex-column justify-center h-100">
          <v-icon size="48" color="warning" class="mb-2"> mdi-clock-fast </v-icon>
          <div class="text-h6 text-medium-emphasis mb-1">Активные задачи</div>
          <div class="text-h3 text-warning font-weight-bold">
            {{ stats.activeTasks }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEntitiesStore } from '@/stores/entities'

// Props
interface Props {
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

// Store
const entitiesStore = useEntitiesStore()

// Computed
const stats = computed(() => entitiesStore.stats)
</script>

<style scoped>
.dashboard-stats-row {
  align-items: stretch;
}

.dashboard-stat-card {
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  height: 100%;
}

.dashboard-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.dashboard-stat-card .v-card-text {
  padding: 24px;
  min-height: 160px; /* Минимальная высота для всех карточек */
}

/* Обеспечиваем одинаковую высоту для всех колонок */
.dashboard-stats-row .v-col {
  display: flex;
}

/* Дополнительное выравнивание контента по центру */
.dashboard-stat-card .v-card-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
