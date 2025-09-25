<template>
  <div class="tree-view">
    <!-- Tree Controls -->
    <div class="tree-controls mb-3">
      <v-btn
        size="small"
        variant="text"
        prepend-icon="mdi-expand-all"
        @click="hierarchyStore.expandAll()"
        class="mr-2"
      >
        Развернуть все
      </v-btn>
      <v-btn
        size="small"
        variant="text"
        prepend-icon="mdi-collapse-all"
        @click="hierarchyStore.collapseAll()"
      >
        Свернуть все
      </v-btn>
    </div>

    <!-- Loading State -->
    <div v-if="hierarchyStore.loading" class="text-center py-4">
      <v-progress-circular indeterminate color="primary" />
      <div class="text-body-2 mt-2">Загрузка иерархии...</div>
    </div>

    <!-- Error State -->
    <v-alert v-else-if="hierarchyStore.error" type="error" variant="tonal" class="mb-4">
      {{ hierarchyStore.error }}
      <template #append>
        <v-btn size="small" variant="text" @click="hierarchyStore.loadHierarchy()">
          Повторить
        </v-btn>
      </template>
    </v-alert>

    <!-- Tree Nodes -->
    <div v-else class="tree-nodes">
      <TreeNode
        v-for="node in hierarchyStore.hierarchyData"
        :key="node.entity_id"
        :node="node"
        :level="0"
        @select="handleNodeSelect"
        @toggle="handleNodeToggle"
        @context-menu="handleContextMenu"
      />
    </div>

    <!-- Context Menu -->
    <v-menu
      v-model="contextMenu.show"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      location="bottom start"
      absolute
    >
      <v-list density="compact" min-width="200">
        <v-list-item
          v-for="action in contextMenuActions"
          :key="action.key"
          :prepend-icon="action.icon"
          :disabled="action.disabled"
          @click="handleContextAction(action.key)"
        >
          <v-list-item-title>{{ action.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHierarchyStore } from '@/stores/hierarchy'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import TreeNode from './TreeNode.vue'
import type { HierarchyNode } from '@/types/hierarchy'

const router = useRouter()
const hierarchyStore = useHierarchyStore()
const uiStore = useUIStore()
const authStore = useAuthStore()

// Context menu state
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  node: null as HierarchyNode | null,
})

// Context menu actions based on user role and entity type
const contextMenuActions = computed(() => {
  if (!contextMenu.value.node) return []

  const node = contextMenu.value.node
  const canEdit = authStore.hasRole('Administrator') || authStore.hasRole('User')
  const canComment =
    authStore.hasRole('Administrator') ||
    authStore.hasRole('User') ||
    authStore.hasRole('Commenter')

  const actions = [
    {
      key: 'view',
      title: 'Просмотр',
      icon: 'mdi-eye',
      disabled: false,
    },
    {
      key: 'edit',
      title: 'Редактировать',
      icon: 'mdi-pencil',
      disabled: !canEdit,
    },
  ]

  // Add entity-specific actions
  if (node.entity_type === 'epic' && canEdit) {
    actions.push({
      key: 'add-story',
      title: 'Добавить историю',
      icon: 'mdi-plus',
      disabled: false,
    })
  }

  if (node.entity_type === 'user_story' && canEdit) {
    actions.push({
      key: 'add-criteria',
      title: 'Добавить критерий',
      icon: 'mdi-plus',
      disabled: false,
    })
    actions.push({
      key: 'add-requirement',
      title: 'Добавить требование',
      icon: 'mdi-plus',
      disabled: false,
    })
  }

  if (node.entity_type === 'acceptance_criteria' && canEdit) {
    actions.push({
      key: 'add-requirement',
      title: 'Добавить требование',
      icon: 'mdi-plus',
      disabled: false,
    })
  }

  // Common actions
  if (canComment) {
    actions.push({
      key: 'comment',
      title: 'Добавить комментарий',
      icon: 'mdi-comment-plus',
      disabled: false,
    })
  }

  actions.push(
    {
      key: 'copy-link',
      title: 'Копировать ссылку',
      icon: 'mdi-link',
      disabled: false,
    },
    {
      key: 'copy-reference',
      title: 'Копировать ID',
      icon: 'mdi-identifier',
      disabled: false,
    },
  )

  if (canEdit) {
    actions.push({
      key: 'delete',
      title: 'Удалить',
      icon: 'mdi-delete',
      disabled: false,
    })
  }

  return actions
})

