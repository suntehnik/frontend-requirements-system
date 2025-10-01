import type { User } from './auth'
import type { RequirementType, RequirementRelationship } from './config'
import type { RequirementStatus, Priority, ListResponse } from './common'
import type { BaseUserStory, BaseAcceptanceCriteria, BaseComment } from './base-entities'

// Requirement Types
export interface Requirement {
  id: string
  reference_id: string
  title: string
  description?: string
  status: RequirementStatus
  priority: Priority
  user_story_id: string
  acceptance_criteria_id?: string
  type_id: string
  creator_id: string
  assignee_id?: string
  created_at: string
  updated_at: string

  // Optional populated fields
  user_story?: BaseUserStory
  acceptance_criteria?: BaseAcceptanceCriteria
  type?: RequirementType
  creator?: User
  assignee?: User
  source_relationships?: RequirementRelationship[]
  target_relationships?: RequirementRelationship[]
  comments?: BaseComment[]
}

export interface CreateRequirementRequest {
  title: string
  description?: string
  priority: Priority
  user_story_id: string
  acceptance_criteria_id?: string
  type_id: string
  assignee_id?: string
}

export interface UpdateRequirementRequest {
  title?: string
  description?: string
  priority?: Priority
  assignee_id?: string
}

export interface RequirementListParams {
  user_story_id?: string
  acceptance_criteria_id?: string
  type_id?: string
  creator_id?: string
  assignee_id?: string
  status?: RequirementStatus
  priority?: Priority
  order_by?: string
  limit?: number
  offset?: number
  include?: string
}

export type RequirementListResponse = ListResponse<Requirement>
