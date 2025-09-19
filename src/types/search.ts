import type { EntityType } from './common'

// Search Types
export interface SearchResult {
  entity_type: EntityType
  entity_id: string
  reference_id: string
  title: string
  description?: string
  highlight?: string
  rank: number
}

export interface SearchResponse {
  results: SearchResult[]
  total_count: number
  query: string
  entity_types: string[]
  limit: number
  offset: number
}

export interface SearchParams {
  q: string // required query
  entity_types?: string // comma-separated: epic,user_story,acceptance_criteria,requirement
  limit?: number // 1-100, default 50
  offset?: number // for pagination
}

export interface SearchSuggestionsParams {
  query: string // minimum 2 characters
  limit?: number // 1-50, default 10
}

export interface SearchSuggestionsResponse {
  titles: string[]
  reference_ids: string[]
  statuses: string[]
}
