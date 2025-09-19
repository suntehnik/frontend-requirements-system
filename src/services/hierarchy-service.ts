import { BaseApiService } from './base-api-service'
import type { HierarchyNode, EntityPath, EntityType } from '@/types'

export class HierarchyService extends BaseApiService {
  private entityPath = '/hierarchy'

  async getFullHierarchy(): Promise<HierarchyNode[]> {
    return await this.apiGet<HierarchyNode[]>(this.entityPath)
  }

  async getEpicHierarchy(id: string): Promise<HierarchyNode> {
    return await this.apiGet<HierarchyNode>(`${this.entityPath}/epics/${id}`)
  }

  async getUserStoryHierarchy(id: string): Promise<HierarchyNode> {
    return await this.apiGet<HierarchyNode>(`${this.entityPath}/user-stories/${id}`)
  }

  async getEntityPath(entityType: EntityType, id: string): Promise<EntityPath[]> {
    return await this.apiGet<EntityPath[]>(`${this.entityPath}/path/${entityType}/${id}`)
  }
}

// Export singleton instance
export const hierarchyService = new HierarchyService()
