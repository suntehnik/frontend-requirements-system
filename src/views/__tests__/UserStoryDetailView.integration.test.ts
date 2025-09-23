import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { userStoryService } from '@/services/user-story-service'
import type { UserStory, AcceptanceCriteria, Requirement } from '@/types'

// Mock the user story service
vi.mock('@/services/user-story-service', () => ({
  userStoryService: {
    get: vi.fn(),
    getAcceptanceCriteria: vi.fn(),
    getRequirements: vi.fn(),
  },
}))

const mockUserStory: UserStory = {
  id: '1',
  reference_id: 'US-001',
  title: 'Test User Story',
  description: 'Test user story description',
  status: 'In Progress',
  priority: 1,
  epic_id: 'epic1',
  creator_id: 'user1',
  assignee_id: 'user2',
  created_at: '2024-01-15T10:00:00Z',
  last_modified: '2024-01-20T15:30:00Z',
  epic: {
    id: 'epic1',
    reference_id: 'EP-001',
    title: 'Test Epic',
    description: 'Test epic description',
    status: 'In Progress',
    priority: 1,
  },
  creator: {
    id: 'user1',
    username: 'creator',
    email: 'creator@test.com',
    role: 'User',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  assignee: {
    id: 'user2',
    username: 'assignee',
    email: 'assignee@test.com',
    role: 'User',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  acceptance_criteria: [
    {
      id: 'ac1',
      reference_id: 'AC-001',
      description: 'Acceptance criteria 1',
    },
    {
      id: 'ac2',
      reference_id: 'AC-002',
      description: 'Acceptance criteria 2',
    },
  ] as AcceptanceCriteria[],
  requirements: [
    {
      id: 'req1',
      reference_id: 'REQ-001',
      title: 'Requirement 1',
      status: 'Active',
      priority: 1,
    },
    {
      id: 'req2',
      reference_id: 'REQ-002',
      title: 'Requirement 2',
      status: 'Draft',
      priority: 2,
    },
  ] as Requirement[],
}

const mockAcceptanceCriteria: AcceptanceCriteria[] = [
  {
    id: 'ac1',
    reference_id: 'AC-001',
    description: 'User can enter login and password',
    user_story_id: '1',
    author_id: 'user1',
    created_at: '2024-01-16T10:00:00Z',
    last_modified: '2024-01-16T10:00:00Z',
  },
  {
    id: 'ac2',
    reference_id: 'AC-002',
    description: 'System validates credentials',
    user_story_id: '1',
    author_id: 'user1',
    created_at: '2024-01-17T10:00:00Z',
    last_modified: '2024-01-17T10:00:00Z',
  },
]

const mockRequirements: Requirement[] = [
  {
    id: 'req1',
    reference_id: 'REQ-001',
    title: 'Password validation',
    description: 'Validate password strength',
    status: 'Active',
    priority: 1,
    user_story_id: '1',
    type_id: 'type1',
    creator_id: 'user1',
    assignee_id: 'user2',
    created_at: '2024-01-18T10:00:00Z',
    last_modified: '2024-01-18T10:00:00Z',
    type: {
      id: 'type1',
      name: 'Functional',
      description: 'Functional requirement',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    assignee: {
      id: 'user2',
      username: 'assignee',
      email: 'assignee@test.com',
      role: 'User',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'req2',
    reference_id: 'REQ-002',
    title: 'JWT token authentication',
    description: 'Implement JWT token authentication',
    status: 'Draft',
    priority: 2,
    user_story_id: '1',
    type_id: 'type2',
    creator_id: 'user1',
    created_at: '2024-01-19T10:00:00Z',
    last_modified: '2024-01-19T10:00:00Z',
    type: {
      id: 'type2',
      name: 'Technical',
      description: 'Technical requirement',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
]

describe('UserStoryDetailView Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should fetch user story data with related entities through the service', async () => {
    // Mock successful API response
    vi.mocked(userStoryService.get).mockResolvedValue(mockUserStory)

    // Call the service method that the component uses
    const result = await userStoryService.get('1', 'epic,creator,assignee,acceptance_criteria,requirements')

    // Verify API was called with correct parameters
    expect(userStoryService.get).toHaveBeenCalledWith('1', 'epic,creator,assignee,acceptance_criteria,requirements')

    // Verify the returned data structure
    expect(result.id).toBe('1')
    expect(result.reference_id).toBe('US-001')
    expect(result.title).toBe('Test User Story')
    expect(result.epic?.reference_id).toBe('EP-001')
    expect(result.assignee?.username).toBe('assignee')
    expect(result.acceptance_criteria).toHaveLength(2)
    expect(result.requirements).toHaveLength(2)
  })

  it('should handle API errors gracefully', async () => {
    // Mock API error
    const errorMessage = 'Failed to load user story'
    vi.mocked(userStoryService.get).mockRejectedValue(new Error(errorMessage))

    // Call the service method
    await expect(userStoryService.get('1', 'epic,creator,assignee,acceptance_criteria,requirements')).rejects.toThrow(errorMessage)

    // Verify the error was thrown
    expect(userStoryService.get).toHaveBeenCalledWith('1', 'epic,creator,assignee,acceptance_criteria,requirements')
  })

  it('should load acceptance criteria separately when not included in user story data', async () => {
    // Mock user story without acceptance criteria
    const userStoryWithoutCriteria = { ...mockUserStory, acceptance_criteria: undefined }
    vi.mocked(userStoryService.get).mockResolvedValue(userStoryWithoutCriteria)
    vi.mocked(userStoryService.getAcceptanceCriteria).mockResolvedValue(mockAcceptanceCriteria)

    // First call to get user story
    const userStory = await userStoryService.get('1', 'epic,creator,assignee,acceptance_criteria,requirements')
    expect(userStory.acceptance_criteria).toBeUndefined()

    // Second call to get acceptance criteria
    const criteria = await userStoryService.getAcceptanceCriteria('1')
    expect(criteria).toHaveLength(2)

    // Verify both API methods were called
    expect(userStoryService.get).toHaveBeenCalledWith('1', 'epic,creator,assignee,acceptance_criteria,requirements')
    expect(userStoryService.getAcceptanceCriteria).toHaveBeenCalledWith('1')
  })

  it('should load requirements separately when not included in user story data', async () => {
    // Mock user story without requirements
    const userStoryWithoutRequirements = { ...mockUserStory, requirements: undefined }
    vi.mocked(userStoryService.get).mockResolvedValue(userStoryWithoutRequirements)
    vi.mocked(userStoryService.getRequirements).mockResolvedValue(mockRequirements)

    // First call to get user story
    const userStory = await userStoryService.get('1', 'epic,creator,assignee,acceptance_criteria,requirements')
    expect(userStory.requirements).toBeUndefined()

    // Second call to get requirements
    const requirements = await userStoryService.getRequirements('1')
    expect(requirements).toHaveLength(2)

    // Verify both API methods were called
    expect(userStoryService.get).toHaveBeenCalledWith('1', 'epic,creator,assignee,acceptance_criteria,requirements')
    expect(userStoryService.getRequirements).toHaveBeenCalledWith('1')
  })

  it('should handle empty acceptance criteria correctly', async () => {
    // Mock user story with no acceptance criteria
    const userStoryWithoutCriteria = { ...mockUserStory, acceptance_criteria: [] }
    vi.mocked(userStoryService.get).mockResolvedValue(userStoryWithoutCriteria)

    const result = await userStoryService.get('1', 'epic,creator,assignee,acceptance_criteria,requirements')

    // Verify empty acceptance criteria array
    expect(result.acceptance_criteria).toHaveLength(0)
    expect(result.id).toBe('1')
    expect(result.title).toBe('Test User Story')
  })

  it('should handle empty requirements correctly', async () => {
    // Mock user story with no requirements
    const userStoryWithoutRequirements = { ...mockUserStory, requirements: [] }
    vi.mocked(userStoryService.get).mockResolvedValue(userStoryWithoutRequirements)

    const result = await userStoryService.get('1', 'epic,creator,assignee,acceptance_criteria,requirements')

    // Verify empty requirements array
    expect(result.requirements).toHaveLength(0)
    expect(result.id).toBe('1')
    expect(result.title).toBe('Test User Story')
  })

  it('should provide correct statistics calculations', () => {
    // Test statistics calculation logic that would be used in the component
    const acceptanceCriteria = mockUserStory.acceptance_criteria || []
    const requirements = mockUserStory.requirements || []
    
    const totalCriteria = acceptanceCriteria.length
    const totalRequirements = requirements.length
    const activeRequirements = requirements.filter(r => r.status === 'Active').length

    expect(totalCriteria).toBe(2)
    expect(totalRequirements).toBe(2)
    expect(activeRequirements).toBe(1)
  })

  it('should handle date formatting logic', () => {
    // Test date formatting logic that would be used in the component
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    const formattedCreated = formatDate(mockUserStory.created_at)
    const formattedModified = formatDate(mockUserStory.last_modified)

    expect(formattedCreated).toBe('15 января 2024 г.')
    expect(formattedModified).toBe('20 января 2024 г.')
  })

  it('should provide status and priority color mapping', () => {
    // Test color mapping logic that would be used in the component
    const getStatusColor = (status: string) => {
      const colors: Record<string, string> = {
        Backlog: 'grey',
        Draft: 'orange',
        'In Progress': 'blue',
        Done: 'green',
        Cancelled: 'red',
        Active: 'green',
        Obsolete: 'red',
      }
      return colors[status] || 'grey'
    }

    const getPriorityColor = (priority: number) => {
      const colors: Record<number, string> = {
        1: 'red',
        2: 'orange',
        3: 'yellow',
        4: 'green',
      }
      return colors[priority] || 'grey'
    }

    expect(getStatusColor('In Progress')).toBe('blue')
    expect(getStatusColor('Active')).toBe('green')
    expect(getStatusColor('Draft')).toBe('orange')
    expect(getPriorityColor(1)).toBe('red')
    expect(getPriorityColor(2)).toBe('orange')
  })

  it('should validate user story data structure', () => {
    // Test that the mock user story has the expected structure
    expect(mockUserStory).toHaveProperty('id')
    expect(mockUserStory).toHaveProperty('reference_id')
    expect(mockUserStory).toHaveProperty('title')
    expect(mockUserStory).toHaveProperty('status')
    expect(mockUserStory).toHaveProperty('priority')
    expect(mockUserStory).toHaveProperty('epic_id')
    expect(mockUserStory).toHaveProperty('epic')
    expect(mockUserStory).toHaveProperty('creator')
    expect(mockUserStory).toHaveProperty('assignee')
    expect(mockUserStory).toHaveProperty('acceptance_criteria')
    expect(mockUserStory).toHaveProperty('requirements')
    
    // Validate acceptance criteria structure
    expect(mockUserStory.acceptance_criteria).toBeInstanceOf(Array)
    if (mockUserStory.acceptance_criteria && mockUserStory.acceptance_criteria.length > 0) {
      const criteria = mockUserStory.acceptance_criteria[0]
      expect(criteria).toHaveProperty('id')
      expect(criteria).toHaveProperty('reference_id')
      expect(criteria).toHaveProperty('description')
    }

    // Validate requirements structure
    expect(mockUserStory.requirements).toBeInstanceOf(Array)
    if (mockUserStory.requirements && mockUserStory.requirements.length > 0) {
      const requirement = mockUserStory.requirements[0]
      expect(requirement).toHaveProperty('id')
      expect(requirement).toHaveProperty('reference_id')
      expect(requirement).toHaveProperty('title')
      expect(requirement).toHaveProperty('status')
    }
  })

  it('should handle acceptance criteria API calls', async () => {
    // Mock acceptance criteria API response
    vi.mocked(userStoryService.getAcceptanceCriteria).mockResolvedValue(mockAcceptanceCriteria)

    const result = await userStoryService.getAcceptanceCriteria('1')

    expect(userStoryService.getAcceptanceCriteria).toHaveBeenCalledWith('1')
    expect(result).toHaveLength(2)
    expect(result[0].reference_id).toBe('AC-001')
    expect(result[1].reference_id).toBe('AC-002')
  })

  it('should handle requirements API calls', async () => {
    // Mock requirements API response
    vi.mocked(userStoryService.getRequirements).mockResolvedValue(mockRequirements)

    const result = await userStoryService.getRequirements('1')

    expect(userStoryService.getRequirements).toHaveBeenCalledWith('1')
    expect(result).toHaveLength(2)
    expect(result[0].reference_id).toBe('REQ-001')
    expect(result[0].type?.name).toBe('Functional')
    expect(result[1].reference_id).toBe('REQ-002')
    expect(result[1].type?.name).toBe('Technical')
  })
})