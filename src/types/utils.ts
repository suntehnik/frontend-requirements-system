// Utility types for common patterns
import type { Epic } from './epic';
import type { UserStory } from './user-story';
import type { AcceptanceCriteria } from './acceptance-criteria';
import type { Requirement } from './requirement';
import type { 
  EntityType,
  Priority,
  EpicStatus,
  UserStoryStatus,
  RequirementStatus
} from './common';

// Union type for all entities
export type Entity = Epic | UserStory | AcceptanceCriteria | Requirement;

// Utility type to extract entity by type
export type EntityByType<T extends EntityType> = 
  T extends 'epic' ? Epic :
  T extends 'user_story' ? UserStory :
  T extends 'acceptance_criteria' ? AcceptanceCriteria :
  T extends 'requirement' ? Requirement :
  never;

// Status union type
export type EntityStatus = EpicStatus | UserStoryStatus | RequirementStatus;

// Status by entity type
export type StatusByEntityType<T extends EntityType> = 
  T extends 'epic' ? EpicStatus :
  T extends 'user_story' ? UserStoryStatus :
  T extends 'requirement' ? RequirementStatus :
  never;

// Partial update types
export type PartialEntity<T> = Partial<Omit<T, 'id' | 'reference_id' | 'created_at' | 'last_modified' | 'updated_at'>>;

// Priority labels mapping
export const PRIORITY_LABELS: Record<Priority, string> = {
  1: 'Critical',
  2: 'High', 
  3: 'Medium',
  4: 'Low'
} as const;

// Priority colors mapping
export const PRIORITY_COLORS: Record<Priority, string> = {
  1: '#f44336', // red
  2: '#ff9800', // orange
  3: '#2196f3', // blue
  4: '#4caf50'  // green
} as const;

// Status colors mapping
export const STATUS_COLORS = {
  epic: {
    'Backlog': '#9e9e9e',
    'Draft': '#ff9800',
    'In Progress': '#2196f3',
    'Done': '#4caf50',
    'Cancelled': '#f44336'
  },
  user_story: {
    'Backlog': '#9e9e9e',
    'Draft': '#ff9800',
    'In Progress': '#2196f3',
    'Done': '#4caf50',
    'Cancelled': '#f44336'
  },
  requirement: {
    'Draft': '#ff9800',
    'Active': '#4caf50',
    'Obsolete': '#9e9e9e'
  }
} as const;

// Entity type labels
export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  epic: 'Epic',
  user_story: 'User Story',
  acceptance_criteria: 'Acceptance Criteria',
  requirement: 'Requirement'
} as const;

// Helper type for API include parameters
export type IncludeParam<T extends string> = T | `${T},${string}` | `${string},${T}` | `${string},${T},${string}`;

// Common include parameters for each entity type
export type EpicInclude = IncludeParam<'creator' | 'assignee' | 'user_stories' | 'comments'>;
export type UserStoryInclude = IncludeParam<'epic' | 'creator' | 'assignee' | 'acceptance_criteria' | 'requirements' | 'comments'>;
export type AcceptanceCriteriaInclude = IncludeParam<'user_story' | 'author' | 'requirements' | 'comments'>;
export type RequirementInclude = IncludeParam<'user_story' | 'acceptance_criteria' | 'type' | 'creator' | 'assignee' | 'source_relationships' | 'target_relationships' | 'comments'>;

// Utility function to get entity display name
export function getEntityDisplayName(entity: Entity): string {
  if ('title' in entity) {
    return `${entity.reference_id}: ${entity.title}`;
  } else {
    // For AcceptanceCriteria which has description instead of title
    return `${entity.reference_id}: ${(entity as AcceptanceCriteria).description}`;
  }
}

// Utility function to get priority label
export function getPriorityLabel(priority: Priority): string {
  return PRIORITY_LABELS[priority];
}

// Utility function to get priority color
export function getPriorityColor(priority: Priority): string {
  return PRIORITY_COLORS[priority];
}

// Utility function to get status color
export function getStatusColor(entityType: EntityType, status: string): string {
  const colors = STATUS_COLORS[entityType as keyof typeof STATUS_COLORS];
  return (colors as Record<string, string>)?.[status] || '#9e9e9e';
}

// Utility function to get entity type label
export function getEntityTypeLabel(entityType: EntityType): string {
  return ENTITY_TYPE_LABELS[entityType];
}