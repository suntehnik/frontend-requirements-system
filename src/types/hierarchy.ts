import type { EntityType } from './common'

// Hierarchy Types
export interface HierarchyNode {
  entity_type: EntityType
  entity_id: string
  reference_id: string
  title: string
  status: string
  children?: HierarchyNode[]
}

export interface EntityPath {
  entity_type: EntityType
  entity_id: string
  reference_id: string
  title: string
}
