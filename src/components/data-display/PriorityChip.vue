<template>
  <div class="priority-chip-wrapper">
    <!-- Screen reader description -->
    <div v-if="!readonly" :id="`priority-chip-${priority}-description`" class="sr-only">
      {{ getPriorityDescription(priority) }}. Используйте Enter или пробел для открытия списка
      приоритетов.
    </div>

    <!-- Display Mode -->
    <v-chip
      v-if="!showDropdown"
      :color="priorityColor"
      :size="chipSize"
      :variant="variant"
      :loading="loading || isUpdating"
      :disabled="disabled || isUpdating"
      :class="chipClasses"
      @click="handleChipClick"
      @keydown="handleKeydown"
      :tabindex="readonly ? -1 : 0"
      :role="readonly ? undefined : 'button'"
      :aria-label="ariaLabel"
      :aria-expanded="showDropdown ? 'true' : 'false'"
      :aria-haspopup="readonly ? undefined : 'listbox'"
      :aria-describedby="readonly ? undefined : `priority-chip-${props.priority}-description`"
    >
      {{ priorityLabel }}
    </v-chip>

    <!-- Edit Mode -->
    <v-select
      v-else
      ref="selectRef"
      v-model="localPriority"
      :items="priorityOptions"
      :disabled="disabled || isUpdating"
      :loading="loading || isUpdating"
      :style="{ width: selectWidth }"
      :class="[
        'priority-select',
        `priority-select--${size}`,
        {
          'priority-select--loading': loading || isUpdating,
          'priority-select--disabled': disabled || isUpdating,
        },
      ]"
      item-title="label"
      item-value="value"
      variant="outlined"
      density="compact"
      hide-details
      auto-select-first
      :aria-label="`Выберите приоритет, текущий: ${priorityLabel}`"
      role="combobox"
      @update:model-value="handlePriorityChange"
      @blur="hideDropdown"
      @keydown.escape="hideDropdown"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch, type ComponentPublicInstance } from 'vue'
import type { Priority } from '@/types'
import type { PriorityChipProps, PriorityChipEmits } from '@/types/status'
import { getPriorityColor, getPriorityLabel, getPriorityDescription } from '@/utils/priority-utils'

// Define props with defaults
const props = withDefaults(defineProps<PriorityChipProps>(), {
  size: 'medium',
  readonly: false,
  loading: false,
  disabled: false,
  variant: 'flat',
})

// Define emits
const emit = defineEmits<PriorityChipEmits>()

// Component state
const showDropdown = ref(false)
const localPriority = ref<Priority>(props.priority)
const selectRef = ref<ComponentPublicInstance | null>(null)
const isUpdating = ref(false)

// Watch for priority prop changes
watch(
  () => props.priority,
  (newPriority) => {
    localPriority.value = newPriority
  },
  { immediate: true },
)

// Size configuration mapping
const sizeConfig = {
  small: {
    chipSize: 'x-small',
    selectWidth: '120px',
    selectDensity: 'compact',
  },
  medium: {
    chipSize: 'default',
    selectWidth: '140px',
    selectDensity: 'compact',
  },
  large: {
    chipSize: 'large',
    selectWidth: '160px',
    selectDensity: 'default',
  },
} as const

// Computed properties
const priorityColor = computed(() => {
  try {
    if (![1, 2, 3, 4].includes(props.priority)) {
      console.warn('Invalid priority provided to PriorityChip:', props.priority)
      return 'grey'
    }
    return getPriorityColor(props.priority)
  } catch (error) {
    console.warn('Error getting priority color:', error)
    return 'grey'
  }
})

const priorityLabel = computed(() => {
  try {
    if (![1, 2, 3, 4].includes(props.priority)) {
      console.warn('Invalid priority provided to PriorityChip:', props.priority)
      return `Приоритет ${props.priority}`
    }
    return getPriorityLabel(props.priority)
  } catch (error) {
    console.warn('Error getting priority label:', error)
    return `Приоритет ${props.priority}`
  }
})

