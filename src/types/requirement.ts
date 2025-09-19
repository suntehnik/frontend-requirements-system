import type { User } from './auth';
import type { UserStory } from './user-story';
import type { AcceptanceCriteria } from './acceptance-criteria';
import type { RequirementType, RequirementRelationship } from './config';
import type { Comment } from './comment';
import type { RequirementStatus, Priority, ListResponse } from './common';

// Requirement Types
export interface Requirement {
  id: string;
  reference_id: string;
  title: string;
  description?: string;
  status: RequirementStatus;
  priority: Priority;
  user_story_id: string;
  acceptance_criteria_id?: string;
  type_id: string;
  creator_id: string;
  assignee_id?: string;
  created_at: string;
  last_modified: string;
  
  // Optional populated fields
  user_story?: UserStory;
  acceptance_criteria?: AcceptanceCriteria;
  type?: RequirementType;
  creator?: User;
  assignee?: User;
  source_relationships?: RequirementRelationship[];
  target_relationships?: RequirementRelationship[];
  comments?: Comment[];
}

export interface CreateRequirementRequest {
  title: string;
  description?: string;
  priority: Priority;
  user_story_id: string;
  acceptance_criteria_id?: string;
  type_id: string;
  assignee_id?: string;
}

export interface UpdateRequirementRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  assignee_id?: string;
}

export interface RequirementListParams {
  user_story_id?: string;
  acceptance_criteria_id?: string;
  type_id?: string;
  creator_id?: string;
  assignee_id?: string;
  status?: RequirementStatus;
  priority?: Priority;
  order_by?: string;
  limit?: number;
  offset?: number;
  include?: string;
}

export interface RequirementListResponse extends ListResponse<Requirement> {}