<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h1 class="text-h4">Управление пользователями</h1>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
            Создать пользователя
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Поиск пользователей"
              single-line
              hide-details
              variant="outlined"
              density="compact"
            />
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="users"
            :search="search"
            class="elevation-1"
          >
            <template v-slot:item.role="{ item }">
              <v-chip
                :color="getRoleColor(item.role)"
                size="small"
              >
                {{ getRoleLabel(item.role) }}
              </v-chip>
            </template>
            
            <template v-slot:item.created_at="{ item }">
              {{ formatDate(item.created_at) }}
            </template>
            
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="openEditDialog(item)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="openDeleteDialog(item)"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create/Edit User Dialog -->
    <v-dialog v-model="userDialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editingUser ? 'Редактировать пользователя' : 'Создать пользователя' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="userForm" v-model="formValid">
            <v-text-field
              v-model="userForm.username"
              label="Имя пользователя"
              :rules="[rules.required]"
              variant="outlined"
              class="mb-3"
            />
            
            <v-text-field
              v-model="userForm.email"
              label="Email"
              :rules="[rules.required, rules.email]"
              variant="outlined"
              class="mb-3"
            />
            
            <v-select
              v-model="userForm.role"
              :items="roleOptions"
              label="Роль"
              :rules="[rules.required]"
              variant="outlined"
              class="mb-3"
            />
            
            <v-text-field
              v-if="!editingUser"
              v-model="userForm.password"
              label="Пароль"
              type="password"
              :rules="[rules.required, rules.minLength]"
              variant="outlined"
            />
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeUserDialog">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="saveUser"
            :disabled="!formValid"
          >
            {{ editingUser ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Подтверждение удаления</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить пользователя "{{ userToDelete?.username }}"?
          Это действие нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog = false">Отмена</v-btn>
          <v-btn color="error" @click="deleteUser">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const search = ref('')
const userDialog = ref(false)
const deleteDialog = ref(false)
const formValid = ref(false)
const editingUser = ref<any>(null)
const userToDelete = ref<any>(null)

const headers = [
  { title: 'Имя пользователя', key: 'username', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Роль', key: 'role', sortable: true },
  { title: 'Создан', key: 'created_at', sortable: true },
  { title: 'Последний вход', key: 'last_login', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

// Mock data - will be replaced with real API calls
const users = ref([
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'Administrator',
    created_at: '2024-01-01',
    last_login: '2024-01-20'
  },
  {
    id: '2',
    username: 'ivan.ivanov',
    email: 'ivan@example.com',
    role: 'User',
    created_at: '2024-01-05',
    last_login: '2024-01-19'
  },
  {
    id: '3',
    username: 'petr.petrov',
    email: 'petr@example.com',
    role: 'User',
    created_at: '2024-01-10',
    last_login: '2024-01-18'
  },
  {
    id: '4',
    username: 'anna.sidorova',
    email: 'anna@example.com',
    role: 'Commenter',
    created_at: '2024-01-15',
    last_login: '2024-01-17'
  }
])

const userForm = ref({
  username: '',
  email: '',
  role: '',
  password: ''
})

const roleOptions = [
  { title: 'Администратор', value: 'Administrator' },
  { title: 'Пользователь', value: 'User' },
  { title: 'Комментатор', value: 'Commenter' }
]

const rules = {
  required: (value: string) => !!value || 'Поле обязательно для заполнения',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Некорректный email адрес'
  },
  minLength: (value: string) => value.length >= 8 || 'Минимум 8 символов'
}

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    'Administrator': 'red',
    'User': 'blue',
    'Commenter': 'green'
  }
  return colors[role] || 'grey'
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    'Administrator': 'Администратор',
    'User': 'Пользователь',
    'Commenter': 'Комментатор'
  }
  return labels[role] || role
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const openCreateDialog = () => {
  editingUser.value = null
  userForm.value = {
    username: '',
    email: '',
    role: '',
    password: ''
  }
  userDialog.value = true
}

const openEditDialog = (user: any) => {
  editingUser.value = user
  userForm.value = {
    username: user.username,
    email: user.email,
    role: user.role,
    password: ''
  }
  userDialog.value = true
}

const closeUserDialog = () => {
  userDialog.value = false
  editingUser.value = null
}

const saveUser = () => {
  // TODO: Implement actual save logic
  console.log('Saving user:', userForm.value)
  closeUserDialog()
}

const openDeleteDialog = (user: any) => {
  userToDelete.value = user
  deleteDialog.value = true
}

const deleteUser = () => {
  // TODO: Implement actual delete logic
  console.log('Deleting user:', userToDelete.value)
  deleteDialog.value = false
  userToDelete.value = null
}
</script>