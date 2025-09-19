import type { User } from './auth'
import type { EntityType } from './common'
import type { BaseRequirement } from './base-entities'

// Configuration Types
export interface RequirementType {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface RelationshipType {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface RequirementRelationship {
  id: string
  source_requirement_id: string
  target_requirement_id: string
  relationship_type_id: string
  created_by: string
  created_at: string

  // Optional populated fields
  source_requirement?: BaseRequirement
  target_requirement?: BaseRequirement
  relationship_type?: RelationshipType
  creator?: User
}

export interface CreateRelationshipRequest {
  source_requirement_id: string
  target_requirement_id: string
  relationship_type_id: string
}

// Status Management Types
export interface StatusModel {
  id: string
  name: string
  description?: string
  entity_type: EntityType
  is_default: boolean
  created_at: string
  updated_at: string

  // Optional populated fields
  statuses?: Status[]
  transitions?: StatusTransition[]
}

export interface Status {
  id: string
  name: string
  description?: string
  color?: string
  order: number
  is_initial: boolean
  is_final: boolean
  status_model_id: string
  created_at: string
  updated_at: string

  // Optional populated fields
  status_model?: StatusModel
  from_transitions?: StatusTransition[]
  to_transitions?: StatusTransition[]
}

export interface StatusTransition {
  id: string
  name?: string
  description?: string
  from_status_id: string
  to_status_id: string
  status_model_id: string
  created_at: string
  updated_at: string

  // Optional populated fields
  from_status?: Status
  to_status?: Status
  status_model?: StatusModel
}

// Configuration list responses
export interface RequirementTypeListResponse {
  requirement_types: RequirementType[]
  count: number
}

export interface RelationshipTypeListResponse {
  relationship_types: RelationshipType[]
  count: number
}

export interface StatusModelListResponse {
  status_models: StatusModel[]
  count: number
}

export interface StatusListResponse {
  statuses: Status[]
  count: number
}

export interface StatusTransitionListResponse {
  transitions: StatusTransition[]
  count: number
}
