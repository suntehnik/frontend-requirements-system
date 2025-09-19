import { BaseApiService } from './base-api-service';
import type {
  UserStory,
  CreateUserStoryRequest,
  UpdateUserStoryRequest,
  UserStoryListParams,
  UserStoryListResponse,
  UserStoryStatus,
  StatusChangeRequest,
  AssignmentRequest,
  DependencyInfo,
  DeletionResult,
  AcceptanceCriteria,
  Requirement
} from '@/types';

export class UserStoryService extends BaseApiService {
  private entityPath = '/user-stories';

  async list(params?: UserStoryListParams): Promise<UserStoryListResponse> {
    const queryParams = params ? this.buildQueryParams({
      epic_id: params.epic_id,
      creator_id: params.creator_id,
      assignee_id: params.assignee_id,
      status: params.status,
      priority: params.priority,
      order_by: params.order_by,
      limit: params.limit,
      offset: params.offset,
      include: this.buildIncludeParam(params.include)
    }) : {};

    return await this.apiGet<UserStoryListResponse>(this.entityPath, queryParams);
  }

  async get(id: string, include?: string): Promise<UserStory> {
    const params = include ? { include: this.buildIncludeParam(include) } : {};
    return await this.apiGet<UserStory>(`${this.entityPath}/${id}`, params);
  }

  async create(request: CreateUserStoryRequest): Promise<UserStory> {
    return await this.apiPost<UserStory>(this.entityPath, request);
  }

  async update(id: string, request: UpdateUserStoryRequest): Promise<UserStory> {
    return await this.apiPut<UserStory>(`${this.entityPath}/${id}`, request);
  }

  async delete(id: string): Promise<void> {
    await this.apiDelete(`${this.entityPath}/${id}`);
  }

  async getAcceptanceCriteria(id: string): Promise<AcceptanceCriteria[]> {
    return await this.apiGet<AcceptanceCriteria[]>(`${this.entityPath}/${id}/acceptance-criteria`);
  }

  async createAcceptanceCriteria(id: string, criteriaData: unknown): Promise<AcceptanceCriteria> {
    return await this.apiPost<AcceptanceCriteria>(`${this.entityPath}/${id}/acceptance-criteria`, criteriaData);
  }

  async getRequirements(id: string): Promise<Requirement[]> {
    return await this.apiGet<Requirement[]>(`${this.entityPath}/${id}/requirements`);
  }

  async createRequirement(id: string, requirementData: unknown): Promise<Requirement> {
    return await this.apiPost<Requirement>(`${this.entityPath}/${id}/requirements`, requirementData);
  }

  async changeStatus(id: string, status: UserStoryStatus): Promise<UserStory> {
    const request: StatusChangeRequest = { status };
    return await this.apiPatch<UserStory>(`${this.entityPath}/${id}/status`, request);
  }

  async assign(id: string, assigneeId?: string): Promise<UserStory> {
    const request: AssignmentRequest = { assignee_id: assigneeId };
    return await this.apiPatch<UserStory>(`${this.entityPath}/${id}/assign`, request);
  }

  async validateDeletion(id: string): Promise<DependencyInfo> {
    return await this.apiGet<DependencyInfo>(`${this.entityPath}/${id}/validate-deletion`);
  }

  async comprehensiveDelete(id: string): Promise<DeletionResult> {
    return await this.apiDelete<DeletionResult>(`${this.entityPath}/${id}/delete`);
  }
}

// Export singleton instance
export const userStoryService = new UserStoryService();