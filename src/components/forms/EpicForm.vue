<template>
  <v-form ref="formRef" v-model="isValid" @submit.prevent="handleSubmit">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEditing ? 'Редактировать эпик' : 'Создать эпик' }}</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.title"
                label="Название эпика"
                variant="outlined"
                :rules="titleRules"
                :counter="500"
                required
                autofocus
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Описание"
                variant="outlined"
                :rules="descriptionRules"
                :counter="5000"
                rows="4"
                placeholder="Подробное описание эпика"
                :disabled="loading"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <PrioritySelector
                v-model="form.priority"
                label="Приоритет"
                variant="outlined"
                :rules="priorityRules"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <UserSelector
                v-model="form.assignee_id"
                label="Ответственный"
                variant="outlined"
                clearable
                placeholder="Выберите ответственного"
              />
            </v-col>
          </v-row>

          <v-row v-if="isEditing">
            <v-col cols="12" md="6">
              <StatusSelector
                v-model="currentStatus"
                label="Статус"
                variant="outlined"
                entity-type="epic"
                :disabled="!canChangeStatus"
                @update:model-value="handleStatusChange"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="handleCancel"
          :disabled="loading"
          data-testid="cancel-button"
        >
          Отмена
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          type="submit"
          :loading="loading"
          :disabled="!isValid"
        >
          {{ isEditing ? 'Сохранить' : 'Создать' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { PrioritySelector, StatusSelector, UserSelector } from '@/components/forms'
import type {
  Epic,
  CreateEpicRequest,
  UpdateEpicRequest,
  EpicStatus,
  UserStoryStatus,
  RequirementStatus,
  Priority,
} from '@/types'

type StatusValue = EpicStatus | UserStoryStatus | RequirementStatus

interface Props {
  epic?: Epic
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: CreateEpicRequest | UpdateEpicRequest): void
  (e: 'cancel'): void
  (e: 'status-change', epicId: string, status: EpicStatus): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

// Form state
const formRef = ref()
const isValid = ref(false)
const currentStatus = ref<EpicStatus>()

const form = ref<{
  title: string
  description: string
  priority: Priority | null
  assignee_id: string | null
}>({
  title: '',
  description: '',
  priority: null,
  assignee_id: null,
})

// Computed
const isEditing = computed(() => Boolean(props.epic))
const canChangeStatus = computed(() => isEditing.value && !props.loading)

// Validation rules
const titleRules = [
  (v: string) => !!v || 'Название обязательно',
  (v: string) => (v && v.length <= 500) || 'Название не должно превышать 500 символов',
  (v: string) => (v && v.trim().length > 0) || 'Название не может быть пустым',
]

const descriptionRules = [
  (v: string) => !v || v.length <= 5000 || 'Описание не должно превышать 5000 символов',
]

const priorityRules = [(v: Priority | null) => v !== null || 'Приоритет обязателен']

// Methods
const initializeForm = () => {
  if (props.epic) {
    form.value = {
      title: props.epic.title,
      description: props.epic.description || '',
      priority: props.epic.priority,
      assignee_id: props.epic.assignee_id || null,
    }
    currentStatus.value = props.epic.status
  } else {
    form.value = {
      title: '',
      description: '',
      priority: null,
      assignee_id: null,
    }
    currentStatus.value = undefined
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  const data = {
    title: form.value.title.trim(),
    description: form.value.description.trim() || undefined,
    priority: form.value.priority!,
    assignee_id: form.value.assignee_id || undefined,
  }

  emit('submit', data)
}

const handleCancel = () => {
  emit('cancel')
}

const handleStatusChange = (newStatus: StatusValue | null) => {
  if (props.epic && newStatus && newStatus !== props.epic.status) {
    // Type guard to ensure newStatus is EpicStatus
    const epicStatuses: EpicStatus[] = ['Backlog', 'Draft', 'In Progress', 'Done', 'Cancelled']
    if (epicStatuses.includes(newStatus as EpicStatus)) {
      emit('status-change', props.epic.id, newStatus as EpicStatus)
    }
  }
}

const resetForm = () => {
  formRef.value?.reset()
  initializeForm()
}

// Watch for epic changes
watch(
  () => props.epic,
  () => {
    initializeForm()
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  initializeForm()
})

// Expose methods for parent component
defineExpose({
  resetForm,
})
</script>
