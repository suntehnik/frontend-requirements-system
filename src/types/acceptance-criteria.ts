import type { User } from './auth';
import type { ListResponse } from './common';
import type { BaseUserStory, BaseRequirement, BaseComment } from './base-entities';

// Acceptance Criteria Types
export interface AcceptanceCriteria {
  id: string;
  reference_id: string;
  description: string;
  user_story_id: string;
  author_id: string;
  created_at: string;
  last_modified: string;

  // Optional populated fields
  user_story?: BaseUserStory;
  author?: User;
  requirements?: BaseRequirement[];
  comments?: BaseComment[];
}

export interface CreateAcceptanceCriteriaRequest {
  description: string;
  user_story_id: string;
}

export interface UpdateAcceptanceCriteriaRequest {
  description?: string;
}

export type AcceptanceCriteriaListResponse = ListResponse<AcceptanceCriteria>;