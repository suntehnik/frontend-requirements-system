// Common types used across the application

// Priority levels
export type Priority = 1 | 2 | 3 | 4; // 1=Critical, 2=High, 3=Medium, 4=Low

// Status types
export type EpicStatus = 'Backlog' | 'Draft' | 'In Progress' | 'Done' | 'Cancelled';
export type UserStoryStatus = 'Backlog' | 'Draft' | 'In Progress' | 'Done' | 'Cancelled';
export type RequirementStatus = 'Draft' | 'Active' | 'Obsolete';

// Entity types
export type EntityType = 'epic' | 'user_story' | 'acceptance_criteria' | 'requirement';

// Standard API Response
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// List Response Types
export interface ListResponse<T> {
  data: T[];
  total_count: number;
  limit: number;
  offset: number;
}

// Error Response Format
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

// Deletion Types
export interface DependencyInfo {
  can_delete: boolean;
  dependencies: {
    entity_type: string;
    entity_id: string;
    reference_id: string;
    title: string;
    dependency_type: string;
  }[];
  warnings: string[];
}

export interface DeletionResult {
  success: boolean;
  deleted_entities: {
    entity_type: string;
    entity_id: string;
    reference_id: string;
  }[];
  message: string;
}

// Status Change Types
export interface StatusChangeRequest {
  status: string;
}

export interface AssignmentRequest {
  assignee_id?: string; // null to unassign
}