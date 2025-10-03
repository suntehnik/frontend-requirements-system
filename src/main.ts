import './assets/main.css'
import './assets/tailwind.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

// Import markdown editor
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(MdEditor)

// Initialize auth store after pinia is set up
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
authStore.initializeAuth()

// Import dev testing utilities in development
if (import.meta.env.DEV) {
  import('@/utils/dev-auth-test')
}

app.mount('#app')
