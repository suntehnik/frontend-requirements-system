/**
 * Response Adapters
 * 
 * Adapts real API responses to expected TypeScript interface format.
 * The real API returns responses in format { count: number, [entity_name]: T[] }
 * but our TypeScript interfaces expect { data: T[], total_count: number, limit: number, offset: number }
 */

import type { ListResponse } from '@/types'

/**
 * Real API response structure for list endpoints
 */
interface RealApiListResponse<T> {
  count: number
  [key: string]: T[] | number
}

/**
 * Epic List Response Adapter
 */
export class EpicListResponseAdapter {
  static adapt(realResponse: RealApiListResponse<any>, limit?: number, offset?: number): ListResponse<any> {
    if (!this.validate(realResponse)) {
      throw new Error('Invalid epic list response structure')
    }

    return {
      data: realResponse.epics as any[],
      total_count: realResponse.count,
      limit: limit || 50,
      offset: offset || 0
    }
  }

  static validate(response: any): response is RealApiListResponse<any> {
    return (
      response &&
      typeof response === 'object' &&
      typeof response.count === 'number' &&
      Array.isArray(response.epics)
    )
  }
}

/**
 * User Story List Response Adapter
 */
export class UserStoryListResponseAdapter {
  static adapt(realResponse: RealApiListResponse<any>, limit?: number, offset?: number): ListResponse<any> {
    if (!this.validate(realResponse)) {
      throw new Error('Invalid user story list response structure')
    }

    return {
      data: realResponse.user_stories as any[],
      total_count: realResponse.count,
      limit: limit || 50,
      offset: offset || 0
    }
  }

  static validate(response: any): response is RealApiListResponse<any> {
    return (
      response &&
      typeof response === 'object' &&
      typeof response.count === 'number' &&
      Array.isArray(response.user_stories)
    )
  }
}

/**
 * Acceptance Criteria List Response Adapter
 */
export class AcceptanceCriteriaListResponseAdapter {
  static adapt(realResponse: RealApiListResponse<any>, limit?: number, offset?: number): ListResponse<any> {
    if (!this.validate(realResponse)) {
      throw new Error('Invalid acceptance criteria list response structure')
    }

    return {
      data: realResponse.acceptance_criteria as any[],
      total_count: realResponse.count,
      limit: limit || 50,
      offset: offset || 0
    }
  }

  static validate(response: any): response is RealApiListResponse<any> {
    return (
      response &&
      typeof response === 'object' &&
      typeof response.count === 'number' &&
      Array.isArray(response.acceptance_criteria)
    )
  }
}

/**
 * Requirement List Response Adapter
 */
export class RequirementListResponseAdapter {
  static adapt(realResponse: RealApiListResponse<any>, limit?: number, offset?: number): ListResponse<any> {
    if (!this.validate(realResponse)) {
      throw new Error('Invalid requirement list response structure')
    }

    return {
      data: realResponse.requirements as any[],
      total_count: realResponse.count,
      limit: limit || 50,
      offset: offset || 0
    }
  }

  static validate(response: any): response is RealApiListResponse<any> {
    return (
      response &&
      typeof response === 'object' &&
      typeof response.count === 'number' &&
      Array.isArray(response.requirements)
    )
  }
}

/**
 * Response Adapter Factory
 */
export class ResponseAdapterFactory {
  static adaptEpicList(response: any, limit?: number, offset?: number): ListResponse<any> {
    return EpicListResponseAdapter.adapt(response, limit, offset)
  }

  static adaptUserStoryList(response: any, limit?: number, offset?: number): ListResponse<any> {
    return UserStoryListResponseAdapter.adapt(response, limit, offset)
  }

  static adaptAcceptanceCriteriaList(response: any, limit?: number, offset?: number): ListResponse<any> {
    return AcceptanceCriteriaListResponseAdapter.adapt(response, limit, offset)
  }

  static adaptRequirementList(response: any, limit?: number, offset?: number): ListResponse<any> {
    return RequirementListResponseAdapter.adapt(response, limit, offset)
  }
}

/**
 * Generic response adapter utility
 */
export function adaptResponse<T>(
  response: any,
  entityKey: string,
  limit?: number,
  offset?: number
): ListResponse<T> {
  // Check if response is already in the expected format
  if (
    response &&
    typeof response === 'object' &&
    Array.isArray(response.data) &&
    typeof response.total_count === 'number'
  ) {
    return response as ListResponse<T>
  }

  // Check if response is in real API format
  if (
    response &&
    typeof response === 'object' &&
    typeof response.count === 'number' &&
    Array.isArray(response[entityKey])
  ) {
    return {
      data: response[entityKey] as T[],
      total_count: response.count,
      limit: limit || 50,
      offset: offset || 0
    }
  }

  throw new Error(`Unable to adapt response: missing 'count' or 'data' properties`)
}

/**
 * Adapter for user story creation validation errors
 * The API might require additional fields that aren't in our TypeScript interface
 */
export function adaptUserStoryCreateRequest(request: any): any {
  // The API might require creator_id to be explicitly set
  // For now, we'll pass the request as-is and let the API handle it
  return request
}