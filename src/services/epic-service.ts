import { BaseApiService } from './base-api-service'
import type {
  Epic,
  CreateEpicRequest,
  UpdateEpicRequest,
  EpicListParams,
  EpicListResponse,
  EpicStatus,
  StatusChangeRequest,
  AssignmentRequest,
  DependencyInfo,
  DeletionResult,
} from '@/types'

export class EpicService extends BaseApiService {
  private entityPath = '/epics'

  async list(params?: EpicListParams): Promise<EpicListResponse> {
    const queryParams = params
      ? this.buildQueryParams({
          creator_id: params.creator_id,
          assignee_id: params.assignee_id,
          status: params.status,
          priority: params.priority,
          order_by: params.order_by,
          limit: params.limit,
          offset: params.offset,
          include: this.buildIncludeParam(params.include),
        })
      : {}

    return await this.apiGet<EpicListResponse>(this.entityPath, queryParams)
  }

  async get(id: string, include?: string): Promise<Epic> {
    const params = include ? { include: this.buildIncludeParam(include) } : {}
    return await this.apiGet<Epic>(`${this.entityPath}/${id}`, params)
  }

  async create(request: CreateEpicRequest): Promise<Epic> {
    return await this.apiPost<Epic>(this.entityPath, request)
  }

  async update(id: string, request: UpdateEpicRequest): Promise<Epic> {
    return await this.apiPut<Epic>(`${this.entityPath}/${id}`, request)
  }

  async delete(id: string): Promise<void> {
    await this.apiDelete(`${this.entityPath}/${id}`)
  }

  async getUserStories(id: string): Promise<Epic> {
    return await this.apiGet<Epic>(`${this.entityPath}/${id}/user-stories`)
  }

  async createUserStory(id: string, userStoryData: unknown): Promise<unknown> {
    return await this.apiPost(`${this.entityPath}/${id}/user-stories`, userStoryData)
  }

  async changeStatus(id: string, status: EpicStatus): Promise<Epic> {
    const request: StatusChangeRequest = { status }
    return await this.apiPatch<Epic>(`${this.entityPath}/${id}/status`, request)
  }

  async assign(id: string, assigneeId?: string): Promise<Epic> {
    const request: AssignmentRequest = { assignee_id: assigneeId }
    return await this.apiPatch<Epic>(`${this.entityPath}/${id}/assign`, request)
  }

  async validateDeletion(id: string): Promise<DependencyInfo> {
    return await this.apiGet<DependencyInfo>(`${this.entityPath}/${id}/validate-deletion`)
  }

  async comprehensiveDelete(id: string): Promise<DeletionResult> {
    return await this.apiDelete<DeletionResult>(`${this.entityPath}/${id}/delete`)
  }
}

// Export singleton instance
export const epicService = new EpicService()
