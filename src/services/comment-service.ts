import { BaseApiService } from './base-api-service'
import type {
  Comment,
  CreateCommentRequest,
  CreateInlineCommentRequest,
  UpdateCommentRequest,
  CommentListResponse,
  EntityType,
} from '@/types'

export class CommentService extends BaseApiService {
  private entityPath = '/comments'

  // Comment CRUD operations
  async get(id: string): Promise<Comment> {
    return await this.apiGet<Comment>(`${this.entityPath}/${id}`)
  }

  async update(id: string, request: UpdateCommentRequest): Promise<Comment> {
    return await this.apiPut<Comment>(`${this.entityPath}/${id}`, request)
  }

  async delete(id: string): Promise<void> {
    await this.apiDelete(`${this.entityPath}/${id}`)
  }

  async resolve(id: string): Promise<Comment> {
    return await this.apiPost<Comment>(`${this.entityPath}/${id}/resolve`)
  }

  async unresolve(id: string): Promise<Comment> {
    return await this.apiPost<Comment>(`${this.entityPath}/${id}/unresolve`)
  }

  async getCommentsByStatus(status: 'resolved' | 'unresolved'): Promise<CommentListResponse> {
    return await this.apiGet<CommentListResponse>(`${this.entityPath}/status/${status}`)
  }

  async getReplies(commentId: string): Promise<Comment[]> {
    return await this.apiGet<Comment[]>(`${this.entityPath}/${commentId}/replies`)
  }

  async createReply(
    commentId: string,
    request: Omit<CreateCommentRequest, 'author_id'> & { author_id?: string },
  ): Promise<Comment> {
    // Get current user if author_id not provided
    let author_id = request.author_id
    if (!author_id) {
      // Use the auth service to get current user (it uses the correct endpoint)
      const { authService } = await import('./auth-service')
      const currentUser = await authService.getCurrentUser()
      author_id = currentUser.id
    }

    const fullRequest: CreateCommentRequest = {
      ...request,
      author_id,
    }

    return await this.apiPost<Comment>(`${this.entityPath}/${commentId}/replies`, fullRequest)
  }

  // Entity-specific comment operations
  async getEntityComments(
    entityType: EntityType,
    entityId: string,
  ): Promise<Comment[] | CommentListResponse> {
    const entityPath = this.getEntityPath(entityType)
    return await this.apiGet<Comment[] | CommentListResponse>(`/${entityPath}/${entityId}/comments`)
  }

  async createEntityComment(
    entityType: EntityType,
    entityId: string,
    request: Omit<CreateCommentRequest, 'author_id'> & { author_id?: string },
  ): Promise<Comment> {
    // Get current user if author_id not provided
    let author_id = request.author_id
    if (!author_id) {
      // Use the auth service to get current user (it uses the correct endpoint)
      const { authService } = await import('./auth-service')
      const currentUser = await authService.getCurrentUser()
      author_id = currentUser.id
    }

    const fullRequest: CreateCommentRequest = {
      ...request,
      author_id,
    }

    const entityPath = this.getEntityPath(entityType)
    return await this.apiPost<Comment>(`/${entityPath}/${entityId}/comments`, fullRequest)
  }

  // Inline comment operations
  async createInlineComment(
    entityType: EntityType,
    entityId: string,
    request: CreateInlineCommentRequest,
  ): Promise<Comment> {
    const entityPath = this.getEntityPath(entityType)
    return await this.apiPost<Comment>(`/${entityPath}/${entityId}/comments/inline`, request)
  }

  async getVisibleInlineComments(entityType: EntityType, entityId: string): Promise<Comment[]> {
    const entityPath = this.getEntityPath(entityType)
    return await this.apiGet<Comment[]>(`/${entityPath}/${entityId}/comments/inline/visible`)
  }

  async validateInlineComments(entityType: EntityType, entityId: string): Promise<void> {
    const entityPath = this.getEntityPath(entityType)
    await this.apiPost(`/${entityPath}/${entityId}/comments/inline/validate`)
  }

  // Helper method to get entity path for comments
  private getEntityPath(entityType: EntityType): string {
    const entityPaths: Record<EntityType, string> = {
      epic: 'epics',
      user_story: 'user-stories',
      acceptance_criteria: 'acceptance-criteria',
      requirement: 'requirements',
    }
    return entityPaths[entityType]
  }
}

// Export singleton instance
export const commentService = new CommentService()
