import type { User } from './auth';
import type { UserStory } from './user-story';
import type { Requirement } from './requirement';
import type { Comment } from './comment';
import type { ListResponse } from './common';

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
  user_story?: UserStory;
  author?: User;
  requirements?: Requirement[];
  comments?: Comment[];
}

export interface CreateAcceptanceCriteriaRequest {
  description: string;
  user_story_id: string;
}

export interface UpdateAcceptanceCriteriaRequest {
  description?: string;
}

export type AcceptanceCriteriaListResponse = ListResponse<AcceptanceCriteria>;