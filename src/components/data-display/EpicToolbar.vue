<template>
  <div class="epic-toolbar d-flex align-center ga-3 mb-4">
    <!-- Status Chip -->
    <div class="position-relative">
      <v-chip
        v-if="!showStatusDropdown"
        :color="getStatusColor(localStatus)"
        size="large"
        :loading="updating"
        @click="toggleStatusDropdown"
        class="toolbar-chip"
        rounded="xl"
      >
        {{ getStatusText(localStatus) }}
      </v-chip>

      <v-select
        v-else
        v-model="localStatus"
        :items="statusOptions"
        item-title="text"
        item-value="value"
        variant="outlined"
        density="compact"
        hide-details
        style="min-width: 140px"
        :loading="updating"
        @update:model-value="updateStatus"
        @blur="hideStatusDropdown"
        ref="statusSelectRef"
      />
    </div>

    <!-- Priority Chip -->
    <div class="position-relative">
      <v-chip
        v-if="!showPriorityDropdown"
        :color="getPriorityColor(localPriority)"
        variant="outlined"
        size="large"
        :loading="updating"
        @click="togglePriorityDropdown"
        class="toolbar-chip"
        rounded="xl"
      >
        {{ getPriorityText(localPriority) }}
      </v-chip>

      <v-select
        v-else
        v-model="localPriority"
        :items="priorityOptions"
        item-title="text"
        item-value="value"
        variant="outlined"
        density="compact"
        hide-details
        style="min-width: 140px"
        :loading="updating"
        @update:model-value="updatePriority"
        @blur="hidePriorityDropdown"
        ref="prioritySelectRef"
      />
    </div>

    <!-- Assignee Chip -->
    <div class="position-relative">
      <v-chip
        v-if="!showAssigneeDropdown"
        color="grey-lighten-3"
        size="large"
        :loading="updating || usersLoading"
        @click="toggleAssigneeDropdown"
        class="toolbar-chip assignee-chip"
        rounded="xl"
      >
        <v-icon start size="small">mdi-account</v-icon>
        {{ getAssigneeText() }}
      </v-chip>

      <v-select
        v-else
        v-model="localAssigneeId"
        :items="assigneeOptions"
        item-title="text"
        item-value="value"
        variant="outlined"
        density="compact"
        hide-details
        style="min-width: 160px"
        :loading="updating || usersLoading"
        @update:model-value="updateAssignee"
        @blur="hideAssigneeDropdown"
        ref="assigneeSelectRef"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { epicService } from '@/services/epic-service'
import type { Epic, User, EpicStatus, Priority } from '@/types'

interface Props {
  epic: Epic
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [epic: Epic]
}>()

// Local state for inline editing
const localStatus = ref(props.epic.status)
const localPriority = ref(props.epic.priority)
const localAssigneeId = ref(props.epic.assignee_id || null)
const updating = ref(false)
const usersLoading = ref(false)
const users = ref<User[]>([])

// Dropdown visibility states
const showStatusDropdown = ref(false)
const showPriorityDropdown = ref(false)
const showAssigneeDropdown = ref(false)

// Refs for select components
const statusSelectRef = ref()
const prioritySelectRef = ref()
const assigneeSelectRef = ref()

// Status options
const statusOptions = [
  { text: 'Бэклог', value: 'Backlog' },
  { text: 'Черновик', value: 'Draft' },
  { text: 'В работе', value: 'In Progress' },
  { text: 'Выполнено', value: 'Done' },
  { text: 'Отменено', value: 'Cancelled' },
]

// Priority options
const priorityOptions = [
  { text: 'Критический', value: 1 },
  { text: 'Высокий', value: 2 },
  { text: 'Средний', value: 3 },
  { text: 'Низкий', value: 4 },
]

// Assignee options
const assigneeOptions = computed(() => [
  { text: 'Не назначен', value: null },
  ...users.value.map((user) => ({
    text: user.username,
    value: user.id,
  })),
])

// Watch for epic changes to update local state
watch(
  () => props.epic,
  (newEpic) => {
    localStatus.value = newEpic.status
    localPriority.value = newEpic.priority
    localAssigneeId.value = newEpic.assignee_id || null
  },
  { deep: true },
)

