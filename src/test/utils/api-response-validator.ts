/**
 * API Response Validator
 * 
 * Validates API responses against TypeScript interfaces and expected behavior.
 * Provides schema validation, HTTP status code validation, and data type validation.
 */

import type {
  EpicStatus,
  UserStoryStatus,
  RequirementStatus,
  Priority
} from '@/types'

// Validation result types
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface FieldValidationResult {
  field: string
  isValid: boolean
  expectedType: string
  actualType: string
  message: string
}

export interface SchemaValidationResult extends ValidationResult {
  fieldValidations: FieldValidationResult[]
  missingFields: string[]
  unexpectedFields: string[]
}

export interface HttpStatusValidationResult extends ValidationResult {
  expectedStatus: number
  actualStatus: number
  statusText: string
}

/**
 * HTTP Status Code Validator
 */
export class HttpStatusValidator {
  private static readonly VALID_SUCCESS_CODES = [200, 201, 204]
  private static readonly VALID_ERROR_CODES = [400, 401, 403, 404, 409, 500]

  /**
   * Validate HTTP status code
   */
  static validate(
    actualStatus: number,
    expectedStatus: number,
    statusText?: string
  ): HttpStatusValidationResult {
    const isValid = actualStatus === expectedStatus
    const errors: string[] = []
    const warnings: string[] = []

    if (!isValid) {
      errors.push(
        `Expected HTTP status ${expectedStatus}, got ${actualStatus}${
          statusText ? ` (${statusText})` : ''
        }`
      )
    }

    // Check if status code is in valid range
    const allValidCodes = [...this.VALID_SUCCESS_CODES, ...this.VALID_ERROR_CODES]
    if (!allValidCodes.includes(actualStatus)) {
      warnings.push(`Unexpected HTTP status code: ${actualStatus}`)
    }

    return {
      isValid,
      errors,
      warnings,
      expectedStatus,
      actualStatus,
      statusText: statusText || ''
    }
  }

  /**
   * Validate success response status
   */
  static validateSuccess(actualStatus: number, statusText?: string): HttpStatusValidationResult {
    const isValid = this.VALID_SUCCESS_CODES.includes(actualStatus)
    const errors: string[] = []
    const warnings: string[] = []

    if (!isValid) {
      errors.push(
        `Expected success status (${this.VALID_SUCCESS_CODES.join(', ')}), got ${actualStatus}${
          statusText ? ` (${statusText})` : ''
        }`
      )
    }

    return {
      isValid,
      errors,
      warnings,
      expectedStatus: 200, // Default expected success status
      actualStatus,
      statusText: statusText || ''
    }
  }

  /**
   * Validate error response status
   */
  static validateError(
    actualStatus: number,
    expectedErrorStatus?: number,
    statusText?: string
  ): HttpStatusValidationResult {
    const isValidErrorCode = this.VALID_ERROR_CODES.includes(actualStatus)
    const isExpectedError = expectedErrorStatus ? actualStatus === expectedErrorStatus : true
    const isValid = isValidErrorCode && isExpectedError

    const errors: string[] = []
    const warnings: string[] = []

    if (!isValidErrorCode) {
      errors.push(
        `Expected error status (${this.VALID_ERROR_CODES.join(', ')}), got ${actualStatus}${
          statusText ? ` (${statusText})` : ''
        }`
      )
    }

    if (expectedErrorStatus && !isExpectedError) {
      errors.push(
        `Expected specific error status ${expectedErrorStatus}, got ${actualStatus}${
          statusText ? ` (${statusText})` : ''
        }`
      )
    }

    return {
      isValid,
      errors,
      warnings,
      expectedStatus: expectedErrorStatus || 400, // Default expected error status
      actualStatus,
      statusText: statusText || ''
    }
  }
}

/**
 * Data Type Validator
 */
