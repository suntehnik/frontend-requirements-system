// Main barrel export for all services

// Core services
export { httpClient, HttpClient } from './http-client';
export { ErrorHandler, ErrorType, type ApiError } from './error-handler';
export { BaseApiService } from './base-api-service';

// Entity services
export { authService, AuthService } from './auth-service';
export { epicService, EpicService } from './epic-service';
export { userStoryService, UserStoryService } from './user-story-service';
export { acceptanceCriteriaService, AcceptanceCriteriaService } from './acceptance-criteria-service';
export { requirementService, RequirementService } from './requirement-service';

// Feature services
export { commentService, CommentService } from './comment-service';
export { searchService, SearchService } from './search-service';
export { hierarchyService, HierarchyService } from './hierarchy-service';
export { configService, ConfigService } from './config-service';