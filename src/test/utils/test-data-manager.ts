/**
 * Test Data Management Utilities
 * 
 * Manages creation and cleanup of test data for integration tests.
 * Provides comprehensive test data creation, tracking, and cleanup functionality
 * with rollback mechanisms for failed tests.
 */

import type { Epic, UserStory, AcceptanceCriteria, Requirement, Comment } from '@/types'
import { getTestConfig } from './test-environment'

interface TestEntity {
  id: string
  type: 'epic' | 'user_story' | 'acceptance_criteria' | 'requirement' | 'comment'
  reference_id: string
  created_at: Date
  parent_id?: string // For tracking relationships
  test_run_id?: string // For isolating test runs
}

interface TestDataManagerOptions {
  token: string
  baseUrl: string
  trackCreatedEntities?: boolean
  testRunId?: string // Unique identifier for this test run
  enableRollback?: boolean // Enable automatic rollback on failures
}



interface BulkCreationResult<T> {
  entities: T[]
  successCount: number
  failureCount: number
  errors: string[]
}

interface TestDataStats {
  totalCreated: number
  totalCleaned: number
  byType: Record<TestEntity['type'], number>
  testRunId?: string
  startTime: Date
  endTime?: Date
}

/**
 * Manages test data creation and cleanup with comprehensive tracking and rollback capabilities
 */
export class TestDataManager {
  private token: string
  private baseUrl: string
  private createdEntities: TestEntity[] = []
  private trackEntities: boolean
  private testRunId: string
  private enableRollback: boolean
  private stats: TestDataStats
  private rollbackStack: TestEntity[] = []

  constructor(options: TestDataManagerOptions) {
    this.token = options.token
    this.baseUrl = options.baseUrl
    this.trackEntities = options.trackCreatedEntities ?? true
    this.testRunId = options.testRunId ?? this.generateTestRunId()
    this.enableRollback = options.enableRollback ?? true
    this.stats = {
      totalCreated: 0,
      totalCleaned: 0,
      byType: {
        epic: 0,
        user_story: 0,
        acceptance_criteria: 0,
        requirement: 0,
        comment: 0
      },
      testRunId: this.testRunId,
      startTime: new Date()
    }
  }