export class DataTypeValidator {
  /**
   * Validate field type
   */
  static validateField(
    value: unknown,
    expectedType: string,
    fieldName: string,
    isOptional = false
  ): FieldValidationResult {
    const actualType = value === null ? 'null' : typeof value
    let isValid = true
    let message = ''

    // Handle optional fields
    if (isOptional && (value === undefined || value === null)) {
      return {
        field: fieldName,
        isValid: true,
        expectedType,
        actualType,
        message: 'Optional field is undefined/null'
      }
    }

    // Handle required fields that are missing
    if (!isOptional && (value === undefined || value === null)) {
      return {
        field: fieldName,
        isValid: false,
        expectedType,
        actualType,
        message: `Required field '${fieldName}' is missing or null`
      }
    }

    // Type-specific validation
    switch (expectedType) {
      case 'string':
        isValid = typeof value === 'string'
        if (!isValid) {
          message = `Expected string, got ${actualType}`
        }
        break

      case 'number':
        isValid = typeof value === 'number' && !isNaN(value)
        if (!isValid) {
          message = `Expected number, got ${actualType}`
        }
        break

      case 'boolean':
        isValid = typeof value === 'boolean'
        if (!isValid) {
          message = `Expected boolean, got ${actualType}`
        }
        break

      case 'array':
        isValid = Array.isArray(value)
        if (!isValid) {
          message = `Expected array, got ${actualType}`
        }
        break

      case 'object':
        isValid = typeof value === 'object' && value !== null && !Array.isArray(value)
        if (!isValid) {
          message = `Expected object, got ${actualType}`
        }
        break

      case 'date':
        isValid = typeof value === 'string' && !isNaN(Date.parse(value))
        if (!isValid) {
          message = `Expected valid date string, got ${actualType}`
        }
        break

      case 'uuid':
        isValid = typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
        if (!isValid) {
          message = `Expected UUID string, got ${actualType}`
        }
        break

      default:
        message = `Unknown expected type: ${expectedType}`
        isValid = false
    }

    return {
      field: fieldName,
      isValid,
      expectedType,
      actualType,
      message: message || 'Valid'
    }
  }

  /**
   * Validate enum value
   */
  static validateEnum<T extends string | number>(
    value: unknown,
    validValues: T[],
    fieldName: string,
    isOptional = false
  ): FieldValidationResult {
    if (isOptional && (value === undefined || value === null)) {
      return {
        field: fieldName,
        isValid: true,
        expectedType: `enum(${validValues.join('|')})`,
        actualType: value === null ? 'null' : typeof value,
        message: 'Optional enum field is undefined/null'
      }
    }

    const isValid = validValues.includes(value as T)
    const actualType = value === null ? 'null' : typeof value

    return {
      field: fieldName,
      isValid,
      expectedType: `enum(${validValues.join('|')})`,
      actualType,
      message: isValid 
        ? 'Valid enum value' 
        : `Expected one of [${validValues.join(', ')}], got ${value}`
    }
  }
}

/**
 * Schema Validator for specific entity types
 */
