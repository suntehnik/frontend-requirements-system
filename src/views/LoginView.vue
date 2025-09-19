<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Вход в систему</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="pa-6">
            <LoginForm :loading="loading" :error="errorMessage" @submit="handleLogin" />
          </v-card-text>

          <!-- Forgot password link -->
          <v-card-actions class="px-6 pb-6">
            <v-spacer />
            <v-btn variant="text" color="primary" size="small" @click="showForgotPassword">
              Забыли пароль?
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Forgot password dialog -->
    <v-dialog v-model="forgotPasswordDialog" max-width="400">
      <v-card>
        <v-card-title>Восстановление пароля</v-card-title>
        <v-card-text>
          <p class="mb-4">Для восстановления пароля обратитесь к администратору системы.</p>
          <v-text-field
            label="Email администратора"
            value="admin@company.com"
            readonly
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="forgotPasswordDialog = false">
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginForm from '@/components/forms/LoginForm.vue'
import type { LoginRequest } from '@/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// State
const loading = ref(false)
const errorMessage = ref('')
const forgotPasswordDialog = ref(false)

// Methods
const handleLogin = async (credentials: LoginRequest) => {
  loading.value = true
  errorMessage.value = ''

  try {
    await authStore.login(credentials)

    // Redirect to intended page or dashboard
    const redirectTo = (route.query.redirect as string) || '/dashboard'
    await router.push(redirectTo)
  } catch (error: unknown) {
    console.error('Login failed:', error)

    // Handle different error types
    const apiError = error as { status?: number; code?: string; message?: string }

    if (apiError.status === 401) {
      errorMessage.value = 'Неверное имя пользователя или пароль'
    } else if (apiError.status === 403) {
      errorMessage.value = 'Доступ запрещен'
    } else if (apiError.code === 'NETWORK_ERROR') {
      errorMessage.value = 'Ошибка сети. Проверьте подключение к интернету'
    } else {
      errorMessage.value = apiError.message || 'Произошла ошибка при входе в систему'
    }
  } finally {
    loading.value = false
  }
}

const showForgotPassword = () => {
  forgotPasswordDialog.value = true
}

// Check if user is already authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    const redirectTo = (route.query.redirect as string) || '/dashboard'
    router.push(redirectTo)
  }
})
</script>
