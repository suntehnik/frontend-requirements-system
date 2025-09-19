import type { User } from './auth';
import type { UserStory } from './user-story';
import type { Comment } from './comment';
import type { EpicStatus, Priority, ListResponse } from './common';

// Epic Types
export interface Epic {
  id: string;
  reference_id: string;
  title: string;
  description?: string;
  status: EpicStatus;
  priority: Priority;
  creator_id: string;
  assignee_id?: string;
  created_at: string;
  last_modified: string;
  
  // Optional populated fields
  creator?: User;
  assignee?: User;
  user_stories?: UserStory[];
  comments?: Comment[];
}

export interface CreateEpicRequest {
  title: string;
  description?: string;
  priority: Priority;
  assignee_id?: string;
}

export interface UpdateEpicRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  assignee_id?: string;
}

export interface EpicListParams {
  creator_id?: string;
  assignee_id?: string;
  status?: EpicStatus;
  priority?: Priority;
  order_by?: string;
  limit?: number;
  offset?: number;
  include?: string;
}

export type EpicListResponse = ListResponse<Epic>;