export class SchemaValidator {
  /**
   * Validate User object
   */
  static validateUser(data: unknown): SchemaValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const fieldValidations: FieldValidationResult[] = []
    const missingFields: string[] = []
    const unexpectedFields: string[] = []

    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        errors: ['Expected user object, got ' + typeof data],
        warnings,
        fieldValidations,
        missingFields,
        unexpectedFields
      }
    }

    const user = data as Record<string, unknown>
    const requiredFields = ['id', 'username', 'email', 'role', 'created_at', 'updated_at']
    const validRoles = ['Administrator', 'User', 'Commenter']

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in user)) {
        missingFields.push(field)
      }
    }

    // Validate field types
    fieldValidations.push(DataTypeValidator.validateField(user.id, 'uuid', 'id'))
    fieldValidations.push(DataTypeValidator.validateField(user.username, 'string', 'username'))
    fieldValidations.push(DataTypeValidator.validateField(user.email, 'string', 'email'))
    fieldValidations.push(DataTypeValidator.validateEnum(user.role, validRoles, 'role'))
    fieldValidations.push(DataTypeValidator.validateField(user.created_at, 'date', 'created_at'))
    fieldValidations.push(DataTypeValidator.validateField(user.updated_at, 'date', 'updated_at'))

    // Check for unexpected fields
    const expectedFields = [...requiredFields]
    for (const field in user) {
      if (!expectedFields.includes(field)) {
        unexpectedFields.push(field)
      }
    }

    // Collect errors from field validations
    fieldValidations.forEach(validation => {
      if (!validation.isValid) {
        errors.push(`Field '${validation.field}': ${validation.message}`)
      }
    })

    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`)
    }

    if (unexpectedFields.length > 0) {
      warnings.push(`Unexpected fields: ${unexpectedFields.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fieldValidations,
      missingFields,
      unexpectedFields
    }
  }

  /**
   * Validate Epic object
   */
  static validateEpic(data: unknown): SchemaValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const fieldValidations: FieldValidationResult[] = []
    const missingFields: string[] = []
    const unexpectedFields: string[] = []

    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        errors: ['Expected epic object, got ' + typeof data],
        warnings,
        fieldValidations,
        missingFields,
        unexpectedFields
      }
    }

    const epic = data as Record<string, unknown>
    const requiredFields = ['id', 'reference_id', 'title', 'status', 'priority', 'creator_id', 'created_at', 'last_modified']
    const optionalFields = ['description', 'assignee_id', 'creator', 'assignee', 'user_stories', 'comments']
    const validStatuses: EpicStatus[] = ['Backlog', 'Draft', 'In Progress', 'Done', 'Cancelled']
    const validPriorities: Priority[] = [1, 2, 3, 4]

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in epic)) {
        missingFields.push(field)
      }
    }

    // Validate required field types
    fieldValidations.push(DataTypeValidator.validateField(epic.id, 'uuid', 'id'))
    fieldValidations.push(DataTypeValidator.validateField(epic.reference_id, 'string', 'reference_id'))
    fieldValidations.push(DataTypeValidator.validateField(epic.title, 'string', 'title'))
    fieldValidations.push(DataTypeValidator.validateEnum(epic.status, validStatuses, 'status'))
    fieldValidations.push(DataTypeValidator.validateEnum(epic.priority, validPriorities, 'priority'))
    fieldValidations.push(DataTypeValidator.validateField(epic.creator_id, 'uuid', 'creator_id'))
    fieldValidations.push(DataTypeValidator.validateField(epic.created_at, 'date', 'created_at'))
    fieldValidations.push(DataTypeValidator.validateField(epic.last_modified, 'date', 'last_modified'))

    // Validate optional fields
    fieldValidations.push(DataTypeValidator.validateField(epic.description, 'string', 'description', true))
    fieldValidations.push(DataTypeValidator.validateField(epic.assignee_id, 'uuid', 'assignee_id', true))

    // Validate nested objects if present
    if (epic.creator) {
      const creatorValidation = this.validateUser(epic.creator)
      if (!creatorValidation.isValid) {
        errors.push(`Invalid creator object: ${creatorValidation.errors.join(', ')}`)
      }
    }

    if (epic.assignee) {
      const assigneeValidation = this.validateUser(epic.assignee)
      if (!assigneeValidation.isValid) {
        errors.push(`Invalid assignee object: ${assigneeValidation.errors.join(', ')}`)
      }
    }

    if (epic.user_stories) {
      fieldValidations.push(DataTypeValidator.validateField(epic.user_stories, 'array', 'user_stories', true))
    }

    if (epic.comments) {
      fieldValidations.push(DataTypeValidator.validateField(epic.comments, 'array', 'comments', true))
    }

    // Check for unexpected fields
    const expectedFields = [...requiredFields, ...optionalFields]
    for (const field in epic) {
      if (!expectedFields.includes(field)) {
        unexpectedFields.push(field)
      }
    }

    // Collect errors from field validations
    fieldValidations.forEach(validation => {
      if (!validation.isValid) {
        errors.push(`Field '${validation.field}': ${validation.message}`)
      }
    })

    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`)
    }

    if (unexpectedFields.length > 0) {
      warnings.push(`Unexpected fields: ${unexpectedFields.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fieldValidations,
      missingFields,
      unexpectedFields
    }
  }

  /**
   * Validate UserStory object
   */
  static validateUserStory(data: unknown): SchemaValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const fieldValidations: FieldValidationResult[] = []
    const missingFields: string[] = []
    const unexpectedFields: string[] = []

    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        errors: ['Expected user story object, got ' + typeof data],
        warnings,
        fieldValidations,
        missingFields,
        unexpectedFields
      }
    }

    const userStory = data as Record<string, unknown>
    const requiredFields = ['id', 'reference_id', 'title', 'status', 'priority', 'epic_id', 'creator_id', 'created_at', 'last_modified']
    const optionalFields = ['description', 'assignee_id', 'epic', 'creator', 'assignee', 'acceptance_criteria', 'requirements', 'comments']
    const validStatuses: UserStoryStatus[] = ['Backlog', 'Draft', 'In Progress', 'Done', 'Cancelled']
    const validPriorities: Priority[] = [1, 2, 3, 4]

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in userStory)) {
        missingFields.push(field)
      }
    }

    // Validate required field types
    fieldValidations.push(DataTypeValidator.validateField(userStory.id, 'uuid', 'id'))
    fieldValidations.push(DataTypeValidator.validateField(userStory.reference_id, 'string', 'reference_id'))
    fieldValidations.push(DataTypeValidator.validateField(userStory.title, 'string', 'title'))
    fieldValidations.push(DataTypeValidator.validateEnum(userStory.status, validStatuses, 'status'))
    fieldValidations.push(DataTypeValidator.validateEnum(userStory.priority, validPriorities, 'priority'))
    fieldValidations.push(DataTypeValidator.validateField(userStory.epic_id, 'uuid', 'epic_id'))
    fieldValidations.push(DataTypeValidator.validateField(userStory.creator_id, 'uuid', 'creator_id'))
    fieldValidations.push(DataTypeValidator.validateField(userStory.created_at, 'date', 'created_at'))
    fieldValidations.push(DataTypeValidator.validateField(userStory.last_modified, 'date', 'last_modified'))

    // Validate optional fields
    fieldValidations.push(DataTypeValidator.validateField(userStory.description, 'string', 'description', true))
    fieldValidations.push(DataTypeValidator.validateField(userStory.assignee_id, 'uuid', 'assignee_id', true))

    // Validate nested objects if present
    if (userStory.epic) {
      // Basic validation for epic reference (not full epic validation to avoid circular dependency)
      fieldValidations.push(DataTypeValidator.validateField(userStory.epic, 'object', 'epic', true))
    }

    if (userStory.creator) {
      const creatorValidation = this.validateUser(userStory.creator)
      if (!creatorValidation.isValid) {
        errors.push(`Invalid creator object: ${creatorValidation.errors.join(', ')}`)
      }
    }

    if (userStory.assignee) {
      const assigneeValidation = this.validateUser(userStory.assignee)
      if (!assigneeValidation.isValid) {
        errors.push(`Invalid assignee object: ${assigneeValidation.errors.join(', ')}`)
      }
    }

    if (userStory.acceptance_criteria) {
      fieldValidations.push(DataTypeValidator.validateField(userStory.acceptance_criteria, 'array', 'acceptance_criteria', true))
    }

    if (userStory.requirements) {
      fieldValidations.push(DataTypeValidator.validateField(userStory.requirements, 'array', 'requirements', true))
    }

    if (userStory.comments) {
      fieldValidations.push(DataTypeValidator.validateField(userStory.comments, 'array', 'comments', true))
    }

    // Check for unexpected fields
    const expectedFields = [...requiredFields, ...optionalFields]
    for (const field in userStory) {
      if (!expectedFields.includes(field)) {
        unexpectedFields.push(field)
      }
    }

    // Collect errors from field validations
    fieldValidations.forEach(validation => {
      if (!validation.isValid) {
        errors.push(`Field '${validation.field}': ${validation.message}`)
      }
    })

    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`)
    }

    if (unexpectedFields.length > 0) {
      warnings.push(`Unexpected fields: ${unexpectedFields.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fieldValidations,
      missingFields,
      unexpectedFields
    }
  }

  /**
   * Validate AcceptanceCriteria object
   */
  static validateAcceptanceCriteria(data: unknown): SchemaValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const fieldValidations: FieldValidationResult[] = []
    const missingFields: string[] = []
    const unexpectedFields: string[] = []

    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        errors: ['Expected acceptance criteria object, got ' + typeof data],
        warnings,
        fieldValidations,
        missingFields,
        unexpectedFields
      }
    }

    const ac = data as Record<string, unknown>
    const requiredFields = ['id', 'reference_id', 'description', 'user_story_id', 'author_id', 'created_at', 'last_modified']
    const optionalFields = ['user_story', 'author', 'requirements', 'comments']

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in ac)) {
        missingFields.push(field)
      }
    }

    // Validate required field types
    fieldValidations.push(DataTypeValidator.validateField(ac.id, 'uuid', 'id'))
    fieldValidations.push(DataTypeValidator.validateField(ac.reference_id, 'string', 'reference_id'))
    fieldValidations.push(DataTypeValidator.validateField(ac.description, 'string', 'description'))
    fieldValidations.push(DataTypeValidator.validateField(ac.user_story_id, 'uuid', 'user_story_id'))
    fieldValidations.push(DataTypeValidator.validateField(ac.author_id, 'uuid', 'author_id'))
    fieldValidations.push(DataTypeValidator.validateField(ac.created_at, 'date', 'created_at'))
    fieldValidations.push(DataTypeValidator.validateField(ac.last_modified, 'date', 'last_modified'))

    // Validate nested objects if present
    if (ac.user_story) {
      fieldValidations.push(DataTypeValidator.validateField(ac.user_story, 'object', 'user_story', true))
    }

    if (ac.author) {
      const authorValidation = this.validateUser(ac.author)
      if (!authorValidation.isValid) {
        errors.push(`Invalid author object: ${authorValidation.errors.join(', ')}`)
      }
    }

    if (ac.requirements) {
      fieldValidations.push(DataTypeValidator.validateField(ac.requirements, 'array', 'requirements', true))
    }

    if (ac.comments) {
      fieldValidations.push(DataTypeValidator.validateField(ac.comments, 'array', 'comments', true))
    }

    // Check for unexpected fields
    const expectedFields = [...requiredFields, ...optionalFields]
    for (const field in ac) {
      if (!expectedFields.includes(field)) {
        unexpectedFields.push(field)
      }
    }

    // Collect errors from field validations
    fieldValidations.forEach(validation => {
      if (!validation.isValid) {
        errors.push(`Field '${validation.field}': ${validation.message}`)
      }
    })

    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`)
    }

    if (unexpectedFields.length > 0) {
      warnings.push(`Unexpected fields: ${unexpectedFields.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fieldValidations,
      missingFields,
      unexpectedFields
    }
  }

  /**
   * Validate Requirement object
   */
  static validateRequirement(data: unknown): SchemaValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const fieldValidations: FieldValidationResult[] = []
    const missingFields: string[] = []
    const unexpectedFields: string[] = []

    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        errors: ['Expected requirement object, got ' + typeof data],
        warnings,
        fieldValidations,
        missingFields,
        unexpectedFields
      }
    }

    const req = data as Record<string, unknown>
    const requiredFields = ['id', 'reference_id', 'title', 'status', 'priority', 'user_story_id', 'type_id', 'creator_id', 'created_at', 'last_modified']
    const optionalFields = ['description', 'acceptance_criteria_id', 'assignee_id', 'user_story', 'acceptance_criteria', 'type', 'creator', 'assignee', 'source_relationships', 'target_relationships', 'comments']
    const validStatuses: RequirementStatus[] = ['Draft', 'Active', 'Obsolete']
    const validPriorities: Priority[] = [1, 2, 3, 4]

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in req)) {
        missingFields.push(field)
      }
    }

    // Validate required field types
    fieldValidations.push(DataTypeValidator.validateField(req.id, 'uuid', 'id'))
    fieldValidations.push(DataTypeValidator.validateField(req.reference_id, 'string', 'reference_id'))
    fieldValidations.push(DataTypeValidator.validateField(req.title, 'string', 'title'))
    fieldValidations.push(DataTypeValidator.validateEnum(req.status, validStatuses, 'status'))
    fieldValidations.push(DataTypeValidator.validateEnum(req.priority, validPriorities, 'priority'))
    fieldValidations.push(DataTypeValidator.validateField(req.user_story_id, 'uuid', 'user_story_id'))
    fieldValidations.push(DataTypeValidator.validateField(req.type_id, 'uuid', 'type_id'))
    fieldValidations.push(DataTypeValidator.validateField(req.creator_id, 'uuid', 'creator_id'))
    fieldValidations.push(DataTypeValidator.validateField(req.created_at, 'date', 'created_at'))
    fieldValidations.push(DataTypeValidator.validateField(req.last_modified, 'date', 'last_modified'))

    // Validate optional fields
    fieldValidations.push(DataTypeValidator.validateField(req.description, 'string', 'description', true))
    fieldValidations.push(DataTypeValidator.validateField(req.acceptance_criteria_id, 'uuid', 'acceptance_criteria_id', true))
    fieldValidations.push(DataTypeValidator.validateField(req.assignee_id, 'uuid', 'assignee_id', true))

    // Validate nested objects if present
    if (req.user_story) {
      fieldValidations.push(DataTypeValidator.validateField(req.user_story, 'object', 'user_story', true))
    }

    if (req.acceptance_criteria) {
      fieldValidations.push(DataTypeValidator.validateField(req.acceptance_criteria, 'object', 'acceptance_criteria', true))
    }

    if (req.type) {
      fieldValidations.push(DataTypeValidator.validateField(req.type, 'object', 'type', true))
    }

    if (req.creator) {
      const creatorValidation = this.validateUser(req.creator)
      if (!creatorValidation.isValid) {
        errors.push(`Invalid creator object: ${creatorValidation.errors.join(', ')}`)
      }
    }

    if (req.assignee) {
      const assigneeValidation = this.validateUser(req.assignee)
      if (!assigneeValidation.isValid) {
        errors.push(`Invalid assignee object: ${assigneeValidation.errors.join(', ')}`)
      }
    }

    if (req.source_relationships) {
      fieldValidations.push(DataTypeValidator.validateField(req.source_relationships, 'array', 'source_relationships', true))
    }

    if (req.target_relationships) {
      fieldValidations.push(DataTypeValidator.validateField(req.target_relationships, 'array', 'target_relationships', true))
    }

    if (req.comments) {
      fieldValidations.push(DataTypeValidator.validateField(req.comments, 'array', 'comments', true))
    }

    // Check for unexpected fields
    const expectedFields = [...requiredFields, ...optionalFields]
    for (const field in req) {
      if (!expectedFields.includes(field)) {
        unexpectedFields.push(field)
      }
    }

    // Collect errors from field validations
    fieldValidations.forEach(validation => {
      if (!validation.isValid) {
        errors.push(`Field '${validation.field}': ${validation.message}`)
      }
    })

    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`)
    }

    if (unexpectedFields.length > 0) {
      warnings.push(`Unexpected fields: ${unexpectedFields.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fieldValidations,
      missingFields,
      unexpectedFields
    }
  }

  /**
   * Validate ListResponse structure
   */
  static validateListResponse(
    data: unknown,
    itemValidator?: (item: unknown) => SchemaValidationResult
  ): SchemaValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const fieldValidations: FieldValidationResult[] = []
    const missingFields: string[] = []
    const unexpectedFields: string[] = []

    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        errors: ['Expected list response object, got ' + typeof data],
        warnings,
        fieldValidations,
        missingFields,
        unexpectedFields
      }
    }

    const listResponse = data as Record<string, unknown>
    const requiredFields = ['data', 'total_count', 'limit', 'offset']

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in listResponse)) {
        missingFields.push(field)
      }
    }

    // Validate field types
    fieldValidations.push(DataTypeValidator.validateField(listResponse.data, 'array', 'data'))
    fieldValidations.push(DataTypeValidator.validateField(listResponse.total_count, 'number', 'total_count'))
    fieldValidations.push(DataTypeValidator.validateField(listResponse.limit, 'number', 'limit'))
    fieldValidations.push(DataTypeValidator.validateField(listResponse.offset, 'number', 'offset'))

    // Validate array items if validator provided
    if (itemValidator && Array.isArray(listResponse.data)) {
      listResponse.data.forEach((item, index) => {
        const itemValidation = itemValidator(item)
        if (!itemValidation.isValid) {
          errors.push(`Item ${index}: ${itemValidation.errors.join(', ')}`)
        }
      })
    }

    // Check for unexpected fields
    const expectedFields = [...requiredFields]
    for (const field in listResponse) {
      if (!expectedFields.includes(field)) {
        unexpectedFields.push(field)
      }
    }

    // Collect errors from field validations
    fieldValidations.forEach(validation => {
      if (!validation.isValid) {
        errors.push(`Field '${validation.field}': ${validation.message}`)
      }
    })

    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`)
    }

    if (unexpectedFields.length > 0) {
      warnings.push(`Unexpected fields: ${unexpectedFields.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fieldValidations,
      missingFields,
      unexpectedFields
    }
  }
}

