<template>
  <v-chip
    :color="priorityColor"
    :size="chipSize"
    :variant="variant"
    :loading="loading"
    :disabled="disabled"
    :class="chipClasses"
    :tabindex="readonly ? -1 : 0"
    :role="readonly ? undefined : 'button'"
    :aria-label="ariaLabel"
  >
    {{ priorityLabel }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Priority } from '@/types'
import { getPriorityColor, getPriorityLabel } from '@/utils/priority-utils'

// Props interface
interface PriorityChipProps {
  // Core functionality
  priority: Priority
  
  // Display configuration
  size?: 'small' | 'medium' | 'large'
  readonly?: boolean
  
  // State management
  loading?: boolean
  disabled?: boolean
  
  // Styling options
  variant?: 'flat' | 'outlined' | 'elevated'
}

// Emits interface
interface PriorityChipEmits {
  'priority-change': [newPriority: Priority]
  'error': [error: Error]
}

// Define props with defaults
const props = withDefaults(defineProps<PriorityChipProps>(), {
  size: 'medium',
  readonly: false,
  loading: false,
  disabled: false,
  variant: 'flat'
})

// Define emits
defineEmits<PriorityChipEmits>()

// Size configuration mapping
const sizeConfig = {
  small: {
    chipSize: 'x-small',
    selectWidth: '120px',
    selectDensity: 'compact'
  },
  medium: {
    chipSize: 'small', 
    selectWidth: '140px',
    selectDensity: 'compact'
  },
  large: {
    chipSize: 'large',
    selectWidth: '160px',
    selectDensity: 'default'
  }
} as const

// Computed properties
const priorityColor = computed(() => {
  try {
    return getPriorityColor(props.priority)
  } catch {
    console.warn('Invalid priority provided to PriorityChip:', props.priority)
    return 'grey'
  }
})

const priorityLabel = computed(() => {
  try {
    return getPriorityLabel(props.priority)
  } catch {
    console.warn('Invalid priority provided to PriorityChip:', props.priority)
    return `Приоритет ${props.priority}`
  }
})

const chipSize = computed(() => sizeConfig[props.size].chipSize)

const chipClasses = computed(() => ({
  'priority-chip': true,
  [`priority-chip--${props.size}`]: true,
  'priority-chip--readonly': props.readonly,
  'priority-chip--interactive': !props.readonly && !props.disabled
}))

const ariaLabel = computed(() => 
  `Приоритет: ${priorityLabel.value}${props.readonly ? '' : ', нажмите для изменения'}`
)
</script>

<style scoped>
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
</style>