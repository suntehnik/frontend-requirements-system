// Type guards for runtime type checking
import type { User, UserRole } from './auth';
import type { Epic } from './epic';
import type { UserStory } from './user-story';
import type { AcceptanceCriteria } from './acceptance-criteria';
import type { Requirement } from './requirement';
import type { Comment } from './comment';
import type {
  EntityType,
  Priority,
  EpicStatus,
  UserStoryStatus,
  RequirementStatus
} from './common';

// Helper function to check if object has required properties
function hasProperties(obj: unknown, properties: string[]): obj is Record<string, unknown> {
  return typeof obj === 'object' &&
    obj !== null &&
    properties.every(prop => prop in obj);
}

// User type guards
export function isUser(obj: unknown): obj is User {
  if (!hasProperties(obj, ['id', 'username', 'email', 'role'])) return false;

  return typeof obj.id === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.email === 'string' &&
    isUserRole(obj.role);
}

export function isUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' &&
    (role === 'Administrator' || role === 'User' || role === 'Commenter');
}

// Priority type guard
export function isPriority(priority: unknown): priority is Priority {
  return typeof priority === 'number' &&
    (priority === 1 || priority === 2 || priority === 3 || priority === 4);
}

// Status type guards
export function isEpicStatus(status: unknown): status is EpicStatus {
  return typeof status === 'string' &&
    ['Backlog', 'Draft', 'In Progress', 'Done', 'Cancelled'].includes(status);
}

export function isUserStoryStatus(status: unknown): status is UserStoryStatus {
  return typeof status === 'string' &&
    ['Backlog', 'Draft', 'In Progress', 'Done', 'Cancelled'].includes(status);
}

export function isRequirementStatus(status: unknown): status is RequirementStatus {
  return typeof status === 'string' &&
    ['Draft', 'Active', 'Obsolete'].includes(status);
}

// Entity type guard
export function isEntityType(type: unknown): type is EntityType {
  return typeof type === 'string' &&
    ['epic', 'user_story', 'acceptance_criteria', 'requirement'].includes(type);
}

// Entity type guards
export function isEpic(obj: unknown): obj is Epic {
  if (!hasProperties(obj, ['id', 'reference_id', 'title', 'status', 'priority'])) return false;

  return typeof obj.id === 'string' &&
    typeof obj.reference_id === 'string' &&
    typeof obj.title === 'string' &&
    isEpicStatus(obj.status) &&
    isPriority(obj.priority);
}

export function isUserStory(obj: unknown): obj is UserStory {
  if (!hasProperties(obj, ['id', 'reference_id', 'title', 'status', 'priority', 'epic_id'])) return false;

  return typeof obj.id === 'string' &&
    typeof obj.reference_id === 'string' &&
    typeof obj.title === 'string' &&
    isUserStoryStatus(obj.status) &&
    isPriority(obj.priority) &&
    typeof obj.epic_id === 'string';
}

export function isAcceptanceCriteria(obj: unknown): obj is AcceptanceCriteria {
  if (!hasProperties(obj, ['id', 'reference_id', 'description', 'user_story_id'])) return false;

  return typeof obj.id === 'string' &&
    typeof obj.reference_id === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.user_story_id === 'string';
}

export function isRequirement(obj: unknown): obj is Requirement {
  if (!hasProperties(obj, ['id', 'reference_id', 'title', 'status', 'priority', 'user_story_id', 'type_id'])) return false;

  return typeof obj.id === 'string' &&
    typeof obj.reference_id === 'string' &&
    typeof obj.title === 'string' &&
    isRequirementStatus(obj.status) &&
    isPriority(obj.priority) &&
    typeof obj.user_story_id === 'string' &&
    typeof obj.type_id === 'string';
}

export function isComment(obj: unknown): obj is Comment {
  if (!hasProperties(obj, ['id', 'content', 'entity_type', 'entity_id', 'author_id', 'is_resolved'])) return false;

  return typeof obj.id === 'string' &&
    typeof obj.content === 'string' &&
    isEntityType(obj.entity_type) &&
    typeof obj.entity_id === 'string' &&
    typeof obj.author_id === 'string' &&
    typeof obj.is_resolved === 'boolean';
}