/**
 * Comprehensive API Response Validator
 * Combines all validation types for complete response validation
 */
export class ApiResponseValidator {
  /**
   * Validate a complete API response
   */
  static validateResponse(
    response: {
      status: number
      statusText?: string
      data: unknown
    },
    expectedStatus: number,
    schemaValidator?: (data: unknown) => SchemaValidationResult
  ): {
    httpValidation: HttpStatusValidationResult
    schemaValidation?: SchemaValidationResult
    overallValid: boolean
  } {
    const httpValidation = HttpStatusValidator.validate(
      response.status,
      expectedStatus,
      response.statusText
    )

    let schemaValidation: SchemaValidationResult | undefined
    if (schemaValidator && httpValidation.isValid) {
      schemaValidation = schemaValidator(response.data)
    }

    const overallValid = httpValidation.isValid && (schemaValidation?.isValid ?? true)

    return {
      httpValidation,
      schemaValidation,
      overallValid
    }
  }

  /**
   * Validate Epic list response
   */
  static validateEpicListResponse(
    response: { status: number; statusText?: string; data: unknown },
    expectedStatus = 200
  ) {
    return this.validateResponse(
      response,
      expectedStatus,
      (data) => SchemaValidator.validateListResponse(data, SchemaValidator.validateEpic)
    )
  }

