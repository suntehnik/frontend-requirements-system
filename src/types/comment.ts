import type { User } from './auth';
import type { EntityType, ListResponse } from './common';

// Comment Types
export interface Comment {
  id: string;
  content: string;
  entity_type: EntityType;
  entity_id: string;
  author_id: string;
  parent_comment_id?: string;
  is_resolved: boolean;
  linked_text?: string;
  text_position_start?: number;
  text_position_end?: number;
  created_at: string;
  updated_at: string;
  
  // Optional populated fields
  author?: User;
  parent_comment?: Comment;
  replies?: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  parent_comment_id?: string;
}

export interface CreateInlineCommentRequest {
  content: string;
  linked_text: string;
  text_position_start: number;
  text_position_end: number;
}

export interface UpdateCommentRequest {
  content?: string;
}

export interface CommentListResponse extends ListResponse<Comment> {}