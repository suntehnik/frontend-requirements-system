import type { User } from './auth'
import type { EntityType, ListResponse } from './common'
import type { BaseComment } from './base-entities'

// Comment Types
export interface Comment {
  id: string
  content: string
  entity_type: EntityType
  entity_id: string
  author_id: string
  parent_comment_id?: string
  is_resolved: boolean
  linked_text?: string
  text_position_start?: number
  text_position_end?: number
  created_at: string
  updated_at: string

  // Optional populated fields
  author?: User
  parent_comment?: BaseComment
  replies?: BaseComment[]
}

export interface CreateCommentRequest {
  content: string
  author_id: string
  parent_comment_id?: string
}

export interface CreateInlineCommentRequest {
  content: string
  linked_text: string
  text_position_start: number
  text_position_end: number
}

export interface UpdateCommentRequest {
  content?: string
}

export type CommentListResponse = ListResponse<Comment>
