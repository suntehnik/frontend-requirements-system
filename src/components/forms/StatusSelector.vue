<template>
  <v-select
    :model-value="modelValue"
    :items="statusOptions"
    :label="label"
    :placeholder="placeholder"
    :rules="rules"
    :error-messages="errorMessages"
    :disabled="disabled"
    :loading="loading || configStore.isLoading"
    :clearable="clearable"
    :variant="variant"
    :density="density"
    :class="$props.class"
    item-title="label"
    item-value="value"
    @update:model-value="handleUpdate"
  >
    <template #selection="{ item }">
      <v-chip
        :color="item.raw.color"
        :text="item.raw.label"
        size="small"
        variant="flat"
      />
    </template>
    
    <template #item="{ item, props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-icon
            :color="item.raw.color"
            icon="mdi-circle"
            size="small"
            class="mr-2"
          />
        </template>
        <v-list-item-title>{{ item.raw.label }}</v-list-item-title>
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import type { EntityType, EpicStatus, UserStoryStatus, RequirementStatus } from '@/types'

type StatusValue = EpicStatus | UserStoryStatus | RequirementStatus

interface Props {
  modelValue?: StatusValue | null
  entityType: EntityType
  label?: string
  placeholder?: string
  rules?: Array<(value: StatusValue | null) => boolean | string>
  errorMessages?: string | string[]
  disabled?: boolean
  loading?: boolean
  clearable?: boolean
  variant?: 'filled' | 'outlined' | 'plain' | 'underlined' | 'solo' | 'solo-inverted' | 'solo-filled'
  density?: 'default' | 'comfortable' | 'compact'
  class?: string
}

interface Emits {
  (e: 'update:modelValue', value: StatusValue | null): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: 'Статус',
  placeholder: 'Выберите статус',
  disabled: false,
  loading: false,
  clearable: false,
  variant: 'outlined',
  density: 'default',
})

const emit = defineEmits<Emits>()

// Store
const configStore = useConfigStore()

// Computed
const statusOptions = computed(() => {
  return configStore.getStatusOptions(props.entityType)
})

const entityTypeLabel = computed(() => {
  switch (props.entityType) {
    case 'epic':
      return 'эпика'
    case 'user_story':
      return 'пользовательской истории'
    case 'requirement':
      return 'требования'
    case 'acceptance_criteria':
      return 'критерия приемки'
    default:
      return 'объекта'
  }
})

const computedLabel = computed(() => {
  return props.label || `Статус ${entityTypeLabel.value}`
})

// Methods
const handleUpdate = (value: StatusValue | null): void => {
  emit('update:modelValue', value)
}

// Helper function to get status label by value
const getStatusLabel = (status: StatusValue): string => {
  const option = statusOptions.value.find(opt => opt.value === status)
  return option?.label || status
}

// Helper function to get status color by value
const getStatusColor = (status: StatusValue): string => {
  const option = statusOptions.value.find(opt => opt.value === status)
  return option?.color || 'grey'
}

// Load config on mount if needed
onMounted(() => {
  if (statusOptions.value.length === 0) {
    // Status options are computed from the config store, no need to fetch separately
    // The config store should be loaded by the parent component or app initialization
  }
})

// Expose helper functions for external use
defineExpose({
  getStatusLabel,
  getStatusColor,
  statusOptions,
  handleUpdate,
  computedLabel,
})
</script>