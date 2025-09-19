import { BaseApiService } from './base-api-service';
import type {
  AcceptanceCriteria,
  UpdateAcceptanceCriteriaRequest,
  AcceptanceCriteriaListResponse,
  DependencyInfo,
  DeletionResult
} from '@/types';

export class AcceptanceCriteriaService extends BaseApiService {
  private entityPath = '/acceptance-criteria';

  async list(): Promise<AcceptanceCriteriaListResponse> {
    return await this.apiGet<AcceptanceCriteriaListResponse>(this.entityPath);
  }

  async get(id: string, include?: string): Promise<AcceptanceCriteria> {
    const params = include ? { include: this.buildIncludeParam(include) } : {};
    return await this.apiGet<AcceptanceCriteria>(`${this.entityPath}/${id}`, params);
  }

  async update(id: string, request: UpdateAcceptanceCriteriaRequest): Promise<AcceptanceCriteria> {
    return await this.apiPut<AcceptanceCriteria>(`${this.entityPath}/${id}`, request);
  }

  async delete(id: string): Promise<void> {
    await this.apiDelete(`${this.entityPath}/${id}`);
  }

  async validateDeletion(id: string): Promise<DependencyInfo> {
    return await this.apiGet<DependencyInfo>(`${this.entityPath}/${id}/validate-deletion`);
  }

  async comprehensiveDelete(id: string): Promise<DeletionResult> {
    return await this.apiDelete<DeletionResult>(`${this.entityPath}/${id}/delete`);
  }
}

// Export singleton instance
export const acceptanceCriteriaService = new AcceptanceCriteriaService();