// Event handlers
function handleNodeSelect(node: HierarchyNode) {
  // Update UI store selection
  uiStore.selectEntity(node.entity_type, node.entity_id)

  // Navigate to the entity detail page
  const routeMap = {
    epic: `/epics/${node.entity_id}`,
    user_story: `/user-stories/${node.entity_id}`,
    acceptance_criteria: `/user-stories/${getParentUserStoryId(node)}`, // Navigate to parent user story
    requirement: `/requirements/${node.entity_id}`,
  }

  const route = routeMap[node.entity_type]
  if (route) {
    router.push(route)
  }
}

function handleNodeToggle(node: HierarchyNode) {
  hierarchyStore.toggleNodeExpansion(node.entity_id)
}

function handleContextMenu(event: { node: HierarchyNode; x: number; y: number }) {
  contextMenu.value = {
    show: true,
    x: event.x,
    y: event.y,
    node: event.node,
  }
}

function handleContextAction(actionKey: string) {
  const node = contextMenu.value.node
  if (!node) return

  contextMenu.value.show = false

  switch (actionKey) {
    case 'view':
      handleNodeSelect(node)
      break

    case 'edit':
      // Navigate to edit mode
      const editRoutes = {
        epic: `/epics/${node.entity_id}?mode=edit`,
        user_story: `/user-stories/${node.entity_id}?mode=edit`,
        requirement: `/requirements/${node.entity_id}?mode=edit`,
      }
      const editRoute = editRoutes[node.entity_type as keyof typeof editRoutes]
      if (editRoute) {
        router.push(editRoute)
      }
      break

    case 'add-story':
      if (node.entity_type === 'epic') {
        router.push(`/user-stories/new?epic_id=${node.entity_id}`)
      }
      break

    case 'add-criteria':
      if (node.entity_type === 'user_story') {
        router.push(`/user-stories/${node.entity_id}?action=add-criteria`)
      }
      break

    case 'add-requirement':
      if (node.entity_type === 'user_story') {
        router.push(`/requirements/new?user_story_id=${node.entity_id}`)
      } else if (node.entity_type === 'acceptance_criteria') {
        const userStoryId = getParentUserStoryId(node)
        router.push(
          `/requirements/new?user_story_id=${userStoryId}&acceptance_criteria_id=${node.entity_id}`,
        )
      }
      break

    case 'comment':
      // Navigate to entity with comment focus
      handleNodeSelect(node)
      // Could emit event to focus comment section
      break

    case 'copy-link':
      copyToClipboard(window.location.origin + getEntityUrl(node))
      uiStore.showSuccess('Ссылка скопирована в буфер обмена')
      break

    case 'copy-reference':
      copyToClipboard(node.reference_id)
      uiStore.showSuccess('ID скопирован в буфер обмена')
      break

    case 'delete':
      // Show confirmation dialog
      if (confirm(`Вы уверены, что хотите удалить ${node.reference_id}: ${node.title}?`)) {
        // In real implementation, call delete API
        uiStore.showInfo('Функция удаления будет реализована позже')
      }
      break
  }
}

// Helper functions
function getParentUserStoryId(node: HierarchyNode): string {
  // In a real implementation, we would traverse up the hierarchy
  // For now, we'll use a simple approach based on mock data structure
  const flattened = hierarchyStore.flattenedNodes
  const userStory = flattened.find(
    (n) =>
      n.entity_type === 'user_story' &&
      n.children?.some((child) => child.entity_id === node.entity_id),
  )
  return userStory?.entity_id || ''
}

function getEntityUrl(node: HierarchyNode): string {
  const routeMap = {
    epic: `/epics/${node.entity_id}`,
    user_story: `/user-stories/${node.entity_id}`,
    acceptance_criteria: `/user-stories/${getParentUserStoryId(node)}`,
    requirement: `/requirements/${node.entity_id}`,
  }
  return routeMap[node.entity_type] || '/'
}

function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

// Close context menu when clicking outside
function handleClickOutside() {
  contextMenu.value.show = false
}

// Lifecycle
onMounted(() => {
  hierarchyStore.initialize()
  document.addEventListener('click', handleClickOutside)
})

// Cleanup
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.tree-view {
  height: 100%;
  overflow-y: auto;
}

.tree-controls {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.tree-nodes {
  padding: 8px 0;
}

/* Custom scrollbar for webkit browsers */
.tree-view::-webkit-scrollbar {
  width: 6px;
}

.tree-view::-webkit-scrollbar-track {
  background: transparent;
}

.tree-view::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.tree-view::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
