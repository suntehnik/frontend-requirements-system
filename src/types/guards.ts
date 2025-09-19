// Type guards for runtime type checking
import type { 
  User, 
  Epic, 
  UserStory, 
  AcceptanceCriteria, 
  Requirement, 
  Comment,
  EntityType,
  Priority,
  EpicStatus,
  UserStoryStatus,
  RequirementStatus,
  UserRole
} from './index';

// User type guards
export function isUser(obj: any): obj is User {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.email === 'string' &&
    isUserRole(obj.role);
}

export function isUserRole(role: any): role is UserRole {
  return role === 'Administrator' || role === 'User' || role === 'Commenter';
}

// Priority type guard
export function isPriority(priority: any): priority is Priority {
  return priority === 1 || priority === 2 || priority === 3 || priority === 4;
}

// Status type guards
export function isEpicStatus(status: any): status is EpicStatus {
  return ['Backlog', 'Draft', 'In Progress', 'Done', 'Cancelled'].includes(status);
}

export function isUserStoryStatus(status: any): status is UserStoryStatus {
  return ['Backlog', 'Draft', 'In Progress', 'Done', 'Cancelled'].includes(status);
}

export function isRequirementStatus(status: any): status is RequirementStatus {
  return ['Draft', 'Active', 'Obsolete'].includes(status);
}

// Entity type guard
export function isEntityType(type: any): type is EntityType {
  return ['epic', 'user_story', 'acceptance_criteria', 'requirement'].includes(type);
}

// Entity type guards
export function isEpic(obj: any): obj is Epic {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.reference_id === 'string' &&
    typeof obj.title === 'string' &&
    isEpicStatus(obj.status) &&
    isPriority(obj.priority);
}

export function isUserStory(obj: any): obj is UserStory {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.reference_id === 'string' &&
    typeof obj.title === 'string' &&
    isUserStoryStatus(obj.status) &&
    isPriority(obj.priority) &&
    typeof obj.epic_id === 'string';
}

export function isAcceptanceCriteria(obj: any): obj is AcceptanceCriteria {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.reference_id === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.user_story_id === 'string';
}

export function isRequirement(obj: any): obj is Requirement {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.reference_id === 'string' &&
    typeof obj.title === 'string' &&
    isRequirementStatus(obj.status) &&
    isPriority(obj.priority) &&
    typeof obj.user_story_id === 'string' &&
    typeof obj.type_id === 'string';
}

export function isComment(obj: any): obj is Comment {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.content === 'string' &&
    isEntityType(obj.entity_type) &&
    typeof obj.entity_id === 'string' &&
    typeof obj.author_id === 'string' &&
    typeof obj.is_resolved === 'boolean';
}