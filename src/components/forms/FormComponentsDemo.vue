<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2 class="text-h4 mb-4">Form Components Demo</h2>
        <p class="text-body-1 mb-6">
          Демонстрация базовых компонентов форм для системы управления требованиями.
        </p>
      </v-col>
    </v-row>

    <BaseForm @submit="handleSubmit" @valid="handleValidChange">
      <template #default="{ isValid, loading }">
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="pa-4 mb-4">
              <v-card-title>PrioritySelector</v-card-title>
              <PrioritySelector
                v-model="formData.priority"
                label="Приоритет задачи"
                :rules="[(v) => v !== null || 'Выберите приоритет']"
              />
              <v-card-text class="pt-2">
                <strong>Выбранное значение:</strong> {{ formData.priority }}
                <br>
                <strong>Лейбл:</strong> {{ priorityLabel }}
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="pa-4 mb-4">
              <v-card-title>StatusSelector</v-card-title>
              <StatusSelector
                v-model="formData.epicStatus"
                entity-type="epic"
                label="Статус эпика"
                :rules="[(v) => !!v || 'Выберите статус']"
              />
              <v-card-text class="pt-2">
                <strong>Выбранное значение:</strong> {{ formData.epicStatus }}
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="pa-4 mb-4">
              <v-card-title>StatusSelector (User Story)</v-card-title>
              <StatusSelector
                v-model="formData.userStoryStatus"
                entity-type="user_story"
                :rules="[(v) => !!v || 'Выберите статус']"
              />
              <v-card-text class="pt-2">
                <strong>Выбранное значение:</strong> {{ formData.userStoryStatus }}
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="pa-4 mb-4">
              <v-card-title>StatusSelector (Requirement)</v-card-title>
              <StatusSelector
                v-model="formData.requirementStatus"
                entity-type="requirement"
                :rules="[(v) => !!v || 'Выберите статус']"
              />
              <v-card-text class="pt-2">
                <strong>Выбранное значение:</strong> {{ formData.requirementStatus }}
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-card class="pa-4 mb-4">
              <v-card-title>UserSelector</v-card-title>
              <UserSelector
                v-model="formData.assigneeId"
                label="Ответственный"
                placeholder="Выберите ответственного"
                clearable
              />
              <v-card-text class="pt-2">
                <strong>Выбранный ID:</strong> {{ formData.assigneeId }}
                <br>
                <strong>Имя пользователя:</strong> {{ assigneeName }}
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-card class="pa-4">
              <v-card-title>Состояние формы</v-card-title>
              <v-card-text>
                <v-chip
                  :color="isValid ? 'success' : 'error'"
                  :text="isValid ? 'Форма валидна' : 'Форма невалидна'"
                  class="mr-2"
                />
                <v-chip
                  :color="loading ? 'warning' : 'info'"
                  :text="loading ? 'Загрузка...' : 'Готово'"
                />
              </v-card-text>
              
              <v-card-actions>
                <v-btn
                  type="submit"
                  color="primary"
                  :disabled="!isValid || loading"
                  :loading="loading"
                >
                  Отправить форму
                </v-btn>
                <v-btn
                  variant="outlined"
                  @click="resetForm"
                >
                  Сбросить
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </BaseForm>

    <!-- Debug info -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title>Debug Info</v-card-title>
          <v-card-text>
            <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import BaseForm from './BaseForm.vue'
import PrioritySelector from './PrioritySelector.vue'
import StatusSelector from './StatusSelector.vue'
import UserSelector from './UserSelector.vue'
import type { Priority, EpicStatus, UserStoryStatus, RequirementStatus } from '@/types'

// Store
const configStore = useConfigStore()

// Form data
const formData = ref({
  priority: null as Priority | null,
  epicStatus: null as EpicStatus | null,
  userStoryStatus: null as UserStoryStatus | null,
  requirementStatus: null as RequirementStatus | null,
  assigneeId: null as string | null,
})

// Computed
const priorityLabel = computed(() => {
  if (!formData.value.priority) return 'Не выбрано'
  const options = [
    { value: 1, label: 'Критический' },
    { value: 2, label: 'Высокий' },
    { value: 3, label: 'Средний' },
    { value: 4, label: 'Низкий' },
  ]
  return options.find(opt => opt.value === formData.value.priority)?.label || 'Неизвестно'
})

const assigneeName = computed(() => {
  if (!formData.value.assigneeId) return 'Не выбрано'
  const user = configStore.getUserById(formData.value.assigneeId)
  return user ? `${user.username} (${user.email})` : 'Пользователь не найден'
})

// Methods
const handleSubmit = () => {
  console.log('Form submitted:', formData.value)
  alert('Форма отправлена! Проверьте консоль для деталей.')
}

const handleValidChange = (isValid: boolean) => {
  console.log('Form validity changed:', isValid)
}

const resetForm = () => {
  formData.value = {
    priority: null,
    epicStatus: null,
    userStoryStatus: null,
    requirementStatus: null,
    assigneeId: null,
  }
}

// Load config data on mount
onMounted(async () => {
  await configStore.fetchAllConfig()
})
</script>