  /**
   * Generate a unique test run identifier
   */
  private generateTestRunId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `test-run-${timestamp}-${random}`
  }

  /**
   * Track a created entity
   */
  private trackEntity(entity: TestEntity): void {
    if (this.trackEntities) {
      entity.test_run_id = this.testRunId
      this.createdEntities.push(entity)
      this.rollbackStack.push(entity)
      this.stats.totalCreated++
      this.stats.byType[entity.type]++
    }
  }

  /**
   * Execute API request with error handling
   */
  private async executeApiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    }

    const config: RequestInit = {
      method,
      headers
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`API request failed: ${method} ${endpoint} - HTTP ${response.status} - ${errorText}`)
    }

    if (method === 'DELETE') {
      return {} as T // DELETE requests typically don't return data
    }

    return await response.json()
  }

  /**
   * Creates a test epic with unique identifier
   */
  async createTestEpic(overrides: Partial<{
    title: string
    description: string
    priority: 1 | 2 | 3 | 4
    assignee_id: string
  }> = {}): Promise<Epic> {
    const timestamp = Date.now()
    const uniqueId = Math.random().toString(36).substring(2, 8)

    // Get current user to use as creator_id
    let creator_id: string
    try {
      const currentUser = await this.executeApiRequest<{ id: string }>('/auth/profile', 'GET')
      creator_id = currentUser.id
    } catch (error) {
      throw new Error(`Failed to get current user for epic creation: ${error}`)
    }

    const epicData = {
      title: `Test Epic ${timestamp}-${uniqueId} [${this.testRunId}]`,
      description: `Test epic created for integration testing at ${new Date().toISOString()} (Test Run: ${this.testRunId})`,
      priority: 3 as const,
      creator_id,
      ...overrides
    }

    try {
      const epic = await this.executeApiRequest<Epic>('/api/v1/epics', 'POST', epicData)

      this.trackEntity({
        id: epic.id,
        type: 'epic',
        reference_id: epic.reference_id,
        created_at: new Date(),
        test_run_id: this.testRunId
      })

      console.log(`📝 Created test epic: ${epic.reference_id} - "${epic.title}"`)
      return epic
    } catch (error) {
      console.error(`❌ Failed to create test epic:`, error)
      if (this.enableRollback) {
        await this.rollbackLastOperations(1)
      }
      throw error
    }
  }

  /**
   * Creates multiple test epics
   */
  async createTestEpics(count: number, overrides: Partial<{
    title: string
    description: string
    priority: 1 | 2 | 3 | 4
    assignee_id: string
  }> = {}): Promise<BulkCreationResult<Epic>> {
    const results: Epic[] = []
    const errors: string[] = []
    let successCount = 0

    console.log(`📝 Creating ${count} test epics...`)

    for (let i = 0; i < count; i++) {
      try {
        const epic = await this.createTestEpic({
          ...overrides,
          title: overrides.title ? `${overrides.title} ${i + 1}` : undefined
        })
        results.push(epic)
        successCount++
      } catch (error) {
        errors.push(`Epic ${i + 1}: ${error}`)
      }
    }

    console.log(`📝 Created ${successCount}/${count} test epics`)
    return {
      entities: results,
      successCount,
      failureCount: count - successCount,
      errors
    }
  }

  /**
   * Creates a test user story within an epic
   */
  async createTestUserStory(epicId: string, overrides: Partial<{
    title: string
    description: string
    priority: 1 | 2 | 3 | 4
    assignee_id: string
  }> = {}): Promise<UserStory> {
    const timestamp = Date.now()
    const uniqueId = Math.random().toString(36).substring(2, 8)

    // Get current user to use as creator_id
    let creator_id: string
    try {
      const currentUser = await this.executeApiRequest<{ id: string }>('/auth/profile', 'GET')
      creator_id = currentUser.id
    } catch (error) {
      throw new Error(`Failed to get current user for user story creation: ${error}`)
    }

    const userStoryData = {
      title: `Test User Story ${timestamp}-${uniqueId} [${this.testRunId}]`,
      description: `As a test user, I want to create test data for integration testing, so that I can verify comment functionality (Test Run: ${this.testRunId})`,
      priority: 3 as const,
      epic_id: epicId,
      creator_id,
      ...overrides
    }

    try {
      const userStory = await this.executeApiRequest<UserStory>('/api/v1/user-stories', 'POST', userStoryData)

      this.trackEntity({
        id: userStory.id,
        type: 'user_story',
        reference_id: userStory.reference_id,
        created_at: new Date(),
        parent_id: epicId,
        test_run_id: this.testRunId
      })

      console.log(`📝 Created test user story: ${userStory.reference_id} - "${userStory.title}"`)
      return userStory
    } catch (error) {
      console.error(`❌ Failed to create test user story:`, error)
      if (this.enableRollback) {
        await this.rollbackLastOperations(1)
      }
      throw error
    }
  }

  /**
   * Creates multiple test user stories for an epic
   */
  async createTestUserStories(epicId: string, count: number, overrides: Partial<{
    title: string
    description: string
    priority: 1 | 2 | 3 | 4
    assignee_id: string
  }> = {}): Promise<BulkCreationResult<UserStory>> {
    const results: UserStory[] = []
    const errors: string[] = []
    let successCount = 0

    console.log(`📝 Creating ${count} test user stories for epic ${epicId}...`)

    for (let i = 0; i < count; i++) {
      try {
        const userStory = await this.createTestUserStory(epicId, {
          ...overrides,
          title: overrides.title ? `${overrides.title} ${i + 1}` : undefined
        })
        results.push(userStory)
        successCount++
      } catch (error) {
        errors.push(`User Story ${i + 1}: ${error}`)
      }
    }

    console.log(`📝 Created ${successCount}/${count} test user stories`)
    return {
      entities: results,
      successCount,
      failureCount: count - successCount,
      errors
    }
  }

  /**
   * Creates test acceptance criteria for a user story
   */
  async createTestAcceptanceCriteria(userStoryId: string, overrides: Partial<{
    description: string
  }> = {}): Promise<AcceptanceCriteria> {
    const timestamp = Date.now()
    const uniqueId = Math.random().toString(36).substring(2, 8)

    // Get current user to use as author_id
    let author_id: string
    try {
      const currentUser = await this.executeApiRequest<{ id: string }>('/auth/profile', 'GET')
      author_id = currentUser.id
    } catch (error) {
      throw new Error(`Failed to get current user for acceptance criteria creation: ${error}`)
    }

    const criteriaData = {
      description: `Test acceptance criteria ${timestamp}-${uniqueId} created for integration testing at ${new Date().toISOString()} (Test Run: ${this.testRunId})`,
      user_story_id: userStoryId,
      author_id,
      ...overrides
    }

    try {
      const criteria = await this.executeApiRequest<AcceptanceCriteria>('/api/v1/acceptance-criteria', 'POST', criteriaData)

      this.trackEntity({
        id: criteria.id,
        type: 'acceptance_criteria',
        reference_id: criteria.reference_id,
        created_at: new Date(),
        parent_id: userStoryId,
        test_run_id: this.testRunId
      })

      console.log(`📝 Created test acceptance criteria: ${criteria.reference_id}`)
      return criteria
    } catch (error) {
      console.error(`❌ Failed to create test acceptance criteria:`, error)
      if (this.enableRollback) {
        await this.rollbackLastOperations(1)
      }
      throw error
    }
  }

  /**
   * Creates multiple test acceptance criteria for a user story
   */
  async createTestAcceptanceCriteriaList(userStoryId: string, count: number, overrides: Partial<{
    description: string
  }> = {}): Promise<BulkCreationResult<AcceptanceCriteria>> {
    const results: AcceptanceCriteria[] = []
    const errors: string[] = []
    let successCount = 0

    console.log(`📝 Creating ${count} test acceptance criteria for user story ${userStoryId}...`)

    for (let i = 0; i < count; i++) {
      try {
        const criteria = await this.createTestAcceptanceCriteria(userStoryId, {
          ...overrides,
          description: overrides.description ? `${overrides.description} ${i + 1}` : undefined
        })
        results.push(criteria)
        successCount++
      } catch (error) {
        errors.push(`Acceptance Criteria ${i + 1}: ${error}`)
      }
    }

    console.log(`📝 Created ${successCount}/${count} test acceptance criteria`)
    return {
      entities: results,
      successCount,
      failureCount: count - successCount,
      errors
    }
  }

  /**
   * Creates a test requirement
   */
  async createTestRequirement(userStoryId: string, typeId: string, overrides: Partial<{
    title: string
    description: string
    priority: 1 | 2 | 3 | 4
    acceptance_criteria_id: string
    assignee_id: string
  }> = {}): Promise<Requirement> {
    const timestamp = Date.now()
    const uniqueId = Math.random().toString(36).substring(2, 8)

    // Get current user to use as creator_id
    let creator_id: string
    try {
      const currentUser = await this.executeApiRequest<{ id: string }>('/auth/profile', 'GET')
      creator_id = currentUser.id
    } catch (error) {
      throw new Error(`Failed to get current user for requirement creation: ${error}`)
    }

    const requirementData = {
      title: `Test Requirement ${timestamp}-${uniqueId} [${this.testRunId}]`,
      description: `Test requirement created for integration testing at ${new Date().toISOString()} (Test Run: ${this.testRunId})`,
      priority: 3 as const,
      user_story_id: userStoryId,
      type_id: typeId,
      creator_id,
      ...overrides
    }

    try {
      const requirement = await this.executeApiRequest<Requirement>('/api/v1/requirements', 'POST', requirementData)

      this.trackEntity({
        id: requirement.id,
        type: 'requirement',
        reference_id: requirement.reference_id,
        created_at: new Date(),
        parent_id: userStoryId,
        test_run_id: this.testRunId
      })

      console.log(`📝 Created test requirement: ${requirement.reference_id} - "${requirement.title}"`)
      return requirement
    } catch (error) {
      console.error(`❌ Failed to create test requirement:`, error)
      if (this.enableRollback) {
        await this.rollbackLastOperations(1)
      }
      throw error
    }
  }

  /**
   * Creates multiple test requirements for a user story
   */
  async createTestRequirements(userStoryId: string, typeId: string, count: number, overrides: Partial<{
    title: string
    description: string
    priority: 1 | 2 | 3 | 4
    acceptance_criteria_id: string
    assignee_id: string
  }> = {}): Promise<BulkCreationResult<Requirement>> {
    const results: Requirement[] = []
    const errors: string[] = []
    let successCount = 0

    console.log(`📝 Creating ${count} test requirements for user story ${userStoryId}...`)

    for (let i = 0; i < count; i++) {
      try {
        const requirement = await this.createTestRequirement(userStoryId, typeId, {
          ...overrides,
          title: overrides.title ? `${overrides.title} ${i + 1}` : undefined
        })
        results.push(requirement)
        successCount++
      } catch (error) {
        errors.push(`Requirement ${i + 1}: ${error}`)
      }
    }

    console.log(`📝 Created ${successCount}/${count} test requirements`)
    return {
      entities: results,
      successCount,
      failureCount: count - successCount,
      errors
    }
  }

  /**
   * Creates a test comment for an entity
   */
  async createTestComment(entityType: 'epic' | 'user_story' | 'acceptance_criteria' | 'requirement', entityId: string, overrides: Partial<{
    content: string
    parent_comment_id: string
    author_id: string
  }> = {}): Promise<Comment> {
    const timestamp = Date.now()
    const uniqueId = Math.random().toString(36).substring(2, 8)

    // Get current user to use as author_id if not provided
    let author_id = overrides.author_id
    if (!author_id) {
      try {
        const currentUser = await this.executeApiRequest<{ id: string }>('/auth/profile', 'GET')
        author_id = currentUser.id
      } catch (error) {
        throw new Error(`Failed to get current user for comment creation: ${error}`)
      }
    }

    const commentData = {
      content: `Test comment ${timestamp}-${uniqueId} created for integration testing at ${new Date().toISOString()} (Test Run: ${this.testRunId})`,
      author_id,
      ...overrides
    }

    try {
      const comment = await this.executeApiRequest<Comment>(`/api/v1/${entityType}s/${entityId}/comments`, 'POST', commentData)

      this.trackEntity({
        id: comment.id,
        type: 'comment',
        reference_id: `comment-${comment.id}`,
        created_at: new Date(),
        parent_id: entityId,
        test_run_id: this.testRunId
      })

      console.log(`📝 Created test comment for ${entityType} ${entityId}`)
      return comment
    } catch (error) {
      console.error(`❌ Failed to create test comment:`, error)
      if (this.enableRollback) {
        await this.rollbackLastOperations(1)
      }
      throw error
    }
  }

  /**
   * Gets the list of created entities for cleanup
   */
  getCreatedEntities(): TestEntity[] {
    return [...this.createdEntities]
  }

  /**
   * Gets test data statistics
   */
  getStats(): TestDataStats {
    return {
      ...this.stats,
      endTime: new Date()
    }
  }

  /**
   * Rollback the last N operations
   */
  async rollbackLastOperations(count: number): Promise<void> {
    if (!this.enableRollback || this.rollbackStack.length === 0) {
      return
    }

    const toRollback = this.rollbackStack.splice(-count, count).reverse()
    console.log(`🔄 Rolling back ${toRollback.length} operations...`)

    for (const entity of toRollback) {
      try {
        await this.deleteEntity(entity)
        this.createdEntities = this.createdEntities.filter(e => e.id !== entity.id)
        console.log(`   ↩️ Rolled back ${entity.type}: ${entity.reference_id}`)
      } catch (error) {
        console.log(`   ❌ Failed to rollback ${entity.type}: ${entity.reference_id} - ${error}`)
      }
    }
  }

  /**
   * Rollback all operations for this test run
   */
  async rollbackAll(): Promise<void> {
    await this.rollbackLastOperations(this.rollbackStack.length)
  }

  /**
   * Create test data with automatic rollback on failure
   */
  async createWithRollback<T>(
    createFn: () => Promise<T>,
    rollbackCount: number = 1
  ): Promise<T> {
    try {
      return await createFn()
    } catch (error) {
      if (this.enableRollback) {
        await this.rollbackLastOperations(rollbackCount)
      }
      throw error
    }
  }

  /**
   * Cleans up all tracked test entities
   */
  async cleanupTestData(): Promise<void> {
    if (!this.trackEntities || this.createdEntities.length === 0) {
      console.log('🧹 No test data to clean up')
      return
    }

    const config = getTestConfig()
    if (!config.cleanupAfterTests) {
      console.log('🧹 Test data cleanup disabled by configuration')
      return
    }

    console.log(`🧹 Cleaning up ${this.createdEntities.length} test entities for test run ${this.testRunId}...`)

    // Sort entities by dependency order (comments -> requirements -> acceptance criteria -> user stories -> epics)
    const sortedEntities = [...this.createdEntities].sort((a, b) => {
      const order = { comment: 0, requirement: 1, acceptance_criteria: 2, user_story: 3, epic: 4 }
      return order[a.type] - order[b.type]
    })

    let cleanedCount = 0
    let errorCount = 0

    for (const entity of sortedEntities) {
      try {
        await this.deleteEntity(entity)
        cleanedCount++
        this.stats.totalCleaned++
        console.log(`   ✅ Deleted ${entity.type}: ${entity.reference_id}`)
      } catch (error) {
        errorCount++
        console.log(`   ❌ Failed to delete ${entity.type}: ${entity.reference_id} - ${error}`)
      }
    }

    this.createdEntities = []
    this.rollbackStack = []
    console.log(`🧹 Cleanup complete: ${cleanedCount} deleted, ${errorCount} errors`)
  }

  /**
   * Cleans up test entities by type
   */
  async cleanupByType(entityType: TestEntity['type']): Promise<void> {
    const entitiesToClean = this.createdEntities.filter(e => e.type === entityType)

    if (entitiesToClean.length === 0) {
      console.log(`🧹 No ${entityType} entities to clean up`)
      return
    }

    console.log(`🧹 Cleaning up ${entitiesToClean.length} ${entityType} entities...`)

    let cleanedCount = 0
    let errorCount = 0

    for (const entity of entitiesToClean) {
      try {
        await this.deleteEntity(entity)
        this.createdEntities = this.createdEntities.filter(e => e.id !== entity.id)
        this.rollbackStack = this.rollbackStack.filter(e => e.id !== entity.id)
        cleanedCount++
        this.stats.totalCleaned++
        console.log(`   ✅ Deleted ${entity.type}: ${entity.reference_id}`)
      } catch (error) {
        errorCount++
        console.log(`   ❌ Failed to delete ${entity.type}: ${entity.reference_id} - ${error}`)
      }
    }

    console.log(`🧹 ${entityType} cleanup complete: ${cleanedCount} deleted, ${errorCount} errors`)
  }

  /**
   * Deletes a specific entity
   */
  private async deleteEntity(entity: TestEntity): Promise<void> {
    const endpoint = this.getEntityEndpoint(entity.type)

    try {
      if (entity.type === 'comment') {
        // Comments use a different deletion endpoint
        await this.executeApiRequest(`/api/v1/comments/${entity.id}`, 'DELETE')
      } else {
        await this.executeApiRequest(`/api/v1/${endpoint}/${entity.id}`, 'DELETE')
      }
    } catch (error) {
      // If entity is already deleted (404), consider it successful
      if (error instanceof Error && error.message.includes('404')) {
        return
      }
      throw error
    }
  }

  /**
   * Gets the API endpoint for an entity type
   */
  private getEntityEndpoint(type: TestEntity['type']): string {
    switch (type) {
      case 'epic':
        return 'epics'
      case 'user_story':
        return 'user-stories'
      case 'acceptance_criteria':
        return 'acceptance-criteria'
      case 'requirement':
        return 'requirements'
      case 'comment':
        return 'comments'
      default:
        throw new Error(`Unknown entity type: ${type}`)
    }
  }

  /**
   * Creates a complete test hierarchy (epic -> user story -> acceptance criteria -> requirement)
   */
  async createTestHierarchy(requirementTypeId: string, overrides: {
    epic?: Partial<Parameters<TestDataManager['createTestEpic']>[0]>
    userStory?: Partial<Parameters<TestDataManager['createTestUserStory']>[1]>
    acceptanceCriteria?: Partial<Parameters<TestDataManager['createTestAcceptanceCriteria']>[1]>
    requirement?: Partial<Parameters<TestDataManager['createTestRequirement']>[2]>
  } = {}): Promise<{
    epic: Epic
    userStory: UserStory
    acceptanceCriteria: AcceptanceCriteria
    requirement: Requirement
  }> {
    console.log('🏗️ Creating test hierarchy...')

    try {
      const epic = await this.createTestEpic(overrides.epic)
      const userStory = await this.createTestUserStory(epic.id, overrides.userStory)
      const acceptanceCriteria = await this.createTestAcceptanceCriteria(userStory.id, overrides.acceptanceCriteria)
      const requirement = await this.createTestRequirement(
        userStory.id,
        requirementTypeId,
        {
          acceptance_criteria_id: acceptanceCriteria.id,
          ...overrides.requirement
        }
      )

      console.log('🏗️ Test hierarchy created successfully')
      return { epic, userStory, acceptanceCriteria, requirement }
    } catch (error) {
      console.error('❌ Failed to create test hierarchy:', error)
      if (this.enableRollback) {
        await this.rollbackAll()
      }
      throw error
    }
  }

  /**
   * Creates multiple complete test hierarchies
   */
  async createTestHierarchies(count: number, requirementTypeId: string, overrides: {
    epic?: Partial<Parameters<TestDataManager['createTestEpic']>[0]>
    userStory?: Partial<Parameters<TestDataManager['createTestUserStory']>[1]>
    acceptanceCriteria?: Partial<Parameters<TestDataManager['createTestAcceptanceCriteria']>[1]>
    requirement?: Partial<Parameters<TestDataManager['createTestRequirement']>[2]>
  } = {}): Promise<BulkCreationResult<{
    epic: Epic
    userStory: UserStory
    acceptanceCriteria: AcceptanceCriteria
    requirement: Requirement
  }>> {
    const results: Array<{
      epic: Epic
      userStory: UserStory
      acceptanceCriteria: AcceptanceCriteria
      requirement: Requirement
    }> = []
    const errors: string[] = []
    let successCount = 0

    console.log(`🏗️ Creating ${count} test hierarchies...`)

    for (let i = 0; i < count; i++) {
      try {
        const hierarchy = await this.createTestHierarchy(requirementTypeId, {
          epic: {
            ...overrides.epic,
            title: overrides.epic?.title ? `${overrides.epic.title} ${i + 1}` : undefined
          },
          userStory: {
            ...overrides.userStory,
            title: overrides.userStory?.title ? `${overrides.userStory.title} ${i + 1}` : undefined
          },
          acceptanceCriteria: {
            ...overrides.acceptanceCriteria,
            description: overrides.acceptanceCriteria?.description ? `${overrides.acceptanceCriteria.description} ${i + 1}` : undefined
          },
          requirement: {
            ...overrides.requirement,
            title: overrides.requirement?.title ? `${overrides.requirement.title} ${i + 1}` : undefined
          }
        })
        results.push(hierarchy)
        successCount++
      } catch (error) {
        errors.push(`Hierarchy ${i + 1}: ${error}`)
      }
    }

    console.log(`🏗️ Created ${successCount}/${count} test hierarchies`)
    return {
      entities: results,
      successCount,
      failureCount: count - successCount,
      errors
    }
  }

  /**
   * Cleans up test entities older than specified age
   */
  async cleanupOldTestData(maxAgeMinutes: number = 60): Promise<void> {
    const cutoffTime = new Date(Date.now() - maxAgeMinutes * 60 * 1000)
    const oldEntities = this.createdEntities.filter(entity => entity.created_at < cutoffTime)

    if (oldEntities.length === 0) {
      console.log('🧹 No old test data to clean up')
      return
    }

    console.log(`🧹 Cleaning up ${oldEntities.length} old test entities (older than ${maxAgeMinutes} minutes)...`)

    // Sort by dependency order for safe deletion
    const sortedOldEntities = oldEntities.sort((a, b) => {
      const order = { comment: 0, requirement: 1, acceptance_criteria: 2, user_story: 3, epic: 4 }
      return order[a.type] - order[b.type]
    })

    for (const entity of sortedOldEntities) {
      try {
        await this.deleteEntity(entity)
        this.createdEntities = this.createdEntities.filter(e => e.id !== entity.id)
        this.rollbackStack = this.rollbackStack.filter(e => e.id !== entity.id)
        this.stats.totalCleaned++
        console.log(`   ✅ Deleted old ${entity.type}: ${entity.reference_id}`)
      } catch (error) {
        console.log(`   ❌ Failed to delete old ${entity.type}: ${entity.reference_id} - ${error}`)
      }
    }
  }

  /**
   * Cleans up test entities by test run ID (useful for cleaning up failed test runs)
   */
  async cleanupByTestRunId(testRunId: string): Promise<void> {
    const entitiesToClean = this.createdEntities.filter(e => e.test_run_id === testRunId)

    if (entitiesToClean.length === 0) {
      console.log(`🧹 No entities found for test run ${testRunId}`)
      return
    }

    console.log(`🧹 Cleaning up ${entitiesToClean.length} entities for test run ${testRunId}...`)

    // Sort by dependency order for safe deletion
    const sortedEntities = entitiesToClean.sort((a, b) => {
      const order = { comment: 0, requirement: 1, acceptance_criteria: 2, user_story: 3, epic: 4 }
      return order[a.type] - order[b.type]
    })

    let cleanedCount = 0
    let errorCount = 0

    for (const entity of sortedEntities) {
      try {
        await this.deleteEntity(entity)
        this.createdEntities = this.createdEntities.filter(e => e.id !== entity.id)
        this.rollbackStack = this.rollbackStack.filter(e => e.id !== entity.id)
        cleanedCount++
        this.stats.totalCleaned++
        console.log(`   ✅ Deleted ${entity.type}: ${entity.reference_id}`)
      } catch (error) {
        errorCount++
        console.log(`   ❌ Failed to delete ${entity.type}: ${entity.reference_id} - ${error}`)
      }
    }

    console.log(`🧹 Test run ${testRunId} cleanup complete: ${cleanedCount} deleted, ${errorCount} errors`)
  }

  /**
   * Get entities created in the current test run
   */
  getCurrentTestRunEntities(): TestEntity[] {
    return this.createdEntities.filter(e => e.test_run_id === this.testRunId)
  }

  /**
   * Check if test data isolation is working properly
   */
  validateTestDataIsolation(): boolean {
    const currentRunEntities = this.getCurrentTestRunEntities()
    const otherRunEntities = this.createdEntities.filter(e => e.test_run_id !== this.testRunId)

    console.log(`🔍 Test data isolation check:`)
    console.log(`   Current run (${this.testRunId}): ${currentRunEntities.length} entities`)
    console.log(`   Other runs: ${otherRunEntities.length} entities`)

    return currentRunEntities.length === this.createdEntities.length
  }
}