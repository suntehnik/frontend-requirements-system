import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Login route (no layout)
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
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
          redirect: '/dashboard'
        },
        
        // Dashboard
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue')
        },
        
        // Epics
        {
          path: '/epics',
          name: 'epics',
          component: () => import('@/views/EpicsListView.vue')
        },
        {
          path: '/epics/:id',
          name: 'epic-detail',
          component: () => import('@/views/EpicDetailView.vue')
        },
        
        // User Stories
        {
          path: '/user-stories',
          name: 'user-stories',
          component: () => import('@/views/UserStoriesListView.vue')
        },
        {
          path: '/user-stories/:id',
          name: 'user-story-detail',
          component: () => import('@/views/UserStoryDetailView.vue')
        },
        
        // Requirements
        {
          path: '/requirements',
          name: 'requirements',
          component: () => import('@/views/RequirementsListView.vue')
        },
        {
          path: '/requirements/:id',
          name: 'requirement-detail',
          component: () => import('@/views/RequirementDetailView.vue')
        },
        
        // Search
        {
          path: '/search',
          name: 'search',
          component: () => import('@/views/SearchView.vue')
        },
        
        // Admin routes
        {
          path: '/admin/users',
          name: 'admin-users',
          component: () => import('@/views/admin/UsersManagementView.vue'),
          meta: { requiresRole: 'Administrator' }
        },
        {
          path: '/admin/config',
          name: 'admin-config',
          component: () => import('@/views/admin/ConfigManagementView.vue'),
          meta: { requiresRole: 'Administrator' }
        }
      ]
    },
    
    // Catch all route - redirect to dashboard
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard'
    }
  ],
})

// Authentication guard
router.beforeEach((to, from, next) => {
  // Check if route requires authentication
  if (to.meta.requiresAuth !== false) {
    // TODO: Check if user is authenticated
    // For now, we'll assume user is authenticated if not going to login
    const isAuthenticated = to.path !== '/login' // Temporary logic
    
    if (!isAuthenticated) {
      next('/login')
      return
    }
    
    // Check role-based access
    if (to.meta.requiresRole) {
      // TODO: Check user role
      // For now, we'll allow access
      const userRole = 'Administrator' // Temporary - will be replaced with actual auth store
      
      if (to.meta.requiresRole !== userRole) {
        // Redirect to dashboard if insufficient permissions
        next('/dashboard')
        return
      }
    }
  }
  
  next()
})

export default router
