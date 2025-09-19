<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Вход в систему</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                label="Имя пользователя"
                name="username"
                prepend-icon="mdi-account"
                type="text"
                variant="outlined"
                class="mb-3"
              />
              <v-text-field
                label="Пароль"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                variant="outlined"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="login">
              Войти
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const login = () => {
  // TODO: Implement actual login logic
  router.push('/dashboard')
}
</script>