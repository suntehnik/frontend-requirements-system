<template>
  <v-form ref="formRef" v-model="isValid" @submit.prevent="handleSubmit">
    <v-card>
      <v-card-title>
        <span class="text-h5">Создать пользовательскую историю</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.title"
                label="Название истории"
                variant="outlined"
                :rules="titleRules"
                :counter="500"
                required
                autofocus
                :disabled="loading"
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
                :counter="50000"
                rows="4"
                placeholder="As [role], I want [function], so that [goal]"
                :disabled="loading"
                @focus="handleDescriptionFocus"
              >
                <template #append-inner>
                  <v-tooltip text="Заполнить шаблон">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-auto-fix"
                        size="small"
                        variant="text"
                        @click="fillTemplate"
                        :disabled="loading"
                      />
                    </template>
                  </v-tooltip>
                </template>
              </v-textarea>
              <v-alert
                v-if="showTemplateHint"
                type="info"
                variant="tonal"
                density="compact"
                class="mt-2"
              >
                <div class="text-caption">
                  <strong>Шаблон:</strong> As [role], I want [function], so that [goal]
                  <br />
                  <strong>Пример:</strong> As a user, I want to create requirements, so that I can track project needs
                </div>
              </v-alert>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-select
                v-model="form.epic_id"
                :items="epicOptions"
                label="Эпик"
                variant="outlined"
                :rules="epicRules"
                :loading="loadingEpics"
                :disabled="loading"
                item-title="title"
                item-value="id"
                required
                placeholder="Выберите эпик"
              >
                <template #selection="{ item }">
                  <div class="d-flex align-center">
                    <v-chip
                      :color="getStatusColor(item.raw.status)"
                      size="x-small"
                      variant="flat"
                      class="mr-2"
                    >
                      {{ item.raw.reference_id }}
                    </v-chip>
                    <span>{{ item.raw.title }}</span>
                  </div>
                </template>

                <template #item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-chip
                        :color="getStatusColor(item.raw.status)"
                        :text="item.raw.reference_id"
                        size="x-small"
                        variant="flat"
                      />
                    </template>
                    <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.status }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <PrioritySelector
                v-model="form.priority"
                label="Приоритет"
                variant="outlined"
                :rules="priorityRules"
                :disabled="loading"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <UserSelector
                v-model="form.assignee_id"
                label="Ответственный"
                variant="outlined"
                :disabled="loading"
                clearable
                placeholder="Выберите ответственного"
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
          data-testid="submit-button"
        >
          Создать
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { PrioritySelector, UserSelector } from '@/components/forms'
import { useEntitiesStore } from '@/stores/entities'
import {
  validateUserStoryTemplate,
  getUserStoryTemplateErrorMessage,
  fillUserStoryTemplate,
} from '@/utils/user-story-validators'
import type {
  CreateUserStoryRequest,
  Priority,
  EpicStatus,
  UserStoryFormProps,
  UserStoryFormEmits,
  ValidationRule,
} from '@/types'

const props = withDefaults(defineProps<UserStoryFormProps>(), {
  loading: false,
})

const emit = defineEmits<UserStoryFormEmits>()

// Stores
const entitiesStore = useEntitiesStore()

// Form state
const formRef = ref()
const isValid = ref(false)
const showTemplateHint = ref(false)

const form = ref<{
  title: string
  description: string
  epic_id: string | null
  priority: Priority | null
  assignee_id: string | null
}>({
  title: '',
  description: fillUserStoryTemplate(''), // Заполняем шаблон сразу при инициализации
  epic_id: null,
  priority: null,
  assignee_id: null,
})

// Computed
const loadingEpics = computed(() => entitiesStore.loading['epics'] || false)

const epicOptions = computed(() => {
  return entitiesStore.epicsList
    .filter((epic) => epic.status !== 'Done' && epic.status !== 'Cancelled')
    .sort((a, b) => a.title.localeCompare(b.title))
})

// Validation rules
const titleRules: ValidationRule[] = [
  (v: unknown) => !!v || 'Название обязательно',
  (v: unknown) =>
    (typeof v === 'string' && v.length <= 500) || 'Название не должно превышать 500 символов',
  (v: unknown) => (typeof v === 'string' && v.trim().length > 0) || 'Название не может быть пустым',
]

const descriptionRules: ValidationRule[] = [
  (v: unknown) => {
    if (!v || (typeof v === 'string' && v.trim() === '')) {
      return 'Описание обязательно'
    }
    return true
  },
  (v: unknown) =>
    !v ||
    (typeof v === 'string' && v.length <= 50000) ||
    'Описание не должно превышать 50000 символов',
  (v: unknown) => {
    if (!v || typeof v !== 'string') return true
    const trimmedValue = v.trim()
    if (trimmedValue === '') return true
    
    return validateUserStoryTemplate(trimmedValue) || getUserStoryTemplateErrorMessage()
  },
]

const epicRules: ValidationRule[] = [(v: unknown) => !!v || 'Эпик обязателен']

const priorityRules: ValidationRule[] = [(v: unknown) => v !== null || 'Приоритет обязателен']

// Methods
const getStatusColor = (status: EpicStatus): string => {
  switch (status) {
    case 'Backlog':
      return 'grey'
    case 'Draft':
      return 'orange'
    case 'In Progress':
      return 'blue'
    case 'Done':
      return 'green'
    case 'Cancelled':
      return 'red'
    default:
      return 'grey'
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  const data: CreateUserStoryRequest = {
    title: form.value.title.trim(),
    description: form.value.description.trim() || undefined,
    epic_id: form.value.epic_id!,
    priority: form.value.priority!,
    assignee_id: form.value.assignee_id || undefined,
  }

  emit('submit', data)
}

const handleCancel = () => {
  emit('cancel')
}

const handleDescriptionFocus = () => {
  showTemplateHint.value = true
}

const fillTemplate = () => {
  form.value.description = fillUserStoryTemplate('')
  showTemplateHint.value = true
}

const resetForm = () => {
  formRef.value?.reset()
  form.value = {
    title: '',
    description: fillUserStoryTemplate(''), // Заполняем шаблон при сбросе формы
    epic_id: null,
    priority: null,
    assignee_id: null,
  }
  showTemplateHint.value = false
}

const loadEpics = async () => {
  try {
    // Load epics if not already loaded or if the list is empty
    if (entitiesStore.epicsList.length === 0) {
      await entitiesStore.fetchEpics({ limit: 100, order_by: 'title' })
    }
  } catch (error) {
    console.error('Failed to load epics:', error)
  }
}

// Watch for form reset when loading changes
watch(
  () => props.loading,
  (newLoading, oldLoading) => {
    // Reset form when loading changes from true to false (after successful submission)
    if (oldLoading && !newLoading) {
      resetForm()
    }
  },
)

// Lifecycle
onMounted(() => {
  loadEpics()
  // Показываем подсказку сразу при открытии формы
  showTemplateHint.value = true
})

// Expose methods for parent component
defineExpose({
  resetForm,
})
</script>
