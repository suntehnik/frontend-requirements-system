import { BaseApiService } from './base-api-service'
import type {
  Requirement,
  CreateRequirementRequest,
  UpdateRequirementRequest,
  RequirementListParams,
  RequirementListResponse,
  RequirementStatus,
  StatusChangeRequest,
  AssignmentRequest,
  DependencyInfo,
  DeletionResult,
  RequirementRelationship,
  CreateRelationshipRequest,
} from '@/types'

export class RequirementService extends BaseApiService {
  private entityPath = '/requirements'

  async list(params?: RequirementListParams): Promise<RequirementListResponse> {
    const queryParams = params
      ? this.buildQueryParams({
          user_story_id: params.user_story_id,
          acceptance_criteria_id: params.acceptance_criteria_id,
          type_id: params.type_id,
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

    return await this.apiGet<RequirementListResponse>(this.entityPath, queryParams)
  }

  async get(id: string, include?: string): Promise<Requirement> {
    const params = include ? { include: this.buildIncludeParam(include) } : {}
    return await this.apiGet<Requirement>(`${this.entityPath}/${id}`, params)
  }

  async create(request: CreateRequirementRequest): Promise<Requirement> {
    return await this.apiPost<Requirement>(this.entityPath, request)
  }

  async update(id: string, request: UpdateRequirementRequest): Promise<Requirement> {
    return await this.apiPut<Requirement>(`${this.entityPath}/${id}`, request)
  }

  async delete(id: string): Promise<void> {
    await this.apiDelete(`${this.entityPath}/${id}`)
  }

  async getWithRelationships(id: string): Promise<Requirement> {
    return await this.apiGet<Requirement>(`${this.entityPath}/${id}/relationships`)
  }

  async changeStatus(id: string, status: RequirementStatus): Promise<Requirement> {
    const request: StatusChangeRequest = { status }
    return await this.apiPatch<Requirement>(`${this.entityPath}/${id}/status`, request)
  }

  async assign(id: string, assigneeId?: string): Promise<Requirement> {
    const request: AssignmentRequest = { assignee_id: assigneeId }
    return await this.apiPatch<Requirement>(`${this.entityPath}/${id}/assign`, request)
  }

  async createRelationship(request: CreateRelationshipRequest): Promise<RequirementRelationship> {
    return await this.apiPost<RequirementRelationship>(`${this.entityPath}/relationships`, request)
  }

  async deleteRelationship(relationshipId: string): Promise<void> {
    await this.apiDelete(`/requirement-relationships/${relationshipId}`)
  }

  async validateDeletion(id: string): Promise<DependencyInfo> {
    return await this.apiGet<DependencyInfo>(`${this.entityPath}/${id}/validate-deletion`)
  }

  async comprehensiveDelete(id: string): Promise<DeletionResult> {
    return await this.apiDelete<DeletionResult>(`${this.entityPath}/${id}/delete`)
  }
}

// Export singleton instance
export const requirementService = new RequirementService()
