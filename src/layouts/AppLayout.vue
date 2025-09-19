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
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>Профиль</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Настройки</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="logout">
            <v-list-item-title>Выйти</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer / Sidebar -->
    <v-navigation-drawer
      v-model="sidebarOpen"
      app
      width="280"
      color="grey-lighten-5"
    >
      <v-list nav>
        <!-- Dashboard -->
        <v-list-item
          to="/dashboard"
          prepend-icon="mdi-view-dashboard"
          title="Главная"
        />

        <v-divider class="my-2" />

        <!-- Epics Section -->
        <v-list-group value="epics">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-folder-multiple"
              title="Эпики"
            />
          </template>
          <v-list-item
            to="/epics"
            prepend-icon="mdi-format-list-bulleted"
            title="Все эпики"
          />
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
        <v-list-item
          to="/search"
          prepend-icon="mdi-magnify"
          title="Поиск"
        />

        <v-divider class="my-2" />

        <!-- Admin Section -->
        <v-list-group value="admin">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-cog"
              title="Администрирование"
            />
          </template>
          <v-list-item
            to="/admin/users"
            prepend-icon="mdi-account-multiple"
            title="Пользователи"
          />
          <v-list-item
            to="/admin/config"
            prepend-icon="mdi-cog-outline"
            title="Конфигурация"
          />
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content Area -->
    <v-main class="d-flex flex-column">
      <v-container fluid class="pa-4 flex-grow-1 d-flex flex-column">
        <!-- Breadcrumbs -->
        <AppBreadcrumbs class="mb-4" />
        
        <!-- Page Content -->
        <div class="flex-grow-1">
          <router-view />
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppBreadcrumbs from '@/components/common/AppBreadcrumbs.vue'

const router = useRouter()

// Sidebar state
const sidebarOpen = ref(true)

// Search functionality
const searchQuery = ref('')

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } })
  }
}

const logout = () => {
  // TODO: Implement logout logic
  router.push('/login')
}
</script>

<style scoped>
.v-app-bar-title a {
  text-decoration: none;
  color: inherit;
}

/* Ensure full height layout */
.v-main {
  height: 100%;
}

.v-container {
  height: 100%;
}
</style>