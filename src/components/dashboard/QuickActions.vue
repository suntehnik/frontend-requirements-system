<template>
  <v-card elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-lightning-bolt</v-icon>
      Быстрые действия
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-4">
      <div class="d-flex flex-column ga-3">
        <!-- Create Epic -->
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          block
          :disabled="!canCreateEpic"
          @click="handleCreateEpic"
          class="quick-action-btn"
        >
          <v-icon start>mdi-plus</v-icon>
          Создать эпик
        </v-btn>

        <!-- Create User Story -->
        <v-btn
          color="success"
          variant="flat"
          size="large"
          block
          :disabled="!canCreateUserStory"
          @click="handleCreateUserStory"
          class="quick-action-btn"
        >
          <v-icon start>mdi-plus</v-icon>
          Создать историю
        </v-btn>

        <!-- Create Requirement -->
        <v-btn
          color="info"
          variant="flat"
          size="large"
          block
          :disabled="!canCreateRequirement"
          @click="handleCreateRequirement"
          class="quick-action-btn"
        >
          <v-icon start>mdi-plus</v-icon>
          Создать требование
        </v-btn>

        <v-divider class="my-2" />

        <!-- Search -->
        <v-btn
          color="secondary"
          variant="outlined"
          size="large"
          block
          to="/search"
          class="quick-action-btn"
        >
          <v-icon start>mdi-magnify</v-icon>
          Поиск
        </v-btn>

        <!-- View All Epics -->
        <v-btn
          color="primary"
          variant="outlined"
          size="large"
          block
          to="/epics"
          class="quick-action-btn"
        >
          <v-icon start>mdi-folder-multiple</v-icon>
          Все эпики
        </v-btn>

        <!-- View All User Stories -->
        <v-btn
          color="success"
          variant="outlined"
          size="large"
          block
          to="/user-stories"
          class="quick-action-btn"
        >
          <v-icon start>mdi-book-open-page-variant</v-icon>
          Все истории
        </v-btn>

        <!-- View All Requirements -->
        <v-btn
          color="info"
          variant="outlined"
          size="large"
          block
          to="/requirements"
          class="quick-action-btn"
        >
          <v-icon start>mdi-file-document-multiple</v-icon>
          Все требования
        </v-btn>
      </div>
    </v-card-text>

    <!-- Admin Actions (only for administrators) -->
    <template v-if="isAdmin">
      <v-divider />
      
      <v-card-text class="pa-4">
        <div class="text-subtitle-2 text-medium-emphasis mb-3">
          <v-icon start size="16">mdi-shield-account</v-icon>
          Администрирование
        </div>
        
        <div class="d-flex flex-column ga-2">
          <v-btn
            color="orange"
            variant="outlined"
            size="default"
            block
            to="/admin/users"
            class="quick-action-btn"
          >
            <v-icon start>mdi-account-multiple</v-icon>
            Управление пользователями
          </v-btn>

          <v-btn
            color="orange"
            variant="outlined"
            size="default"
            block
            to="/admin/config"
            class="quick-action-btn"
          >
            <v-icon start>mdi-cog</v-icon>
            Конфигурация системы
          </v-btn>
        </div>
      </v-card-text>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

// Router
const router = useRouter()

// Stores
const authStore = useAuthStore()
const uiStore = useUIStore()

// Computed
const isAdmin = computed(() => authStore.hasRole('Administrator'))
const canCreateEpic = computed(() => authStore.hasRole('User'))
const canCreateUserStory = computed(() => authStore.hasRole('User'))
const canCreateRequirement = computed(() => authStore.hasRole('User'))

// Actions
function handleCreateEpic() {
  // Navigate to epics page with create mode
  router.push('/epics?action=create')
}

function handleCreateUserStory() {
  // Navigate to user stories page with create mode
  router.push('/user-stories?action=create')
}

function handleCreateRequirement() {
  // Navigate to requirements page with create mode
  router.push('/requirements?action=create')
}
</script>

<style scoped>
.quick-action-btn {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  text-transform: none;
  font-weight: 500;
}

.quick-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.quick-action-btn:active {
  transform: translateY(0);
}

/* Ensure consistent button heights */
.quick-action-btn.v-btn--size-large {
  height: 48px;
}

.quick-action-btn.v-btn--size-default {
  height: 40px;
}
</style>