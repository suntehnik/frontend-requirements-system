// Component-specific TypeScript interfaces

import type {
  Epic,
  UserStory,
  Requirement,
  CreateEpicRequest,
  CreateUserStoryRequest,
  CreateRequirementRequest,
  EpicStatus,
  UserStoryStatus,
  RequirementStatus,
  Priority,
} from '@/types'

// Base component interfaces
export interface BaseListProps {
  loading?: boolean
  totalCount?: number
  currentPage?: number
  pageSize?: number
}

export interface BaseFormProps {
  loading?: boolean
}

// Epic List Component Interfaces
export interface EpicListProps extends BaseListProps {
  epics: Epic[]
}

export interface EpicListEmits {
  (e: 'create'): void
  (e: 'delete', epic: Epic): void
  (e: 'filter-change', filters: EpicFilterState): void
  (e: 'options-change', options: DataTableOptions): void
  (e: 'search-change', query: string): void
  (e: 'clear-filters'): void
}

export interface EpicFilterState {
  status?: EpicStatus
  priority?: Priority
  assignee_id?: string
}

// Epic Form Component Interfaces
export type EpicFormProps = BaseFormProps

export interface EpicFormEmits {
  (e: 'submit', data: CreateEpicRequest): void
  (e: 'cancel'): void
}

// User Story List Component Interfaces
export interface UserStoryListProps extends BaseListProps {
  userStories: UserStory[]
  epics?: Epic[]
}

export interface UserStoryListEmits {
  (e: 'create'): void
  (e: 'delete', userStory: UserStory): void
  (e: 'filter-change', filters: UserStoryFilterState): void
  (e: 'options-change', options: DataTableOptions): void
  (e: 'search-change', query: string): void
  (e: 'clear-filters'): void
}

export interface UserStoryFilterState {
  status?: UserStoryStatus
  priority?: Priority
  epic_id?: string
}

// User Story Form Component Interfaces
export type UserStoryFormProps = BaseFormProps

export interface UserStoryFormEmits {
  (e: 'submit', data: CreateUserStoryRequest): void
  (e: 'cancel'): void
}

// Requirement List Component Interfaces
export interface RequirementListProps extends BaseListProps {
  requirements: Requirement[]
}

export interface RequirementListEmits {
  (e: 'create'): void
  (e: 'delete', requirement: Requirement): void
  (e: 'filter-change', filters: RequirementFilterState): void
  (e: 'options-change', options: DataTableOptions): void
  (e: 'search-change', query: string): void
  (e: 'clear-filters'): void
}

export interface RequirementFilterState {
  status?: RequirementStatus
  priority?: Priority
  user_story_id?: string
}

// Requirement Form Component Interfaces
export type RequirementFormProps = BaseFormProps

export interface RequirementFormEmits {
  (e: 'submit', data: CreateRequirementRequest): void
  (e: 'cancel'): void
}

// View Component Interfaces
export interface BaseViewState {
  showCreateDialog: boolean
  showDeleteDialog: boolean
  formLoading: boolean
  deleteLoading: boolean
  successMessage: string
  errorMessage: string
  showSuccessMessage: boolean
  showErrorMessage: boolean
}

export interface EpicListViewState extends BaseViewState {
  epicToDelete?: Epic
}

export interface UserStoryListViewState extends BaseViewState {
  userStoryToDelete?: UserStory
}

export interface RequirementListViewState extends BaseViewState {
  requirementToDelete?: Requirement
}

// Import shared types from common
import type { ValidationRule, DataTableOptions } from './common'

// Component Configuration Types
export interface ComponentConfig {
  pageSizeOptions: number[]
  defaultPageSize: number
  defaultSortBy: { key: string; order: 'asc' | 'desc' }
}

// Form Validation Rules
export interface FormValidationRules {
  required: ValidationRule[]
  optional: ValidationRule[]
  [key: string]: ValidationRule[]
}

// Status Color Mapping for Components
export interface StatusColorMap {
  [key: string]: string
}

// Component Theme Configuration
export interface ComponentTheme {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
  }
  statusColors: {
    epic: StatusColorMap
    userStory: StatusColorMap
    requirement: StatusColorMap
  }
}
