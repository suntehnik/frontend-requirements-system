<template>
  <v-app>
    <!-- App Bar / Header -->
    <v-app-bar app color="primary" dark elevation="1">
      <v-app-bar-nav-icon @click="toggleSidebar" />

      <v-app-bar-title>
        <router-link to="/dashboard" class="text-decoration-none text-white">
          Requirements Management System
        </router-link>
      </v-app-bar-title>

      <v-spacer />

      <!-- Search Bar -->
      <v-text-field
        v-model="searchQuery"
        placeholder="Поиск..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        class="mr-4"
        style="max-width: 300px"
        @keyup.enter="performSearch"
      />

      <!-- User Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar size="32" color="secondary">
              <span class="text-white text-caption">
                {{ userInitials }}
              </span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>{{ authStore.user?.username || 'Пользователь' }}</v-list-item-title>
            <v-list-item-subtitle>{{ authStore.user?.role || '' }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider />
          <v-list-item>
            <v-list-item-title>Профиль</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Настройки</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="handleLogout" :disabled="loggingOut">
            <v-list-item-title>
              <v-icon v-if="loggingOut" start size="small">mdi-loading</v-icon>
              Выйти
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer / Sidebar -->
    <v-navigation-drawer v-model="sidebarOpen" app width="280" color="grey-lighten-5">
      <v-list nav>
        <!-- Dashboard -->
        <v-list-item to="/dashboard" prepend-icon="mdi-view-dashboard" title="Главная" />

        <v-divider class="my-2" />

        <!-- Epics Section -->
        <v-list-group value="epics">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-folder-multiple" title="Эпики" />
          </template>
          <v-list-item to="/epics" prepend-icon="mdi-format-list-bulleted" title="Все эпики" />

          <!-- Recent Epics -->
          <template v-if="recentEpics.length > 0">
            <v-divider class="my-1" />
            <v-list-subheader class="text-caption text-medium-emphasis px-4">
              Последние эпики
            </v-list-subheader>
            <v-list-item
              v-for="epic in recentEpics"
              :key="epic.entity_id"
              :to="`/epics/${epic.entity_id}`"
              :prepend-icon="hierarchyStore.getEntityIcon('epic')"
              density="compact"
              class="pl-8"
            >
              <v-list-item-title class="text-body-2">
                <span class="text-caption text-medium-emphasis mr-2">{{ epic.reference_id }}</span>
                {{ epic.title }}
              </v-list-item-title>
              <template #append>
                <v-chip
                  :color="hierarchyStore.getStatusColor(epic.status)"
                  size="x-small"
                  variant="flat"
                >
                  {{ epic.status }}
                </v-chip>
              </template>
            </v-list-item>
          </template>
        </v-list-group>

        <!-- User Stories Section -->
        <v-list-group value="user-stories">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-book-open-variant"
              title="Пользовательские истории"
            />
          </template>
          <v-list-item
            to="/user-stories"
            prepend-icon="mdi-format-list-bulleted"
            title="Все истории"
          />
        </v-list-group>

        <!-- Requirements Section -->
        <v-list-group value="requirements">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-file-document-multiple"
              title="Требования"
            />
          </template>
          <v-list-item
            to="/requirements"
            prepend-icon="mdi-format-list-bulleted"
            title="Все требования"
          />
        </v-list-group>

        <v-divider class="my-2" />

        <!-- Search -->
        <v-list-item to="/search" prepend-icon="mdi-magnify" title="Поиск" />

        <v-divider class="my-2" />

        <!-- Admin Section (only for administrators) -->
        <v-list-group v-if="authStore.hasRole('Administrator')" value="admin">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-cog" title="Администрирование" />
          </template>
          <v-list-item to="/admin/users" prepend-icon="mdi-account-multiple" title="Пользователи" />
          <v-list-item to="/admin/config" prepend-icon="mdi-cog-outline" title="Конфигурация" />
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content Area -->
    <v-main>
      <v-container fluid class="pa-4">
        <!-- Breadcrumbs -->
        <AppBreadcrumbs class="mb-4" />

        <!-- Page Content -->
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useHierarchyStore } from '@/stores/hierarchy'
import AppBreadcrumbs from '@/components/common/AppBreadcrumbs.vue'

const router = useRouter()
const authStore = useAuthStore()
const hierarchyStore = useHierarchyStore()

// Sidebar state
const sidebarOpen = ref(true)

// Search funct
// Search functionality
const searchQuery = ref('')

// Logout state
const loggingOut = ref(false)

// Computed
const userInitials = computed(() => {
  if (!authStore.user?.username) return 'U'
  const parts = authStore.user.username.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return authStore.user.username.substring(0, 2).toUpperCase()
})

// Get last 5 epics for quick navigation
const recentEpics = computed(() => {
  if (!hierarchyStore.hierarchyData.length) return []
  return hierarchyStore.hierarchyData.slice(-5).reverse() // Last 5 epics, reversed to show newest first
})

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } })
  }
}

const handleLogout = async () => {
  loggingOut.value = true
  try {
    await authStore.logout()
    await router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
    // Even if logout API fails, redirect to login
    await router.push('/login')
  } finally {
    loggingOut.value = false
  }
}

// Initialize hierarchy data on mount
onMounted(() => {
  hierarchyStore.initialize()
})
</script>

<style scoped>
.v-app-bar-title a {
  text-decoration: none;
  color: inherit;
}

/* Main content area should be scrollable */
.v-main {
  height: calc(100vh - 64px); /* Subtract app bar height */
  overflow-y: auto;
}
</style>
