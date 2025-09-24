/**
 * API Response Validator Tests
 */

import { describe, it, expect } from 'vitest'
import {
  HttpStatusValidator,
  DataTypeValidator,
  SchemaValidator,
  ApiResponseValidator
} from '../api-response-validator'

describe('API Response Validator', () => {
  describe('HttpStatusValidator', () => {
    it('should validate correct status codes', () => {
      const result = HttpStatusValidator.validate(200, 200, 'OK')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.expectedStatus).toBe(200)
      expect(result.actualStatus).toBe(200)
    })

    it('should detect incorrect status codes', () => {
      const result = HttpStatusValidator.validate(404, 200, 'Not Found')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('Expected HTTP status 200, got 404')
    })

    it('should validate success status codes', () => {
      const result = HttpStatusValidator.validateSuccess(201, 'Created')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid success status codes', () => {
      const result = HttpStatusValidator.validateSuccess(404, 'Not Found')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('DataTypeValidator', () => {
    it('should validate string fields', () => {
      const result = DataTypeValidator.validateField('test', 'string', 'title')
      
      expect(result.isValid).toBe(true)
      expect(result.field).toBe('title')
      expect(result.expectedType).toBe('string')
      expect(result.actualType).toBe('string')
    })

    it('should detect type mismatches', () => {
      const result = DataTypeValidator.validateField(123, 'string', 'title')
      
      expect(result.isValid).toBe(false)
      expect(result.message).toContain('Expected string, got number')
    })

    it('should validate optional fields', () => {
      const result = DataTypeValidator.validateField(undefined, 'string', 'description', true)
      
      expect(result.isValid).toBe(true)
      expect(result.message).toContain('Optional field is undefined/null')
    })

    it('should validate enum values', () => {
      const result = DataTypeValidator.validateEnum('Draft', ['Draft', 'Active', 'Obsolete'], 'status')
      
      expect(result.isValid).toBe(true)
    })

    it('should detect invalid enum values', () => {
      const result = DataTypeValidator.validateEnum('Invalid', ['Draft', 'Active', 'Obsolete'], 'status')
      
      expect(result.isValid).toBe(false)
      expect(result.message).toContain('Expected one of [Draft, Active, Obsolete]')
    })
  })

  describe('SchemaValidator', () => {
    it('should validate user objects', () => {
      const validUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        role: 'User',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      const result = SchemaValidator.validateUser(validUser)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing required fields', () => {
      const invalidUser = {
        username: 'testuser'
        // missing required fields
      }

      const result = SchemaValidator.validateUser(invalidUser)
      
      expect(result.isValid).toBe(false)
      expect(result.missingFields.length).toBeGreaterThan(0)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should validate list response structure', () => {
      const validListResponse = {
        data: [
          { id: '1', title: 'Test Item 1' },
          { id: '2', title: 'Test Item 2' }
        ],
        total_count: 2,
        limit: 50,
        offset: 0
      }

      const result = SchemaValidator.validateListResponse(validListResponse)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('ApiResponseValidator', () => {
    it('should validate complete API response', () => {
      const response = {
        status: 200,
        statusText: 'OK',
        data: {
          data: [],
          total_count: 0,
          limit: 50,
          offset: 0
        }
      }

      const result = ApiResponseValidator.validateResponse(
        response,
        200,
        SchemaValidator.validateListResponse
      )
      
      expect(result.overallValid).toBe(true)
      expect(result.httpValidation.isValid).toBe(true)
      expect(result.schemaValidation?.isValid).toBe(true)
    })

    it('should detect HTTP status errors', () => {
      const response = {
        status: 404,
        statusText: 'Not Found',
        data: null
      }

      const result = ApiResponseValidator.validateResponse(response, 200)
      
      expect(result.overallValid).toBe(false)
      expect(result.httpValidation.isValid).toBe(false)
    })
  })
})