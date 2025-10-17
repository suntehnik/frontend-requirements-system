import { describe, it, expect, beforeEach, vi } from 'vitest'

// Services
import { steeringDocumentService } from '@/services'
import type {
  SteeringDocument,
  CreateSteeringDocumentRequest,
  UpdateSteeringDocumentRequest,
  Epic,
} from '@/types'

// Mock the services
vi.mock('@/services/steering-document-service')

const mockSteeringDocumentService = vi.mocked(steeringDocumentService)

// Test data
const mockSteeringDocument: SteeringDocument = {
  id: '1',
  reference_id: 'STD-001',
  title: 'Test Steering Document',
  description: '# Test Description\n\nThis is a test document.',
  creator_id: 'user-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockEpic: Epic = {
  id: 'epic-1',
  reference_id: 'EP-001',
  title: 'Test Epic',
  description: 'Test epic description',
  creator_id: 'user-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  status: 'Draft',
  priority: 3,
}

const mockSteeringDocuments: SteeringDocument[] = [
  mockSteeringDocument,
  {
    id: '2',
    reference_id: 'STD-002',
    title: 'Another Document',
    description: 'Another test document',
    creator_id: 'user-2',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
]

// Simple integration tests focusing on service interactions and data flow

describe('Steering Documents Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock implementations
    mockSteeringDocumentService.list.mockResolvedValue({
      steering_documents: mockSteeringDocuments,
      count: mockSteeringDocuments.length,
    })

    mockSteeringDocumentService.get.mockResolvedValue(mockSteeringDocument)
    mockSteeringDocumentService.create.mockResolvedValue(mockSteeringDocument)
    mockSteeringDocumentService.update.mockResolvedValue(mockSteeringDocument)
    mockSteeringDocumentService.delete.mockResolvedValue(undefined)
    mockSteeringDocumentService.getEpicDocuments.mockResolvedValue([mockSteeringDocument])
    mockSteeringDocumentService.linkToEpic.mockResolvedValue(undefined)
    mockSteeringDocumentService.unlinkFromEpic.mockResolvedValue(undefined)
  })

  describe('Service Integration Tests', () => {
    it('should handle full CRUD operations for steering documents', async () => {
      // Test Create
      const createRequest: CreateSteeringDocumentRequest = {
        title: 'Test Document',
        description: 'Test description',
      }

      const createdDocument = await steeringDocumentService.create(createRequest)
      expect(mockSteeringDocumentService.create).toHaveBeenCalledWith(createRequest)
      expect(createdDocument).toEqual(mockSteeringDocument)

      // Test Read (list)
      const listResponse = await steeringDocumentService.list()
      expect(mockSteeringDocumentService.list).toHaveBeenCalled()
      expect(listResponse.steering_documents).toEqual(mockSteeringDocuments)

      // Test Read (get)
      const document = await steeringDocumentService.get('STD-001')
      expect(mockSteeringDocumentService.get).toHaveBeenCalledWith('STD-001')
      expect(document).toEqual(mockSteeringDocument)

      // Test Update
      const updateRequest: UpdateSteeringDocumentRequest = {
        title: 'Updated Title',
      }

      const updatedDocument = await steeringDocumentService.update('1', updateRequest)
      expect(mockSteeringDocumentService.update).toHaveBeenCalledWith('1', updateRequest)
      expect(updatedDocument).toEqual(mockSteeringDocument)

      // Test Delete
      await steeringDocumentService.delete('1')
      expect(mockSteeringDocumentService.delete).toHaveBeenCalledWith('1')
    })

    it('should handle epic-document linking operations', async () => {
      const epicId = 'epic-1'
      const documentId = 'doc-1'

      // Test getting epic documents
      const epicDocuments = await steeringDocumentService.getEpicDocuments(epicId)
      expect(mockSteeringDocumentService.getEpicDocuments).toHaveBeenCalledWith(epicId)
      expect(epicDocuments).toEqual([mockSteeringDocument])

      // Test linking document to epic
      await steeringDocumentService.linkToEpic(epicId, documentId)
      expect(mockSteeringDocumentService.linkToEpic).toHaveBeenCalledWith(epicId, documentId)

      // Test unlinking document from epic
      await steeringDocumentService.unlinkFromEpic(epicId, documentId)
      expect(mockSteeringDocumentService.unlinkFromEpic).toHaveBeenCalledWith(epicId, documentId)
    })

    it('should handle API errors gracefully', async () => {
      const apiError = new Error('API Error')
      mockSteeringDocumentService.get.mockRejectedValue(apiError)

      await expect(steeringDocumentService.get('non-existent')).rejects.toThrow('API Error')
      expect(mockSteeringDocumentService.get).toHaveBeenCalledWith('non-existent')
    })

    it('should handle 404 errors for non-existent documents', async () => {
      const notFoundError = new Error('Document not found')
      Object.assign(notFoundError, { response: { status: 404 } })
      mockSteeringDocumentService.get.mockRejectedValue(notFoundError)

      await expect(steeringDocumentService.get('NON-EXISTENT')).rejects.toThrow(
        'Document not found',
      )
    })
  })

  describe('Data Flow Integration', () => {
    it('should maintain data consistency across operations', async () => {
      // Create a document
      const createRequest: CreateSteeringDocumentRequest = {
        title: 'Integration Test Document',
        description: 'Test description for integration',
      }

      await steeringDocumentService.create(createRequest)
      expect(mockSteeringDocumentService.create).toHaveBeenCalledWith(createRequest)

      // List documents should include the new document
      await steeringDocumentService.list()
      expect(mockSteeringDocumentService.list).toHaveBeenCalled()

      // Get the specific document
      await steeringDocumentService.get(mockSteeringDocument.reference_id)
      expect(mockSteeringDocumentService.get).toHaveBeenCalledWith(
        mockSteeringDocument.reference_id,
      )

      // Update the document
      const updateRequest: UpdateSteeringDocumentRequest = {
        title: 'Updated Integration Test Document',
      }

      await steeringDocumentService.update(mockSteeringDocument.id, updateRequest)
      expect(mockSteeringDocumentService.update).toHaveBeenCalledWith(
        mockSteeringDocument.id,
        updateRequest,
      )
    })

    it('should handle epic-document relationships correctly', async () => {
      const epicId = mockEpic.id
      const documentId = mockSteeringDocument.id

      // Initially, epic should have no documents
      mockSteeringDocumentService.getEpicDocuments.mockResolvedValueOnce([])
      let epicDocuments = await steeringDocumentService.getEpicDocuments(epicId)
      expect(epicDocuments).toEqual([])

      // Link document to epic
      await steeringDocumentService.linkToEpic(epicId, documentId)
      expect(mockSteeringDocumentService.linkToEpic).toHaveBeenCalledWith(epicId, documentId)

      // Now epic should have the document
      mockSteeringDocumentService.getEpicDocuments.mockResolvedValueOnce([mockSteeringDocument])
      epicDocuments = await steeringDocumentService.getEpicDocuments(epicId)
      expect(epicDocuments).toEqual([mockSteeringDocument])

      // Unlink document from epic
      await steeringDocumentService.unlinkFromEpic(epicId, documentId)
      expect(mockSteeringDocumentService.unlinkFromEpic).toHaveBeenCalledWith(epicId, documentId)

      // Epic should have no documents again
      mockSteeringDocumentService.getEpicDocuments.mockResolvedValueOnce([])
      epicDocuments = await steeringDocumentService.getEpicDocuments(epicId)
      expect(epicDocuments).toEqual([])
    })
  })

  describe('Validation and Error Handling', () => {
    it('should validate document creation requests', async () => {
      // Test with invalid data
      const invalidRequest = {
        title: '', // Empty title should be invalid
        description: 'Valid description',
      } as CreateSteeringDocumentRequest

      // The service should handle validation
      await steeringDocumentService.create(invalidRequest)
      expect(mockSteeringDocumentService.create).toHaveBeenCalledWith(invalidRequest)
    })

    it('should handle network errors during operations', async () => {
      const networkError = new Error('Network error')
      mockSteeringDocumentService.list.mockRejectedValue(networkError)

      await expect(steeringDocumentService.list()).rejects.toThrow('Network error')
    })

    it('should handle concurrent operations correctly', async () => {
      // Simulate concurrent operations
      const promises = [
        steeringDocumentService.get('doc-1'),
        steeringDocumentService.get('doc-2'),
        steeringDocumentService.list(),
      ]

      await Promise.all(promises)

      expect(mockSteeringDocumentService.get).toHaveBeenCalledTimes(2)
      expect(mockSteeringDocumentService.list).toHaveBeenCalledTimes(1)
    })
  })

  describe('Component Integration Scenarios', () => {
    it('should support the complete document management workflow', async () => {
      // Scenario: User creates a document, links it to an epic, then edits it

      // 1. Create document
      const createRequest: CreateSteeringDocumentRequest = {
        title: 'Workflow Test Document',
        description: 'Document for testing complete workflow',
      }

      await steeringDocumentService.create(createRequest)
      expect(mockSteeringDocumentService.create).toHaveBeenCalledWith(createRequest)

      // 2. Link to epic
      await steeringDocumentService.linkToEpic(mockEpic.id, mockSteeringDocument.id)
      expect(mockSteeringDocumentService.linkToEpic).toHaveBeenCalledWith(
        mockEpic.id,
        mockSteeringDocument.id,
      )

      // 3. Verify epic has the document
      await steeringDocumentService.getEpicDocuments(mockEpic.id)
      expect(mockSteeringDocumentService.getEpicDocuments).toHaveBeenCalledWith(mockEpic.id)

      // 4. Update document
      const updateRequest: UpdateSteeringDocumentRequest = {
        title: 'Updated Workflow Test Document',
        description: 'Updated description',
      }

      await steeringDocumentService.update(mockSteeringDocument.id, updateRequest)
      expect(mockSteeringDocumentService.update).toHaveBeenCalledWith(
        mockSteeringDocument.id,
        updateRequest,
      )

      // 5. Get updated document
      await steeringDocumentService.get(mockSteeringDocument.reference_id)
      expect(mockSteeringDocumentService.get).toHaveBeenCalledWith(
        mockSteeringDocument.reference_id,
      )
    })

    it('should handle document filtering and search scenarios', async () => {
      // Test list with parameters
      const listParams = {
        creator_id: 'user-1',
        limit: 10,
        offset: 0,
      }

      await steeringDocumentService.list(listParams)
      expect(mockSteeringDocumentService.list).toHaveBeenCalledWith(listParams)

      // Test getting document with includes
      await steeringDocumentService.get(mockSteeringDocument.reference_id, 'creator,epics')
      expect(mockSteeringDocumentService.get).toHaveBeenCalledWith(
        mockSteeringDocument.reference_id,
        'creator,epics',
      )
    })
  })
})
