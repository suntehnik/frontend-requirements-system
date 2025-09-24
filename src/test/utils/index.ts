/**
 * Test Utilities Index
 * 
 * Exports all test utilities for integration testing
 */

export {
  loadIntegrationTestConfig,
  validateEnvironmentSetup,
  getTestConfig,
  shouldSkipIntegrationTests,
  logEnvironmentInfo
} from './test-environment'

export {
  checkBackendAvailability,
  checkAuthentication,
  validateBackend,
  waitForBackend,
  validateApiEndpoints
} from './backend-validator'

export {
  TestDataManager
} from './test-data-manager'

export {
  ListResponseAdapter,
  EpicListResponseAdapter,
  UserStoryListResponseAdapter,
  AcceptanceCriteriaListResponseAdapter,
  RequirementListResponseAdapter,
  SearchResponseAdapter,
  HierarchyResponseAdapter,
  ResponseAdapterFactory,
  adaptResponse
} from './response-adapters'

export {
  HttpStatusValidator,
  DataTypeValidator,
  SchemaValidator,
  ApiResponseValidator
} from './api-response-validator'

export type {
  IntegrationTestConfig
} from './test-environment'

export type {
  RealApiEpicListResponse,
  RealApiUserStoryListResponse,
  RealApiAcceptanceCriteriaListResponse,
  RealApiRequirementListResponse,
  RealApiSearchResponse,
  RealApiHierarchyResponse
} from './response-adapters'

export type {
  ValidationResult,
  FieldValidationResult,
  SchemaValidationResult,
  HttpStatusValidationResult
} from './api-response-validator'