// Status type definitions for status components
import type { Priority } from './common'

export type WorkflowStatus = 'Backlog' | 'Draft' | 'In Progress' | 'Done' | 'Cancelled'

export type LifecycleStatus = 'Draft' | 'Active' | 'Obsolete'

export type BinaryStatus = 'Active' | 'Inactive'

export type ReviewStatus = 'Under Review' | 'Approved' | 'Rejected' | 'Needs Changes'

// Union type for all status types
export type AllStatusTypes = WorkflowStatus | LifecycleStatus | BinaryStatus | ReviewStatus

// Component size configuration
export type StatusChipSize = 'small' | 'medium' | 'large'

// Base props interface for all status components
export interface BaseStatusChipProps {
  // Display configuration
  size?: StatusChipSize
  readonly?: boolean

  // State management
  loading?: boolean
  disabled?: boolean

  // Styling options
  variant?: 'flat' | 'outlined' | 'elevated'
}

// Component-specific props interfaces
export interface WorkflowStatusChipProps extends BaseStatusChipProps {
  status: WorkflowStatus
}

export interface LifecycleStatusChipProps extends BaseStatusChipProps {
  status: LifecycleStatus
}

export interface BinaryStatusChipProps extends BaseStatusChipProps {
  status: BinaryStatus
}

export interface ReviewStatusChipProps extends BaseStatusChipProps {
  status: ReviewStatus
}

export interface PriorityChipProps extends BaseStatusChipProps {
  priority: Priority
}

// Emits interfaces
export interface WorkflowStatusChipEmits {
  'status-change': [newStatus: WorkflowStatus]
  error: [error: Error]
}

export interface LifecycleStatusChipEmits {
  'status-change': [newStatus: LifecycleStatus]
  error: [error: Error]
}

export interface BinaryStatusChipEmits {
  'status-change': [newStatus: BinaryStatus]
  error: [error: Error]
}

export interface ReviewStatusChipEmits {
  'status-change': [newStatus: ReviewStatus]
  error: [error: Error]
}

export interface PriorityChipEmits {
  'priority-change': [newPriority: Priority]
  error: [error: Error]
}

// Status configuration mappings
export interface StatusOption<T = AllStatusTypes> {
  text: string
  value: T
}

export interface StatusColorMapping {
  [key: string]: string
}

export interface StatusTextMapping {
  [key: string]: string
}

// Size configuration mapping
export interface SizeConfig {
  chipSize: 'x-small' | 'small' | 'default' | 'large'
  selectWidth: string
}

export interface SizeConfigMapping {
  small: SizeConfig
  medium: SizeConfig
  large: SizeConfig
}
