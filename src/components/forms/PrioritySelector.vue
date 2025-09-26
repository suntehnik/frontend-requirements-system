<template>
  <v-select
    :model-value="modelValue"
    :items="priorityOptions"
    :label="label"
    :placeholder="placeholder"
    :rules="rules"
    :error-messages="errorMessages"
    :disabled="disabled"
    :loading="loading"
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
          <v-chip
            :color="item.raw.color"
            :text="item.raw.value.toString()"
            size="x-small"
            variant="flat"
            class="mr-2"
          />
        </template>
        <v-list-item-title>{{ item.raw.label }}</v-list-item-title>
        <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Priority } from '@/types'

interface PriorityOption {
  value: Priority
  label: string
  description: string
  color: string
}

interface Props {
  modelValue?: Priority | null
  label?: string
  placeholder?: string
  rules?: Array<(value: Priority | null) => boolean | string>
  errorMessages?: string | string[]
  disabled?: boolean
  loading?: boolean
  clearable?: boolean
  variant?: 'filled' | 'outlined' | 'plain' | 'underlined' | 'solo' | 'solo-inverted' | 'solo-filled'
  density?: 'default' | 'comfortable' | 'compact'
  class?: string
}

interface Emits {
  (e: 'update:modelValue', value: Priority | null): void
}

withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: 'Приоритет',
  placeholder: 'Выберите приоритет',
  disabled: false,
  loading: false,
  clearable: false,
  variant: 'outlined',
  density: 'default',
})

const emit = defineEmits<Emits>()

// Priority options with Russian labels
const priorityOptions = computed<PriorityOption[]>(() => [
  {
    value: 1 as Priority,
    label: 'Критический',
    description: 'Требует немедленного внимания',
    color: 'red',
  },
  {
    value: 2 as Priority,
    label: 'Высокий',
    description: 'Важная задача',
    color: 'orange',
  },
  {
    value: 3 as Priority,
    label: 'Средний',
    description: 'Обычная задача',
    color: 'blue',
  },
  {
    value: 4 as Priority,
    label: 'Низкий',
    description: 'Может быть отложена',
    color: 'grey',
  },
])

// Methods
const handleUpdate = (value: Priority | null): void => {
  emit('update:modelValue', value)
}

// Helper function to get priority label by value
const getPriorityLabel = (priority: Priority): string => {
  const option = priorityOptions.value.find(opt => opt.value === priority)
  return option?.label || `Приоритет ${priority}`
}

// Helper function to get priority color by value
const getPriorityColor = (priority: Priority): string => {
  const option = priorityOptions.value.find(opt => opt.value === priority)
  return option?.color || 'grey'
}

// Expose helper functions for external use
defineExpose({
  getPriorityLabel,
  getPriorityColor,
  priorityOptions,
  handleUpdate,
})
</script>