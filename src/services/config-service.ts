import { BaseApiService } from './base-api-service'
import type {
  RequirementType,
  RelationshipType,
  StatusModel,
  Status,
  StatusTransition,
  RequirementTypeListResponse,
  RelationshipTypeListResponse,
  StatusModelListResponse,
  StatusListResponse,
  StatusTransitionListResponse,
  EntityType,
} from '@/types'

export class ConfigService extends BaseApiService {
  private configPath = '/config'

  // Requirement Types
  async createRequirementType(data: {
    name: string
    description?: string
  }): Promise<RequirementType> {
    return await this.apiPost<RequirementType>(`${this.configPath}/requirement-types`, data)
  }

  async getRequirementTypes(): Promise<RequirementTypeListResponse> {
    return await this.apiGet<RequirementTypeListResponse>(`${this.configPath}/requirement-types`)
  }

  async getRequirementType(id: string): Promise<RequirementType> {
    return await this.apiGet<RequirementType>(`${this.configPath}/requirement-types/${id}`)
  }

  async updateRequirementType(
    id: string,
    data: { name?: string; description?: string },
  ): Promise<RequirementType> {
    return await this.apiPut<RequirementType>(`${this.configPath}/requirement-types/${id}`, data)
  }

  async deleteRequirementType(id: string): Promise<void> {
    await this.apiDelete(`${this.configPath}/requirement-types/${id}`)
  }

  // Relationship Types
  async createRelationshipType(data: {
    name: string
    description?: string
  }): Promise<RelationshipType> {
    return await this.apiPost<RelationshipType>(`${this.configPath}/relationship-types`, data)
  }

  async getRelationshipTypes(): Promise<RelationshipTypeListResponse> {
    return await this.apiGet<RelationshipTypeListResponse>(`${this.configPath}/relationship-types`)
  }

  async getRelationshipType(id: string): Promise<RelationshipType> {
    return await this.apiGet<RelationshipType>(`${this.configPath}/relationship-types/${id}`)
  }

  async updateRelationshipType(
    id: string,
    data: { name?: string; description?: string },
  ): Promise<RelationshipType> {
    return await this.apiPut<RelationshipType>(`${this.configPath}/relationship-types/${id}`, data)
  }

  async deleteRelationshipType(id: string): Promise<void> {
    await this.apiDelete(`${this.configPath}/relationship-types/${id}`)
  }

  // Status Models
  async createStatusModel(data: {
    name: string
    description?: string
    entity_type: EntityType
    is_default?: boolean
  }): Promise<StatusModel> {
    return await this.apiPost<StatusModel>(`${this.configPath}/status-models`, data)
  }

  async getStatusModels(): Promise<StatusModelListResponse> {
    return await this.apiGet<StatusModelListResponse>(`${this.configPath}/status-models`)
  }

  async getStatusModel(id: string): Promise<StatusModel> {
    return await this.apiGet<StatusModel>(`${this.configPath}/status-models/${id}`)
  }

  async updateStatusModel(
    id: string,
    data: {
      name?: string
      description?: string
      is_default?: boolean
    },
  ): Promise<StatusModel> {
    return await this.apiPut<StatusModel>(`${this.configPath}/status-models/${id}`, data)
  }

  async deleteStatusModel(id: string): Promise<void> {
    await this.apiDelete(`${this.configPath}/status-models/${id}`)
  }

  async getDefaultStatusModel(entityType: EntityType): Promise<StatusModel> {
    return await this.apiGet<StatusModel>(`${this.configPath}/status-models/default/${entityType}`)
  }

  async getStatusesByModel(modelId: string): Promise<StatusListResponse> {
    return await this.apiGet<StatusListResponse>(
      `${this.configPath}/status-models/${modelId}/statuses`,
    )
  }

  async getTransitionsByModel(modelId: string): Promise<StatusTransitionListResponse> {
    return await this.apiGet<StatusTransitionListResponse>(
      `${this.configPath}/status-models/${modelId}/transitions`,
    )
  }

  // Statuses
  async createStatus(data: {
    name: string
    description?: string
    color?: string
    order: number
    is_initial?: boolean
    is_final?: boolean
    status_model_id: string
  }): Promise<Status> {
    return await this.apiPost<Status>(`${this.configPath}/statuses`, data)
  }

  async getStatus(id: string): Promise<Status> {
    return await this.apiGet<Status>(`${this.configPath}/statuses/${id}`)
  }

  async updateStatus(
    id: string,
    data: {
      name?: string
      description?: string
      color?: string
      order?: number
      is_initial?: boolean
      is_final?: boolean
    },
  ): Promise<Status> {
    return await this.apiPut<Status>(`${this.configPath}/statuses/${id}`, data)
  }

  async deleteStatus(id: string): Promise<void> {
    await this.apiDelete(`${this.configPath}/statuses/${id}`)
  }

  // Status Transitions
  async createStatusTransition(data: {
    name?: string
    description?: string
    from_status_id: string
    to_status_id: string
    status_model_id: string
  }): Promise<StatusTransition> {
    return await this.apiPost<StatusTransition>(`${this.configPath}/status-transitions`, data)
  }

  async getStatusTransition(id: string): Promise<StatusTransition> {
    return await this.apiGet<StatusTransition>(`${this.configPath}/status-transitions/${id}`)
  }

  async updateStatusTransition(
    id: string,
    data: {
      name?: string
      description?: string
    },
  ): Promise<StatusTransition> {
    return await this.apiPut<StatusTransition>(`${this.configPath}/status-transitions/${id}`, data)
  }

  async deleteStatusTransition(id: string): Promise<void> {
    await this.apiDelete(`${this.configPath}/status-transitions/${id}`)
  }
}

// Export singleton instance
export const configService = new ConfigService()
