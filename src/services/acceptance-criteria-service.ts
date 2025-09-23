import { BaseApiService } from './base-api-service'
import type {
  AcceptanceCriteria,
  CreateAcceptanceCriteriaRequest,
  UpdateAcceptanceCriteriaRequest,
  AcceptanceCriteriaListResponse,
  DependencyInfo,
  DeletionResult,
} from '@/types'

export class AcceptanceCriteriaService extends BaseApiService {
  private entityPath = '/acceptance-criteria'

  async list(params?: {
    user_story_id?: string
    author_id?: string
    limit?: number
    offset?: number
    include?: string
  }): Promise<AcceptanceCriteriaListResponse> {
    const queryParams = params
      ? this.buildQueryParams({
          user_story_id: params.user_story_id,
          author_id: params.author_id,
          limit: params.limit,
          offset: params.offset,
          include: this.buildIncludeParam(params.include),
        })
      : {}

    return await this.apiGet<AcceptanceCriteriaListResponse>(this.entityPath, queryParams)
  }

  async create(request: CreateAcceptanceCriteriaRequest): Promise<AcceptanceCriteria> {
    return await this.apiPost<AcceptanceCriteria>(this.entityPath, request)
  }

  async get(id: string, include?: string): Promise<AcceptanceCriteria> {
    const params = include ? { include: this.buildIncludeParam(include) } : {}
    return await this.apiGet<AcceptanceCriteria>(`${this.entityPath}/${id}`, params)
  }

  async update(id: string, request: UpdateAcceptanceCriteriaRequest): Promise<AcceptanceCriteria> {
    return await this.apiPut<AcceptanceCriteria>(`${this.entityPath}/${id}`, request)
  }

  async delete(id: string): Promise<void> {
    await this.apiDelete(`${this.entityPath}/${id}`)
  }

  async validateDeletion(id: string): Promise<DependencyInfo> {
    return await this.apiGet<DependencyInfo>(`${this.entityPath}/${id}/validate-deletion`)
  }

  async comprehensiveDelete(id: string): Promise<DeletionResult> {
    return await this.apiDelete<DeletionResult>(`${this.entityPath}/${id}/delete`)
  }
}

// Export singleton instance
export const acceptanceCriteriaService = new AcceptanceCriteriaService()