// Load users for assignee dropdown
const loadUsers = async () => {
  try {
    usersLoading.value = true
    // This would typically come from a user service
    // For now, we'll use the current user and assignee if available
    const currentUsers: User[] = []

    if (props.epic.creator) {
      currentUsers.push(props.epic.creator)
    }

    if (props.epic.assignee && !currentUsers.find((u) => u.id === props.epic.assignee?.id)) {
      currentUsers.push(props.epic.assignee)
    }

    users.value = currentUsers
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    usersLoading.value = false
  }
}

// Dropdown toggle methods
const toggleStatusDropdown = async () => {
  showStatusDropdown.value = true
  await nextTick()
  statusSelectRef.value?.focus()
}

const togglePriorityDropdown = async () => {
  showPriorityDropdown.value = true
  await nextTick()
  prioritySelectRef.value?.focus()
}

const toggleAssigneeDropdown = async () => {
  showAssigneeDropdown.value = true
  await nextTick()
  assigneeSelectRef.value?.focus()
}

// Dropdown hide methods
const hideStatusDropdown = () => {
  showStatusDropdown.value = false
}

const hidePriorityDropdown = () => {
  showPriorityDropdown.value = false
}

const hideAssigneeDropdown = () => {
  showAssigneeDropdown.value = false
}

// Update methods with auto-save
const updateStatus = async (newStatus: string) => {
  if (newStatus === props.epic.status) {
    hideStatusDropdown()
    return
  }

  try {
    updating.value = true
    const updatedEpic = await epicService.changeStatus(props.epic.id, newStatus as EpicStatus)
    emit('updated', updatedEpic)
    hideStatusDropdown()
  } catch (error) {
    console.error('Failed to update status:', error)
    // Revert local state on error
    localStatus.value = props.epic.status
    hideStatusDropdown()
  } finally {
    updating.value = false
  }
}

const updatePriority = async (newPriority: number) => {
  if (newPriority === props.epic.priority) {
    hidePriorityDropdown()
    return
  }

  try {
    updating.value = true
    const updatedEpic = await epicService.update(props.epic.id, {
      priority: newPriority as Priority,
    })
    emit('updated', updatedEpic)
    hidePriorityDropdown()
  } catch (error) {
    console.error('Failed to update priority:', error)
    // Revert local state on error
    localPriority.value = props.epic.priority
    hidePriorityDropdown()
  } finally {
    updating.value = false
  }
}

const updateAssignee = async (newAssigneeId: string | null) => {
  if (newAssigneeId === props.epic.assignee_id) {
    hideAssigneeDropdown()
    return
  }

  try {
    updating.value = true
    const updatedEpic = await epicService.assign(props.epic.id, newAssigneeId || undefined)
    emit('updated', updatedEpic)
    hideAssigneeDropdown()
  } catch (error) {
    console.error('Failed to update assignee:', error)
    // Revert local state on error
    localAssigneeId.value = props.epic.assignee_id || null
    hideAssigneeDropdown()
  } finally {
    updating.value = false
  }
}

// Utility functions for display
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Backlog: 'grey',
    Draft: 'orange',
    'In Progress': 'blue',
    Done: 'green',
    Cancelled: 'red',
  }
  return colors[status] || 'grey'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    Backlog: 'Бэклог',
    Draft: 'Черновик',
    'In Progress': 'В работе',
    Done: 'Выполнено',
    Cancelled: 'Отменено',
  }
  return texts[status] || status
}

const getPriorityColor = (priority: number) => {
  const colors: Record<number, string> = {
    1: 'red',
    2: 'orange',
    3: 'blue',
    4: 'green',
  }
  return colors[priority] || 'grey'
}

const getPriorityText = (priority: number) => {
  const texts: Record<number, string> = {
    1: 'Критический',
    2: 'Высокий',
    3: 'Средний',
    4: 'Низкий',
  }
  return texts[priority] || 'Неизвестно'
}

const getAssigneeText = () => {
  const assignee = users.value.find((u) => u.id === localAssigneeId.value)
  return assignee?.username || 'Не назначен'
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.epic-toolbar {
  flex-wrap: wrap;
}

.toolbar-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.assignee-chip {
  color: rgb(var(--v-theme-on-surface)) !important;
}

.position-relative {
  position: relative;
}

/* Dropdown styles */
:deep(.v-field__input) {
  min-height: 32px;
}
</style>
