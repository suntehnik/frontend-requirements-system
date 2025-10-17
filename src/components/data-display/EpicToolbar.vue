<template>
  <div class="epic-toolbar d-flex align-center ga-3 mb-4">
    <!-- Status Chip -->
    <WorkflowStatusChip
      :status="localStatus"
      size="large"
      :loading="updating"
      @status-change="updateStatus"
      @error="handleStatusError"
    />

    <!-- Priority Chip -->
    <PriorityChip
      :priority="localPriority"
      size="large"
      variant="outlined"
      :loading="updating"
      @priority-change="updatePriority"
      @error="handlePriorityError"
    />

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

    <!-- Steering Documents Button -->
    <v-btn
      color="primary"
      variant="outlined"
      size="large"
      prepend-icon="mdi-file-document-outline"
      @click="showSteeringDocumentsDialog"
      class="toolbar-chip"
      rounded="xl"
    >
      Steering Documents
    </v-btn>
  </div>

  <!-- Steering Documents Dialog -->
  <EpicSteeringDocumentsDialog
    v-model="steeringDocumentsDialogOpen"
    :epic="epic"
    @documents-updated="handleDocumentsUpdated"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { epicService } from '@/services/epic-service'
import { WorkflowStatusChip } from '@/components/data-display'
import PriorityChip from '@/components/data-display/PriorityChip.vue'
import EpicSteeringDocumentsDialog from '@/components/dialogs/EpicSteeringDocumentsDialog.vue'
import type { Epic, User, EpicStatus, Priority, WorkflowStatus } from '@/types'

interface Props {
  epic: Epic
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [epic: Epic]
  documentsUpdated: []
}>()

// Local state for inline editing
const localStatus = ref<WorkflowStatus>(props.epic.status as WorkflowStatus)
const localPriority = ref(props.epic.priority)
const localAssigneeId = ref(props.epic.assignee_id || null)
const updating = ref(false)
const usersLoading = ref(false)
const users = ref<User[]>([])

// Dropdown visibility states
const showAssigneeDropdown = ref(false)

// Dialog states
const steeringDocumentsDialogOpen = ref(false)

// Refs for select components
const assigneeSelectRef = ref()

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
    localStatus.value = newEpic.status as WorkflowStatus
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
const toggleAssigneeDropdown = async () => {
  showAssigneeDropdown.value = true
  await nextTick()
  assigneeSelectRef.value?.focus()
}

// Dropdown hide methods
const hideAssigneeDropdown = () => {
  showAssigneeDropdown.value = false
}

// Update methods with auto-save
const updateStatus = async (newStatus: WorkflowStatus) => {
  if (newStatus === props.epic.status) {
    return
  }

  try {
    updating.value = true
    const updatedEpic = await epicService.changeStatus(props.epic.id, newStatus as EpicStatus)
    localStatus.value = newStatus
    emit('updated', updatedEpic)
  } catch (error) {
    console.error('Failed to update status:', error)
    // Revert local state on error
    localStatus.value = props.epic.status as WorkflowStatus
    throw error // Re-throw to let WorkflowStatusChip handle the error display
  } finally {
    updating.value = false
  }
}

// Handle status change errors from WorkflowStatusChip
const handleStatusError = (error: Error) => {
  console.error('Status change error:', error)
  // The WorkflowStatusChip will handle the error display
}

// Handle priority change errors from PriorityChip
const handlePriorityError = (error: Error) => {
  console.error('Priority change error:', error)
  // The PriorityChip will handle the error display
}

const updatePriority = async (newPriority: Priority) => {
  if (newPriority === props.epic.priority) {
    return
  }

  try {
    updating.value = true
    const updatedEpic = await epicService.update(props.epic.id, {
      priority: newPriority,
    })
    localPriority.value = newPriority
    emit('updated', updatedEpic)
  } catch (error) {
    console.error('Failed to update priority:', error)
    // Revert local state on error
    localPriority.value = props.epic.priority
    throw error // Re-throw to let PriorityChip handle the error display
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
const getAssigneeText = () => {
  const assignee = users.value.find((u) => u.id === localAssigneeId.value)
  return assignee?.username || 'Не назначен'
}

// Steering Documents Dialog methods
const showSteeringDocumentsDialog = () => {
  steeringDocumentsDialogOpen.value = true
}

const handleDocumentsUpdated = () => {
  emit('documentsUpdated')
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
