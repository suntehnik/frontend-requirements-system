import type { User } from './auth';
import type { UserStoryStatus, Priority, ListResponse } from './common';
import type { BaseEpic, BaseAcceptanceCriteria, BaseRequirement, BaseComment } from './base-entities';

// User Story Types
export interface UserStory {
  id: string;
  reference_id: string;
  title: string;
  description?: string;
  status: UserStoryStatus;
  priority: Priority;
  epic_id: string;
  creator_id: string;
  assignee_id?: string;
  created_at: string;
  last_modified: string;
  
  // Optional populated fields
  epic?: BaseEpic;
  creator?: User;
  assignee?: User;
  acceptance_criteria?: BaseAcceptanceCriteria[];
  requirements?: BaseRequirement[];
  comments?: BaseComment[];
}

export interface CreateUserStoryRequest {
  title: string;
  description?: string;
  priority: Priority;
  epic_id: string;
  assignee_id?: string;
}

export interface UpdateUserStoryRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  assignee_id?: string;
}

export interface UserStoryListParams {
  epic_id?: string;
  creator_id?: string;
  assignee_id?: string;
  status?: UserStoryStatus;
  priority?: Priority;
  order_by?: string;
  limit?: number;
  offset?: number;
  include?: string;
}

export type UserStoryListResponse = ListResponse<UserStory>;