  /**
   * Validate UserStory list response
   */
  static validateUserStoryListResponse(
    response: { status: number; statusText?: string; data: unknown },
    expectedStatus = 200
  ) {
    return this.validateResponse(
      response,
      expectedStatus,
      (data) => SchemaValidator.validateListResponse(data, SchemaValidator.validateUserStory)
    )
  }

  /**
   * Validate AcceptanceCriteria list response
   */
  static validateAcceptanceCriteriaListResponse(
    response: { status: number; statusText?: string; data: unknown },
    expectedStatus = 200
  ) {
    return this.validateResponse(
      response,
      expectedStatus,
      (data) => SchemaValidator.validateListResponse(data, SchemaValidator.validateAcceptanceCriteria)
    )
  }

  /**
   * Validate Requirement list response
   */
  static validateRequirementListResponse(
    response: { status: number; statusText?: string; data: unknown },
    expectedStatus = 200
  ) {
    return this.validateResponse(
      response,
      expectedStatus,
      (data) => SchemaValidator.validateListResponse(data, SchemaValidator.validateRequirement)
    )
  }

  /**
   * Validate single Epic response
   */
  static validateEpicResponse(
    response: { status: number; statusText?: string; data: unknown },
    expectedStatus = 200
  ) {
    return this.validateResponse(
      response,
      expectedStatus,
      SchemaValidator.validateEpic
    )
  }

  /**
   * Validate single UserStory response
   */
  static validateUserStoryResponse(
    response: { status: number; statusText?: string; data: unknown },
    expectedStatus = 200
  ) {
    return this.validateResponse(
      response,
      expectedStatus,
      SchemaValidator.validateUserStory
    )
  }

  /**
   * Validate single AcceptanceCriteria response
   */
  static validateAcceptanceCriteriaResponse(
    response: { status: number; statusText?: string; data: unknown },
    expectedStatus = 200
  ) {
    return this.validateResponse(
      response,
      expectedStatus,
      SchemaValidator.validateAcceptanceCriteria
    )
  }

  /**
   * Validate single Requirement response
   */
  static validateRequirementResponse(
    response: { status: number; statusText?: string; data: unknown },
    expectedStatus = 200
  ) {
    return this.validateResponse(
      response,
      expectedStatus,
      SchemaValidator.validateRequirement
    )
  }
}