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
      <v-chip :color="item.raw.color" :text="item.raw.label" size="small" variant="flat" />
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
import { getAllPriorityOptions, getPriorityLabel, getPriorityColor, type PriorityOption } from '@/utils/priority-utils'

interface Props {
  modelValue?: Priority | null
  label?: string
  placeholder?: string
  rules?: Array<(value: Priority | null) => boolean | string>
  errorMessages?: string | string[]
  disabled?: boolean
  loading?: boolean
  clearable?: boolean
  variant?:
    | 'filled'
    | 'outlined'
    | 'plain'
    | 'underlined'
    | 'solo'
    | 'solo-inverted'
    | 'solo-filled'
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

// Priority options using shared utilities
const priorityOptions = computed<PriorityOption[]>(() => getAllPriorityOptions())

// Methods
const handleUpdate = (value: Priority | null): void => {
  emit('update:modelValue', value)
}

// Expose helper functions for external use
defineExpose({
  getPriorityLabel,
  getPriorityColor,
  priorityOptions,
  handleUpdate,
})
</script>
