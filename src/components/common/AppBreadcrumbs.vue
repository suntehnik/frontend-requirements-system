<template>
  <v-breadcrumbs
    v-if="breadcrumbs.length > 0"
    :items="breadcrumbs"
    divider="/"
    class="pa-0"
  >
    <template v-slot:item="{ item }">
      <v-breadcrumbs-item
        :to="item.disabled ? undefined : item.to"
        :disabled="item.disabled"
      >
        <template v-if="(item as BreadcrumbItem).icon">
          <v-icon :icon="(item as BreadcrumbItem).icon" size="small" class="mr-1" />
        </template>
        {{ item.title }}
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface BreadcrumbItem {
  title: string
  to?: string
  disabled?: boolean
  icon?: string
}

const route = useRoute()

const breadcrumbs = computed((): BreadcrumbItem[] => {
  const path = route.path
  const items: BreadcrumbItem[] = []

  // Always start with dashboard
  if (path !== '/dashboard') {
    items.push({
      title: 'Главная',
      to: '/dashboard',
      icon: 'mdi-home'
    })
  }

  // Generate breadcrumbs based on current route
  if (path.startsWith('/epics')) {
    items.push({
      title: 'Эпики',
      to: path === '/epics' ? undefined : '/epics',
      disabled: path === '/epics'
    })
    
    if (route.params.id) {
      items.push({
        title: `Эпик ${route.params.id}`,
        disabled: true
      })
    }
  } else if (path.startsWith('/user-stories')) {
    items.push({
      title: 'Пользовательские истории',
      to: path === '/user-stories' ? undefined : '/user-stories',
      disabled: path === '/user-stories'
    })
    
    if (route.params.id) {
      items.push({
        title: `История ${route.params.id}`,
        disabled: true
      })
    }
  } else if (path.startsWith('/requirements')) {
    items.push({
      title: 'Требования',
      to: path === '/requirements' ? undefined : '/requirements',
      disabled: path === '/requirements'
    })
    
    if (route.params.id) {
      items.push({
        title: `Требование ${route.params.id}`,
        disabled: true
      })
    }
  } else if (path === '/search') {
    items.push({
      title: 'Поиск',
      disabled: true,
      icon: 'mdi-magnify'
    })
  } else if (path.startsWith('/admin')) {
    items.push({
      title: 'Администрирование',
      to: path === '/admin' ? undefined : '/admin',
      disabled: path === '/admin',
      icon: 'mdi-cog'
    })
    
    if (path === '/admin/users') {
      items.push({
        title: 'Пользователи',
        disabled: true
      })
    } else if (path === '/admin/config') {
      items.push({
        title: 'Конфигурация',
        disabled: true
      })
    }
  }

  return items
})
</script>