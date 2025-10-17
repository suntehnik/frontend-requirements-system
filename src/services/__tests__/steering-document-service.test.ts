import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SteeringDocumentService } from '../steering-document-service'
import { httpClient } from '../http-client'
import type {
  SteeringDocument,
  CreateSteeringDocumentRequest,
  UpdateSteeringDocumentRequest,
  SteeringDocumentListParams,
  SteeringDocumentListResponse,
} from '@/types'

// Mock the http client
vi.mock('../http-client', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('SteeringDocumentService', () => {
  let steeringDocumentService: SteeringDocumentService

  beforeEach(() => {
    steeringDocumentService = new SteeringDocumentService()
    vi.clearAllMocks()
  })

  const mockSteeringDocument: SteeringDocument = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    reference_id: 'STD-001',
    title: 'Code Review Standards',
    description:
      'This document outlines the code review standards and practices for the development team...',
    creator_id: '123e4567-e89b-12d3-a456-426614174001',
    created_at: '2023-01-15T10:30:00Z',
    updated_at: '2023-01-16T14:45:30Z',
  }

  describe('list', () => {
    it('should get list of steering documents without parameters', async () => {
      const mockResponse: SteeringDocumentListResponse = {
        steering_documents: [mockSteeringDocument],
        count: 1,
      }

      vi.mocked(httpClient.get).mockResolvedValue(mockResponse)

      const result = await steeringDocumentService.list()

      expect(httpClient.get).toHaveBeenCalledWith('/api/v1/steering-documents', {})
      expect(result).toEqual(mockResponse)
    })

    it('should get list of steering documents with parameters', async () => {
      const params: SteeringDocumentListParams = {
        creator_id: '123e4567-e89b-12d3-a456-426614174001',
        order_by: 'created_at',
        limit: 10,
        offset: 0,
        include: 'creator',
      }

      const mockResponse: SteeringDocumentListResponse = {
        steering_documents: [mockSteeringDocument],
        count: 1,
      }

      vi.mocked(httpClient.get).mockResolvedValue(mockResponse)

      const result = await steeringDocumentService.list(params)

      expect(httpClient.get).toHaveBeenCalledWith('/api/v1/steering-documents', {
        creator_id: '123e4567-e89b-12d3-a456-426614174001',
        order_by: 'created_at',
        limit: 10,
        offset: 0,
        include: 'creator',
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle list API error', async () => {
      const mockError = new Error('Failed to fetch steering documents')
      vi.mocked(httpClient.get).mockRejectedValue(mockError)

      await expect(steeringDocumentService.list()).rejects.toThrow(
        'Failed to fetch steering documents',
      )
    })
  })

  describe('get', () => {
    it('should get steering document by ID without include', async () => {
      vi.mocked(httpClient.get).mockResolvedValue(mockSteeringDocument)

      const result = await steeringDocumentService.get('123e4567-e89b-12d3-a456-426614174000')

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/v1/steering-documents/123e4567-e89b-12d3-a456-426614174000',
        {},
      )
      expect(result).toEqual(mockSteeringDocument)
    })

    it('should get steering document by reference_id with include', async () => {
      vi.mocked(httpClient.get).mockResolvedValue(mockSteeringDocument)

      const result = await steeringDocumentService.get('STD-001', 'creator,epics')

      expect(httpClient.get).toHaveBeenCalledWith('/api/v1/steering-documents/STD-001', {
        include: 'creator,epics',
      })
      expect(result).toEqual(mockSteeringDocument)
    })

    it('should handle get API error', async () => {
      const mockError = new Error('Steering document not found')
      vi.mocked(httpClient.get).mockRejectedValue(mockError)

      await expect(steeringDocumentService.get('invalid-id')).rejects.toThrow(
        'Steering document not found',
      )
    })
  })

  describe('create', () => {
    it('should create steering document successfully', async () => {
      const createRequest: CreateSteeringDocumentRequest = {
        title: 'New Code Standards',
        description: 'Updated coding standards for the team',
      }

      vi.mocked(httpClient.post).mockResolvedValue(mockSteeringDocument)

      const result = await steeringDocumentService.create(createRequest)

      expect(httpClient.post).toHaveBeenCalledWith('/api/v1/steering-documents', createRequest)
      expect(result).toEqual(mockSteeringDocument)
    })

    it('should create steering document with epic_id', async () => {
      const createRequest: CreateSteeringDocumentRequest = {
        title: 'Epic-specific Standards',
        description: 'Standards specific to this epic',
        epic_id: '123e4567-e89b-12d3-a456-426614174002',
      }

      vi.mocked(httpClient.post).mockResolvedValue(mockSteeringDocument)

      const result = await steeringDocumentService.create(createRequest)

      expect(httpClient.post).toHaveBeenCalledWith('/api/v1/steering-documents', createRequest)
      expect(result).toEqual(mockSteeringDocument)
    })

    it('should handle create API error', async () => {
      const createRequest: CreateSteeringDocumentRequest = {
        title: '',
        description: 'Invalid request with empty title',
      }

      const mockError = new Error('Title is required')
      vi.mocked(httpClient.post).mockRejectedValue(mockError)

      await expect(steeringDocumentService.create(createRequest)).rejects.toThrow(
        'Title is required',
      )
    })
  })

  describe('update', () => {
    it('should update steering document successfully', async () => {
      const updateRequest: UpdateSteeringDocumentRequest = {
        title: 'Updated Code Standards',
        description: 'Updated description for coding standards',
      }

      const updatedDocument = {
        ...mockSteeringDocument,
        ...updateRequest,
        updated_at: '2023-01-17T10:00:00Z',
      }

      vi.mocked(httpClient.put).mockResolvedValue(updatedDocument)

      const result = await steeringDocumentService.update(
        '123e4567-e89b-12d3-a456-426614174000',
        updateRequest,
      )

      expect(httpClient.put).toHaveBeenCalledWith(
        '/api/v1/steering-documents/123e4567-e89b-12d3-a456-426614174000',
        updateRequest,
      )
      expect(result).toEqual(updatedDocument)
    })

    it('should update only title', async () => {
      const updateRequest: UpdateSteeringDocumentRequest = {
        title: 'New Title Only',
      }

      const updatedDocument = {
        ...mockSteeringDocument,
        title: 'New Title Only',
        updated_at: '2023-01-17T10:00:00Z',
      }

      vi.mocked(httpClient.put).mockResolvedValue(updatedDocument)

      const result = await steeringDocumentService.update(
        '123e4567-e89b-12d3-a456-426614174000',
        updateRequest,
      )

      expect(httpClient.put).toHaveBeenCalledWith(
        '/api/v1/steering-documents/123e4567-e89b-12d3-a456-426614174000',
        updateRequest,
      )
      expect(result).toEqual(updatedDocument)
    })

    it('should handle update API error', async () => {
      const updateRequest: UpdateSteeringDocumentRequest = {
        title: 'Updated Title',
      }

      const mockError = new Error('Steering document not found')
      vi.mocked(httpClient.put).mockRejectedValue(mockError)

      await expect(steeringDocumentService.update('invalid-id', updateRequest)).rejects.toThrow(
        'Steering document not found',
      )
    })
  })

  describe('delete', () => {
    it('should delete steering document successfully', async () => {
      vi.mocked(httpClient.delete).mockResolvedValue(undefined)

      await steeringDocumentService.delete('123e4567-e89b-12d3-a456-426614174000')

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/api/v1/steering-documents/123e4567-e89b-12d3-a456-426614174000',
      )
    })

    it('should handle delete API error', async () => {
      const mockError = new Error('Steering document not found')
      vi.mocked(httpClient.delete).mockRejectedValue(mockError)

      await expect(steeringDocumentService.delete('invalid-id')).rejects.toThrow(
        'Steering document not found',
      )
    })
  })

  describe('linkToEpic', () => {
    it('should link steering document to epic successfully', async () => {
      vi.mocked(httpClient.post).mockResolvedValue(undefined)

      await steeringDocumentService.linkToEpic('epic-123', 'doc-456')

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/v1/epics/epic-123/steering-documents/doc-456',
        undefined,
      )
    })

    it('should handle link API error', async () => {
      const mockError = new Error('Epic or document not found')
      vi.mocked(httpClient.post).mockRejectedValue(mockError)

      await expect(
        steeringDocumentService.linkToEpic('invalid-epic', 'invalid-doc'),
      ).rejects.toThrow('Epic or document not found')
    })
  })

  describe('unlinkFromEpic', () => {
    it('should unlink steering document from epic successfully', async () => {
      vi.mocked(httpClient.delete).mockResolvedValue(undefined)

      await steeringDocumentService.unlinkFromEpic('epic-123', 'doc-456')

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/api/v1/epics/epic-123/steering-documents/doc-456',
      )
    })

    it('should handle unlink API error', async () => {
      const mockError = new Error('Link not found')
      vi.mocked(httpClient.delete).mockRejectedValue(mockError)

      await expect(
        steeringDocumentService.unlinkFromEpic('invalid-epic', 'invalid-doc'),
      ).rejects.toThrow('Link not found')
    })
  })

  describe('getEpicDocuments', () => {
    it('should get epic documents successfully', async () => {
      const mockResponse = {
        steering_documents: [mockSteeringDocument],
      }

      vi.mocked(httpClient.get).mockResolvedValue(mockResponse)

      const result = await steeringDocumentService.getEpicDocuments('epic-123')

      expect(httpClient.get).toHaveBeenCalledWith('/api/v1/epics/epic-123/steering-documents', {})
      expect(result).toEqual([mockSteeringDocument])
    })

    it('should handle empty epic documents response', async () => {
      const mockResponse = {
        steering_documents: [],
      }

      vi.mocked(httpClient.get).mockResolvedValue(mockResponse)

      const result = await steeringDocumentService.getEpicDocuments('epic-123')

      expect(httpClient.get).toHaveBeenCalledWith('/api/v1/epics/epic-123/steering-documents', {})
      expect(result).toEqual([])
    })

    it('should handle getEpicDocuments API error', async () => {
      const mockError = new Error('Epic not found')
      vi.mocked(httpClient.get).mockRejectedValue(mockError)

      await expect(steeringDocumentService.getEpicDocuments('invalid-epic')).rejects.toThrow(
        'Epic not found',
      )
    })
  })

  describe('buildQueryParams', () => {
    it('should filter out undefined and null values', async () => {
      const params: SteeringDocumentListParams = {
        creator_id: undefined,
        order_by: 'created_at',
        limit: null as unknown as number,
        offset: 0,
        include: '',
      }

      const mockResponse: SteeringDocumentListResponse = {
        steering_documents: [],
        count: 0,
      }

      vi.mocked(httpClient.get).mockResolvedValue(mockResponse)

      await steeringDocumentService.list(params)

      expect(httpClient.get).toHaveBeenCalledWith('/api/v1/steering-documents', {
        order_by: 'created_at',
        offset: 0,
      })
    })
  })

  describe('buildIncludeParam', () => {
    it('should handle string include parameter', async () => {
      vi.mocked(httpClient.get).mockResolvedValue(mockSteeringDocument)

      await steeringDocumentService.get('doc-123', 'creator')

      expect(httpClient.get).toHaveBeenCalledWith('/api/v1/steering-documents/doc-123', {
        include: 'creator',
      })
    })

    it('should handle array include parameter', async () => {
      const params: SteeringDocumentListParams = {
        include: ['creator', 'epics'],
      }

      const mockResponse: SteeringDocumentListResponse = {
        steering_documents: [],
        count: 0,
      }

      vi.mocked(httpClient.get).mockResolvedValue(mockResponse)

      await steeringDocumentService.list(params)

      expect(httpClient.get).toHaveBeenCalledWith('/api/v1/steering-documents', {
        include: 'creator,epics',
      })
    })
  })
})
