import type { User } from './auth'
import type { EpicStatus, Priority, ListResponse } from './common'
import type { BaseUserStory, BaseComment } from './base-entities'

// Epic Types
export interface Epic {
  id: string
  reference_id: string
  title: string
  description?: string
  status: EpicStatus
  priority: Priority
  creator_id: string
  assignee_id?: string
  created_at: string
  updated_at: string

  // Optional populated fields
  creator?: User
  assignee?: User
  user_stories?: BaseUserStory[]
  comments?: BaseComment[]
}

export interface CreateEpicRequest {
  title: string
  description?: string
  priority: Priority
  assignee_id?: string
}

export interface UpdateEpicRequest {
  title?: string
  description?: string
  priority?: Priority
  assignee_id?: string
}

export interface EpicListParams {
  creator_id?: string
  assignee_id?: string
  status?: EpicStatus
  priority?: Priority
  order_by?: string
  limit?: number
  offset?: number
  include?: string
}

export type EpicListResponse = ListResponse<Epic>