const chipSize = computed(() => sizeConfig[props.size].chipSize)

const chipClasses = computed(() => ({
  'priority-chip': true,
  [`priority-chip--${props.size}`]: true,
  'priority-chip--readonly': props.readonly,
  'priority-chip--interactive': !props.readonly && !props.disabled,
}))

const ariaLabel = computed(
  () => `Приоритет: ${priorityLabel.value}${props.readonly ? '' : ', нажмите для изменения'}`,
)

// Priority options for dropdown
const priorityOptions = computed(() => [
  { label: 'Критический', value: 1 as Priority },
  { label: 'Высокий', value: 2 as Priority },
  { label: 'Средний', value: 3 as Priority },
  { label: 'Низкий', value: 4 as Priority },
])

// Select configuration
const selectWidth = computed(() => sizeConfig[props.size].selectWidth)

// Event handlers
const handleChipClick = () => {
  if (props.readonly || props.disabled || props.loading || isUpdating.value) return
  showDropdown.value = true
  localPriority.value = props.priority

  nextTick(() => {
    if (selectRef.value && '$el' in selectRef.value) {
      const element = selectRef.value.$el as HTMLElement
      const input = element.querySelector('input')
      input?.focus()
    }
  })
}

const hideDropdown = () => {
  // Small delay to allow for option selection
  setTimeout(() => {
    showDropdown.value = false
    localPriority.value = props.priority
  }, 150)
}

const handlePriorityChange = (newPriority: Priority) => {
  if (!newPriority) {
    showDropdown.value = false
    return
  }

  try {
    // Validate priority value
    if (![1, 2, 3, 4].includes(newPriority)) {
      const error = new Error(`Invalid priority value: ${newPriority}`)
      emit('error', error)
      console.warn('Invalid priority provided to PriorityChip:', newPriority)
      showDropdown.value = false
      return
    }

    // Always emit the event, even if the value is the same
    // The parent component will decide if it needs to update
    isUpdating.value = true
    emit('priority-change', newPriority)
    showDropdown.value = false

    // Reset updating state after a short delay
    setTimeout(() => {
      isUpdating.value = false
    }, 300)
  } catch (error) {
    const priorityError = error instanceof Error ? error : new Error('Unknown error occurred')
    emit('error', priorityError)
    console.error('Error in handlePriorityChange:', error)
    showDropdown.value = false
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.readonly || props.disabled || props.loading || isUpdating.value) return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      handleChipClick()
      break
    case 'Escape':
      if (showDropdown.value) {
        event.preventDefault()
        showDropdown.value = false
        localPriority.value = props.priority
      }
      break
    case 'Tab':
      if (showDropdown.value) {
        // Allow Tab to close dropdown and move focus
        showDropdown.value = false
        localPriority.value = props.priority
      }
      break
  }
}
</script>

<style scoped>
.priority-chip-wrapper {
  display: inline-block;
}

.priority-chip {
  cursor: default;
  transition: all 0.2s ease-in-out;
}

.priority-chip--interactive {
  cursor: pointer;
}

.priority-chip--interactive:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.priority-chip--interactive:focus {
  outline: 2px solid var(--v-theme-primary);
  outline-offset: 2px;
}

.priority-chip--readonly {
  cursor: default;
}

.priority-chip--small {
  font-size: 0.75rem;
}

.priority-chip--medium {
  font-size: 0.875rem;
}

.priority-chip--large {
  font-size: 1rem;
  font-weight: 500;
}

.priority-select {
  min-width: 140px;
}

/* Small size adjustments */
.priority-select--small {
  min-width: 120px;
}

/* Medium size adjustments */
.priority-select--medium {
  min-width: 140px;
}

/* Large size adjustments */
.priority-select--large {
  min-width: 160px;
}

.priority-select--loading {
  opacity: 0.6;
}

.priority-select--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
