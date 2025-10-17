import { BaseApiService } from './base-api-service'
import type {
  SteeringDocument,
  CreateSteeringDocumentRequest,
  UpdateSteeringDocumentRequest,
  SteeringDocumentListParams,
  SteeringDocumentListResponse,
} from '@/types'

export class SteeringDocumentService extends BaseApiService {
  private entityPath = '/steering-documents'

  /**
   * Get list of steering documents
   */
  async list(params?: SteeringDocumentListParams): Promise<SteeringDocumentListResponse> {
    const queryParams = params
      ? this.buildQueryParams({
          creator_id: params.creator_id,
          order_by: params.order_by,
          limit: params.limit,
          offset: params.offset,
          include: this.buildIncludeParam(params.include),
        })
      : {}

    return await this.apiGet<SteeringDocumentListResponse>(this.entityPath, queryParams)
  }

  /**
   * Get a single steering document by ID or reference_id
   */
  async get(id: string, include?: string): Promise<SteeringDocument> {
    const params = include ? { include: this.buildIncludeParam(include) } : {}
    return await this.apiGet<SteeringDocument>(`${this.entityPath}/${id}`, params)
  }

  /**
   * Create a new steering document
   */
  async create(request: CreateSteeringDocumentRequest): Promise<SteeringDocument> {
    return await this.apiPost<SteeringDocument>(this.entityPath, request)
  }

  /**
   * Update an existing steering document
   */
  async update(id: string, request: UpdateSteeringDocumentRequest): Promise<SteeringDocument> {
    return await this.apiPut<SteeringDocument>(`${this.entityPath}/${id}`, request)
  }

  /**
   * Delete a steering document
   */
  async delete(id: string): Promise<void> {
    await this.apiDelete(`${this.entityPath}/${id}`)
  }

  /**
   * Link a steering document to an epic
   */
  async linkToEpic(epicId: string, docId: string): Promise<void> {
    await this.apiPost(`/epics/${epicId}/steering-documents/${docId}`, undefined)
  }

  /**
   * Unlink a steering document from an epic
   */
  async unlinkFromEpic(epicId: string, docId: string): Promise<void> {
    await this.apiDelete(`/epics/${epicId}/steering-documents/${docId}`)
  }

  /**
   * Get all steering documents linked to an epic
   */
  async getEpicDocuments(epicId: string): Promise<SteeringDocument[]> {
    const response = await this.apiGet<{ steering_documents: SteeringDocument[] }>(
      `/epics/${epicId}/steering-documents`,
      {},
    )
    return response.steering_documents
  }
}

// Export singleton instance
export const steeringDocumentService = new SteeringDocumentService()
