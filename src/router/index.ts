import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import type { UserRole } from '@/types'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Login route (no layout)
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },

    // Main application routes (with layout)
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        // Redirect root to dashboard
        {
          path: '',
          redirect: '/dashboard',
        },

        // Dashboard
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },

        // Epics
        {
          path: '/epics',
          name: 'epics',
          component: () => import('@/views/EpicsListView.vue'),
        },
        {
          path: '/epics/:id',
          name: 'epic-detail',
          component: () => import('@/views/EpicDetailView.vue'),
        },

        // User Stories
        {
          path: '/user-stories',
          name: 'user-stories',
          component: () => import('@/views/UserStoriesListView.vue'),
        },
        {
          path: '/user-stories/:id',
          name: 'user-story-detail',
          component: () => import('@/views/UserStoryDetailView.vue'),
        },

        // Requirements
        {
          path: '/requirements',
          name: 'requirements',
          component: () => import('@/views/RequirementsListView.vue'),
        },
        {
          path: '/requirements/:id',
          name: 'requirement-detail',
          component: () => import('@/views/RequirementDetailView.vue'),
        },

        // Steering Documents
        {
          path: '/steering-documents/:referenceId',
          name: 'steering-document-detail',
          component: () => import('@/views/SteeringDocumentDetailView.vue'),
          meta: { requiresAuth: true },
        },

        // Search
        {
          path: '/search',
          name: 'search',
          component: () => import('@/views/SearchView.vue'),
        },

        // Demo Index (for development)
        {
          path: '/demo',
          name: 'demo-index',
          component: () => import('@/views/DemoIndexView.vue'),
        },

        // Form Components Demo (for development)
        {
          path: '/demo/forms',
          name: 'forms-demo',
          component: () => import('@/components/forms/FormComponentsDemo.vue'),
        },

        // MarkdownViewer Demo (for development)
        {
          path: '/demo/markdown-viewer',
          name: 'markdown-viewer-demo',
          component: () => import('@/views/MarkdownViewerDemo.vue'),
        },

        // Status Components Playground (for development)
        {
          path: '/demo/status-components',
          name: 'status-components-playground',
          component: () => import('@/views/StatusComponentPlaygroundView.vue'),
        },

        // Priority Component Playground (for development)
        {
          path: '/demo/priority-component',
          name: 'priority-component-playground',
          component: () => import('@/views/PriorityComponentPlaygroundView.vue'),
        },

        // Admin routes
        {
          path: '/admin/users',
          name: 'admin-users',
          component: () => import('@/views/admin/UsersManagementView.vue'),
          meta: { requiresRole: 'Administrator' },
        },
        {
          path: '/admin/config',
          name: 'admin-config',
          component: () => import('@/views/admin/ConfigManagementView.vue'),
          meta: { requiresRole: 'Administrator' },
        },
      ],
    },

    // Catch all route - redirect to dashboard
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

// Authentication guard
router.beforeEach(async (to, from, next) => {
  // Import auth store dynamically to avoid circular dependency
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth !== false) {
    if (!authStore.isAuthenticated) {
      // Store the intended destination for redirect after login
      const redirectQuery = to.fullPath !== '/' ? { redirect: to.fullPath } : {}
      next({
        path: '/login',
        query: redirectQuery,
      })
      return
    }

    // Check role-based access
    if (to.meta.requiresRole) {
      const requiredRole = to.meta.requiresRole as string

      if (!authStore.hasRole(requiredRole as UserRole)) {
        // Redirect to dashboard if insufficient permissions
        next('/dashboard')
        return
      }
    }
  } else {
    // If going to login page but already authenticated, redirect to dashboard
    if (to.path === '/login' && authStore.isAuthenticated) {
      next('/dashboard')
      return
    }
  }

  next()
})

export default router
