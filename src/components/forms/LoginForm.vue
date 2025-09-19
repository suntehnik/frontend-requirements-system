<template>
  <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
    <v-text-field
      v-model="credentials.username"
      label="Имя пользователя"
      name="username"
      prepend-icon="mdi-account"
      type="text"
      variant="outlined"
      class="mb-3"
      :rules="usernameRules"
      :error-messages="fieldErrors.username"
      :disabled="loading"
      required
      autocomplete="username"
    />

    <v-text-field
      v-model="credentials.password"
      label="Пароль"
      name="password"
      prepend-icon="mdi-lock"
      :type="showPassword ? 'text' : 'password'"
      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      variant="outlined"
      class="mb-4"
      :rules="passwordRules"
      :error-messages="fieldErrors.password"
      :disabled="loading"
      required
      autocomplete="current-password"
      @click:append-inner="showPassword = !showPassword"
    />

    <!-- General error message -->
    <v-alert v-if="generalError" type="error" variant="tonal" class="mb-4" :text="generalError" />

    <v-btn
      type="submit"
      color="primary"
      size="large"
      block
      :loading="loading"
      :disabled="!isFormValid || loading"
    >
      Войти
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { LoginRequest } from '@/types'

// Props & Emits
interface Props {
  loading?: boolean
  error?: string
}

interface Emits {
  (e: 'submit', credentials: LoginRequest): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: '',
})

const emit = defineEmits<Emits>()

// Form state
const formRef = ref()
const isFormValid = ref(false)
const showPassword = ref(false)

const credentials = reactive<LoginRequest>({
  username: '',
  password: '',
})

const fieldErrors = reactive({
  username: [] as string[],
  password: [] as string[],
})

// Validation rules
const usernameRules = [
  (v: string) => !!v || 'Имя пользователя обязательно',
  (v: string) => (v && v.length >= 3) || 'Имя пользователя должно содержать минимум 3 символа',
  (v: string) => (v && v.length <= 50) || 'Имя пользователя не должно превышать 50 символов',
]

const passwordRules = [
  (v: string) => !!v || 'Пароль обязателен',
  (v: string) => (v && v.length >= 8) || 'Пароль должен содержать минимум 8 символов',
]

// Computed
const generalError = computed(() => {
  // Show prop error if it's not a field-specific error
  if (props.error && !props.error.includes('username') && !props.error.includes('password')) {
    return props.error
  }
  return ''
})

// Methods
const handleSubmit = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (valid) {
    // Clear previous field errors
    fieldErrors.username = []
    fieldErrors.password = []

    emit('submit', { ...credentials })
  }
}

// Watch for prop errors and map them to field errors
watch(
  () => props.error,
  (newError) => {
    if (newError) {
      // Clear previous field errors
      fieldErrors.username = []
      fieldErrors.password = []

      // Map specific errors to fields
      if (newError.toLowerCase().includes('username')) {
        fieldErrors.username = [newError]
      } else if (newError.toLowerCase().includes('password')) {
        fieldErrors.password = [newError]
      }
    }
  },
  { immediate: true },
)

// Expose form validation method
defineExpose({
  validate: () => formRef.value?.validate(),
  reset: () => {
    formRef.value?.reset()
    credentials.username = ''
    credentials.password = ''
    fieldErrors.username = []
    fieldErrors.password = []
  },
})
</script>
