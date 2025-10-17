import type { User } from './auth'
import type { BaseEpic } from './base-entities'

// Steering Document Types
export interface SteeringDocument {
  id: string
  reference_id: string
  title: string
  description?: string
  creator_id: string
  created_at: string
  updated_at: string

  // Optional populated fields
  creator?: User
  epics?: BaseEpic[]
}

export interface CreateSteeringDocumentRequest {
  title: string
  description?: string
  epic_id?: string // для автоматической привязки к эпику
}

export interface UpdateSteeringDocumentRequest {
  title?: string
  description?: string
}

export interface SteeringDocumentListParams {
  creator_id?: string
  order_by?: string
  limit?: number
  offset?: number
  include?: string | string[]
}

export interface SteeringDocumentListResponse {
  steering_documents: SteeringDocument[]
  count: number
}
