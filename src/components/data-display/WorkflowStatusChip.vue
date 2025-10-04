<template>
  <div class="workflow-status-chip">
    <v-chip
      v-if="readonly || !isEditing"
      :color="getStatusColor(status)"
      :size="chipSize"
      :variant="variant"
      :loading="loading"
      :disabled="disabled"
      :class="[
        'workflow-status-chip__display',
        { 
          'workflow-status-chip__display--clickable': !readonly && !disabled && !loading,
          'workflow-status-chip__display--error': hasError,
          'workflow-status-chip__display--loading': loading,
          'workflow-status-chip__display--disabled': disabled
        }
      ]"
      :aria-label="chipAriaLabel"
      :aria-describedby="hasError ? 'status-error' : undefined"
      role="button"
      :tabindex="readonly || disabled || loading ? -1 : 0"
      @click="handleChipClick"
      @keydown.enter="handleChipClick"
      @keydown.space.prevent="handleChipClick"
    >
      {{ getStatusText(status) }}
    </v-chip>

    <v-select
      v-else
      ref="selectRef"
      v-model="selectedStatus"
      :items="workflowStatusOptions"
      :disabled="disabled"
      :loading="loading"
      :error="hasError"
      :style="{ width: selectWidth }"
      :class="[
        'workflow-status-select',
        `workflow-status-select--${size}`,
        { 
          'workflow-status-select--error': hasError,
          'workflow-status-select--loading': loading,
          'workflow-status-select--disabled': disabled
        }
      ]"
      item-title="text"
      item-value="value"
      variant="outlined"
      density="compact"
      hide-details
      auto-select-first
      :aria-label="selectAriaLabel"
      :aria-describedby="hasError ? 'status-error' : undefined"
      role="combobox"
      @update:model-value="handleStatusChange"
      @blur="handleDropdownBlur"
      @keydown.escape="handleEscapeKey"
    />

    <!-- Error message for accessibility -->
    <div
      v-if="hasError"
      id="status-error"
      class="workflow-status-chip__error sr-only"
      role="alert"
      aria-live="polite"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import type { 
  WorkflowStatus, 
  WorkflowStatusChipProps, 
  WorkflowStatusChipEmits,
  StatusOption,
  SizeConfig
} from '@/types/status'

const props = withDefaults(defineProps<WorkflowStatusChipProps>(), {
  size: 'medium',
  readonly: false,
  loading: false,
  disabled: false,
  variant: 'flat'
})

// Emits definition
const emit = defineEmits<WorkflowStatusChipEmits>()

// Template refs
const selectRef = ref<HTMLElement>()

// Component state
const isEditing = ref(false)
const selectedStatus = ref<WorkflowStatus>(props.status)
const hasError = ref(false)
const errorMessage = ref('')

// Status configuration
const workflowStatusOptions: StatusOption<WorkflowStatus>[] = [
  { text: 'Бэклог', value: 'Backlog' },
  { text: 'Черновик', value: 'Draft' },
  { text: 'В работе', value: 'In Progress' },
  { text: 'Выполнено', value: 'Done' },
  { text: 'Отменено', value: 'Cancelled' }
]

const statusColorMap: Record<WorkflowStatus, string> = {
  'Backlog': 'grey',
  'Draft': 'orange',
  'In Progress': 'blue',
  'Done': 'success',
  'Cancelled': 'error'
}

const statusTextMap: Record<WorkflowStatus, string> = {
  'Backlog': 'Бэклог',
  'Draft': 'Черновик',
  'In Progress': 'В работе',
  'Done': 'Выполнено',
  'Cancelled': 'Отменено'
}

// Size configuration
const sizeConfigMap: Record<string, SizeConfig> = {
  small: { chipSize: 'x-small', selectWidth: '120px' },
  medium: { chipSize: 'small', selectWidth: '140px' },
  large: { chipSize: 'large', selectWidth: '160px' }
}

// Computed properties
const chipSize = computed(() => sizeConfigMap[props.size].chipSize)
const selectWidth = computed(() => sizeConfigMap[props.size].selectWidth)

const chipAriaLabel = computed(() => {
  const statusText = getStatusText(props.status)
  const action = props.readonly ? '' : ', нажмите для изменения'
  return `Статус: ${statusText}${action}`
})

const selectAriaLabel = computed(() => 
  `Выберите статус, текущий: ${getStatusText(props.status)}`
)

// Status utility functions
const getStatusColor = (status: WorkflowStatus): string => {
  return statusColorMap[status] || 'grey'
}

const getStatusText = (status: WorkflowStatus): string => {
  return statusTextMap[status] || status
}

// Event handlers
const handleChipClick = (): void => {
  if (props.readonly || props.disabled || props.loading) {
    return
  }
  
  isEditing.value = true
  selectedStatus.value = props.status
  
  nextTick(() => {
    selectRef.value?.focus()
  })
}

const handleStatusChange = (newStatus: WorkflowStatus): void => {
  if (!newStatus || newStatus === props.status) {
    isEditing.value = false
    return
  }

  try {
    hasError.value = false
    errorMessage.value = ''
    emit('status-change', newStatus)
    isEditing.value = false
  } catch (error) {
    hasError.value = true
    errorMessage.value = error instanceof Error ? error.message : 'Ошибка при изменении статуса'
    emit('error', error instanceof Error ? error : new Error('Unknown error'))
  }
}

const handleDropdownBlur = (): void => {
  // Small delay to allow for option selection
  setTimeout(() => {
    isEditing.value = false
    selectedStatus.value = props.status
  }, 150)
}

const handleEscapeKey = (): void => {
  isEditing.value = false
  selectedStatus.value = props.status
}

// Watch for prop changes
watch(() => props.status, (newStatus) => {
  selectedStatus.value = newStatus
  hasError.value = false
  errorMessage.value = ''
})
</script>

<style scoped>
.workflow-status-chip {
  display: inline-block;
}

.workflow-status-chip__display--clickable {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.workflow-status-chip__display--clickable:hover {
  opacity: 0.8;
}

.workflow-status-chip__display--clickable:focus {
  outline: 2px solid var(--v-theme-primary);
  outline-offset: 2px;
}

.workflow-status-chip__display--error {
  border: 1px solid var(--v-theme-error) !important;
}

.workflow-status-chip__display--loading {
  opacity: 0.6;
}

.workflow-status-chip__display--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.workflow-status-select {
  min-width: 140px;
}

/* Small size adjustments */
.workflow-status-select--small {
  min-width: 120px;
}

/* Medium size adjustments */
.workflow-status-select--medium {
  min-width: 140px;
}

/* Large size adjustments */
.workflow-status-select--large {
  min-width: 160px;
}

.workflow-status-chip__error {
  color: var(--v-theme-error);
  font-size: 0.75rem;
  margin-top: 4px;
}

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