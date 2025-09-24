/**
 * Response Adapters Tests
 */

import { describe, it, expect } from 'vitest'
import {
  EpicListResponseAdapter,
  ResponseAdapterFactory,
  adaptResponse
} from '../response-adapters'
import type { Epic, UserStory, Requirement } from '@/types'

describe('Response Adapters', () => {
  describe('EpicListResponseAdapter', () => {
    it('should adapt real API response to expected format', () => {
      const realResponse = {
        count: 2,
        epics: [
          { id: '1', reference_id: 'EP-001', title: 'Test Epic 1' },
          { id: '2', reference_id: 'EP-002', title: 'Test Epic 2' }
        ] as Epic[]
      }

      const adapted = EpicListResponseAdapter.adapt(realResponse, 10, 0)

      expect(adapted).toEqual({
        data: realResponse.epics,
        total_count: 2,
        limit: 10,
        offset: 0
      })
    })

    it('should validate response structure', () => {
      const validResponse = {
        count: 1,
        epics: [{ id: '1', reference_id: 'EP-001', title: 'Test' }]
      }

      const invalidResponse = {
        total: 1,
        items: []
      }

      expect(EpicListResponseAdapter.validate(validResponse)).toBe(true)
      expect(EpicListResponseAdapter.validate(invalidResponse)).toBe(false)
    })
  })

  describe('ResponseAdapterFactory', () => {
    it('should adapt epic list response', () => {
      const realResponse = {
        count: 1,
        epics: [{ id: '1', reference_id: 'EP-001', title: 'Test Epic' }] as Epic[]
      }

      const adapted = ResponseAdapterFactory.adaptEpicList(realResponse, 5, 0)

      expect(adapted.data).toHaveLength(1)
      expect(adapted.total_count).toBe(1)
      expect(adapted.limit).toBe(5)
      expect(adapted.offset).toBe(0)
    })

    it('should throw error for invalid response', () => {
      const invalidResponse = { invalid: true }

      expect(() => {
        ResponseAdapterFactory.adaptEpicList(invalidResponse)
      }).toThrow('Invalid epic list response structure')
    })
  })

  describe('adaptResponse utility', () => {
    it('should detect and adapt real API format', () => {
      const realResponse = {
        count: 2,
        user_stories: [
          { id: '1', reference_id: 'US-001', title: 'Test Story 1' },
          { id: '2', reference_id: 'US-002', title: 'Test Story 2' }
        ] as UserStory[]
      }

      const adapted = adaptResponse<UserStory>(realResponse, 'user_stories', 20, 10)

      expect(adapted).toEqual({
        data: realResponse.user_stories,
        total_count: 2,
        limit: 20,
        offset: 10
      })
    })

    it('should pass through already adapted format', () => {
      const alreadyAdapted = {
        data: [{ id: '1', reference_id: 'REQ-001', title: 'Test Requirement' }] as Requirement[],
        total_count: 1,
        limit: 50,
        offset: 0
      }

      const result = adaptResponse<Requirement>(alreadyAdapted, 'requirements')

      expect(result).toEqual(alreadyAdapted)
    })

    it('should throw error for invalid response', () => {
      const invalidResponse = { invalid: true }

      expect(() => {
        adaptResponse(invalidResponse, 'data')
      }).toThrow("Unable to adapt response: missing 'count' or 'data' properties")
    })
  })
})