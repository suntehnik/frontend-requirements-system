<template>
  <v-autocomplete
    :model-value="modelValue"
    :items="filteredUsers"
    :label="label"
    :placeholder="placeholder"
    :rules="rules"
    :error-messages="errorMessages"
    :disabled="disabled"
    :loading="loading || configStore.loadingUsers"
    :clearable="clearable"
    :variant="variant"
    :density="density"
    :class="$props.class"
    :search="searchQuery"
    item-title="displayName"
    item-value="id"
    no-filter
    @update:model-value="handleUpdate"
    @update:search="handleSearch"
  >
    <template #selection="{ item }">
      <div class="d-flex align-center">
        <v-avatar size="24" class="mr-2">
          <v-icon icon="mdi-account" />
        </v-avatar>
        <span>{{ item.raw.displayName }}</span>
      </div>
    </template>
    
    <template #item="{ item, props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-avatar size="32">
            <v-icon icon="mdi-account" />
          </v-avatar>
        </template>
        <v-list-item-title>{{ item.raw.username }}</v-list-item-title>
        <v-list-item-subtitle>{{ item.raw.email }}</v-list-item-subtitle>
        <template #append>
          <v-chip
            :color="getRoleColor(item.raw.role)"
            :text="getRoleLabel(item.raw.role)"
            size="x-small"
            variant="flat"
          />
        </template>
      </v-list-item>
    </template>

    <template #no-data>
      <v-list-item>
        <v-list-item-title>
          {{ searchQuery ? 'Пользователи не найдены' : 'Начните вводить для поиска' }}
        </v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useConfigStore } from '@/stores/config'
import type { User, UserRole } from '@/types'

interface UserWithDisplayName extends User {
  displayName: string
}

interface Props {
  modelValue?: string | null
  label?: string
  placeholder?: string
  rules?: Array<(value: string | null) => boolean | string>
  errorMessages?: string | string[]
  disabled?: boolean
  loading?: boolean
  clearable?: boolean
  variant?: 'filled' | 'outlined' | 'plain' | 'underlined' | 'solo' | 'solo-inverted' | 'solo-filled'
  density?: 'default' | 'comfortable' | 'compact'
  class?: string
  excludeRoles?: UserRole[]
  includeRoles?: UserRole[]
}

interface Emits {
  (e: 'update:modelValue', value: string | null): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: 'Ответственный',
  placeholder: 'Выберите пользователя',
  disabled: false,
  loading: false,
  clearable: true,
  variant: 'outlined',
  density: 'default',
  excludeRoles: () => [],
  includeRoles: () => [],
})

const emit = defineEmits<Emits>()

// Store
const configStore = useConfigStore()

// Local state
const searchQuery = ref('')

// Computed
const usersWithDisplayName = computed<UserWithDisplayName[]>(() => {
  return configStore.users.map(user => ({
    ...user,
    displayName: `${user.username} (${user.email})`,
  }))
})

const filteredUsers = computed<UserWithDisplayName[]>(() => {
  let users = usersWithDisplayName.value

  // Filter by included roles
  if (props.includeRoles.length > 0) {
    users = users.filter(user => props.includeRoles.includes(user.role))
  }

  // Filter by excluded roles
  if (props.excludeRoles.length > 0) {
    users = users.filter(user => !props.excludeRoles.includes(user.role))
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    users = users.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.displayName.toLowerCase().includes(query)
    )
  }

  return users
})

const selectedUser = computed(() => {
  if (!props.modelValue) return null
  return configStore.getUserById(props.modelValue)
})

// Methods
const handleUpdate = (value: string | null): void => {
  emit('update:modelValue', value)
}

const handleSearch = (value: string): void => {
  searchQuery.value = value
}

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'Administrator':
      return 'Администратор'
    case 'User':
      return 'Пользователь'
    case 'Commenter':
      return 'Комментатор'
    default:
      return role
  }
}

const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'Administrator':
      return 'red'
    case 'User':
      return 'blue'
    case 'Commenter':
      return 'grey'
    default:
      return 'grey'
  }
}

// Helper function to get user display name by ID
const getUserDisplayName = (userId: string): string => {
  const user = configStore.getUserById(userId)
  return user ? `${user.username} (${user.email})` : userId
}

// Load users on mount if not already loaded
onMounted(async () => {
  if (configStore.users.length === 0 && !configStore.loadingUsers) {
    await configStore.fetchUsers()
  }
})

// Watch for errors and handle them
watch(
  () => configStore.usersError,
  (error) => {
    if (error) {
      console.error('Error loading users:', error)
    }
  }
)

// Expose helper functions for external use
defineExpose({
  getUserDisplayName,
  getRoleLabel,
  getRoleColor,
  selectedUser,
  filteredUsers,
  usersWithDisplayName,
  handleUpdate,
  handleSearch,
})
</script>