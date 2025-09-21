<template>
  <div class="tree-node">
    <!-- Node Content -->
    <div
      :class="nodeClasses"
      :style="{ paddingLeft: `${level * 16 + 8}px` }"
      @click="handleClick"
      @contextmenu.prevent="handleContextMenu"
    >
      <!-- Expand/Collapse Button -->
      <v-btn
        v-if="hasChildren"
        :icon="isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
        size="x-small"
        variant="text"
        class="expand-btn"
        @click.stop="handleToggle"
      />
      <div v-else class="expand-placeholder" />

      <!-- Entity Icon -->
      <v-icon
        :icon="hierarchyStore.getEntityIcon(node.entity_type)"
        :color="iconColor"
        size="small"
        class="entity-icon"
      />

      <!-- Node Content -->
      <div class="node-content">
        <div class="node-title">
          <span class="reference-id">{{ node.reference_id }}</span>
          <span class="title-text">{{ node.title }}</span>
        </div>
        
        <!-- Status Badge -->
        <v-chip
          :color="hierarchyStore.getStatusColor(node.status)"
          size="x-small"
          variant="flat"
          class="status-chip"
        >
          {{ node.status }}
        </v-chip>
      </div>

      <!-- Loading indicator for async operations -->
      <v-progress-circular
        v-if="loading"
        indeterminate
        size="16"
        width="2"
        class="ml-2"
      />
    </div>

    <!-- Children Nodes -->
    <div v-if="hasChildren && isExpanded" class="children-container">
      <TreeNode
        v-for="child in node.children"
        :key="child.entity_id"
        :node="child"
        :level="level + 1"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
        @context-menu="$emit('context-menu', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHierarchyStore } from '@/stores/hierarchy'
import type { HierarchyNode } from '@/types/hierarchy'

interface Props {
  node: HierarchyNode
  level: number
}

interface Emits {
  (e: 'select', node: HierarchyNode): void
  (e: 'toggle', node: HierarchyNode): void
  (e: 'context-menu', event: { node: HierarchyNode; x: number; y: number }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const route = useRoute()
const hierarchyStore = useHierarchyStore()

// Local state
const loading = ref(false)

// Computed properties
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

const isExpanded = computed(() => {
  return hierarchyStore.isNodeExpanded(props.node.entity_id)
})

const isSelected = computed(() => {
  // Check if this node is currently selected based on route
  const currentEntityId = route.params.id as string
  return currentEntityId === props.node.entity_id
})

const isActive = computed(() => {
  // Check if this node or any of its children is active in the current route
  if (isSelected.value) return true
  
  // Check if any child is selected
  function checkChildrenActive(node: HierarchyNode): boolean {
    if (!node.children) return false
    
    for (const child of node.children) {
      if (child.entity_id === route.params.id) return true
      if (checkChildrenActive(child)) return true
    }
    return false
  }
  
  return checkChildrenActive(props.node)
})

const nodeClasses = computed(() => {
  return [
    'tree-node-content',
    {
      'tree-node-selected': isSelected.value,
      'tree-node-active': isActive.value,
      'tree-node-hover': true
    }
  ]
})

const iconColor = computed(() => {
  if (isSelected.value) return 'primary'
  if (isActive.value) return 'primary'
  
  // Color based on entity type
  switch (props.node.entity_type) {
    case 'epic':
      return 'purple'
    case 'user_story':
      return 'blue'
    case 'acceptance_criteria':
      return 'green'
    case 'requirement':
      return 'orange'
    default:
      return 'grey'
  }
})

// Event handlers
function handleClick() {
  emit('select', props.node)
}

function handleToggle() {
  emit('toggle', props.node)
}

function handleContextMenu(event: MouseEvent) {
  emit('context-menu', {
    node: props.node,
    x: event.clientX,
    y: event.clientY
  })
}

// Auto-expand if this node or its children are active
if (isActive.value && !isExpanded.value) {
  hierarchyStore.expandNode(props.node.entity_id)
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.tree-node-content {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  margin: 1px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 32px;
}

.tree-node-content:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.tree-node-selected {
  background-color: rgba(25, 118, 210, 0.12) !important;
  color: rgb(25, 118, 210);
}

.tree-node-active {
  background-color: rgba(25, 118, 210, 0.08);
}

.expand-btn {
  margin-right: 4px;
  flex-shrink: 0;
}

.expand-placeholder {
  width: 24px;
  height: 24px;
  margin-right: 4px;
  flex-shrink: 0;
}

.entity-icon {
  margin-right: 8px;
  flex-shrink: 0;
}

.node-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0; /* Allow text truncation */
}

.node-title {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reference-id {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  background-color: rgba(0, 0, 0, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.tree-node-selected .reference-id {
  background-color: rgba(25, 118, 210, 0.2);
  color: rgb(25, 118, 210);
}

.title-text {
  font-size: 0.875rem;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.status-chip {
  margin-left: 8px;
  flex-shrink: 0;
}

.children-container {
  border-left: 1px solid rgba(0, 0, 0, 0.12);
  margin-left: 12px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tree-node-content {
    padding: 6px 4px;
  }
  
  .node-title {
    gap: 4px;
  }
  
  .reference-id {
    font-size: 0.7rem;
    padding: 1px 4px;
  }
  
  .title-text {
    font-size: 0.8rem;
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .tree-node-content:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
  
  .reference-id {
    background-color: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.7);
  }
  
  .children-container {
    border-left-color: rgba(255, 255, 255, 0.12);
  }
}

/* Animation for expand/collapse */
.children-container {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>