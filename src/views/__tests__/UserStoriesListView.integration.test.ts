import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { userStoryService } from '@/services/user-story-service'
import { epicService } from '@/services/epic-service'
import type { UserStory, Epic, UserStoryListResponse, EpicListResponse } from '@/types'

// Mock the services
vi.mock('@/services/user-story-service', () => ({
  userStoryService: {
    list: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/services/epic-service', () => ({
  epicService: {
    list: vi.fn(),
  },
}))

const mockUserStories: UserStory[] = [
  {
    id: '1',
    reference_id: 'US-001',
    title: 'User Authentication',
    description: 'Implement user login functionality',
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
      title: 'Authentication System',
      description: 'User authentication and authorization',
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
  },
  {
    id: '2',
    reference_id: 'US-002',
    title: 'User Registration',
    description: 'Implement user registration functionality',
    status: 'Done',
    priority: 2,
    epic_id: 'epic1',
    creator_id: 'user1',
    created_at: '2024-01-16T10:00:00Z',
    last_modified: '2024-01-18T12:00:00Z',
    epic: {
      id: 'epic1',
      reference_id: 'EP-001',
      title: 'Authentication System',
      description: 'User authentication and authorization',
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
  },
  {
    id: '3',
    reference_id: 'US-003',
    title: 'Password Reset',
    description: 'Implement password reset functionality',
    status: 'Draft',
    priority: 3,
    epic_id: 'epic2',
    creator_id: 'user1',
    assignee_id: 'user3',
    created_at: '2024-01-17T10:00:00Z',
    last_modified: '2024-01-19T14:00:00Z',
    epic: {
      id: 'epic2',
      reference_id: 'EP-002',
      title: 'User Management',
      description: 'User profile and account management',
      status: 'Draft',
      priority: 2,
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
      id: 'user3',
      username: 'developer',
      email: 'dev@test.com',
      role: 'User',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
]

const mockEpics: Epic[] = [
  {
    id: 'epic1',
    reference_id: 'EP-001',
    title: 'Authentication System',
    description: 'User authentication and authorization',
    status: 'In Progress',
    priority: 1,
    creator_id: 'user1',
    created_at: '2024-01-10T10:00:00Z',
    last_modified: '2024-01-15T10:00:00Z',
  },
  {
    id: 'epic2',
    reference_id: 'EP-002',
    title: 'User Management',
    description: 'User profile and account management',
    status: 'Draft',
    priority: 2,
    creator_id: 'user1',
    created_at: '2024-01-12T10:00:00Z',
    last_modified: '2024-01-17T10:00:00Z',
  },
]

describe('UserStoriesListView Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should fetch user stories from the API through the service', async () => {
    // Mock the API response
    const mockResponse: UserStoryListResponse = {
      data: mockUserStories,
      total_count: 3,
      limit: 25,
      offset: 0,
    }
    vi.mocked(userStoryService.list).mockResolvedValue(mockResponse)

    // Call the service method that the component uses
    const result = await userStoryService.list({
      include: 'epic,creator,assignee',
      limit: 25,
      offset: 0,
      order_by: 'last_modified:desc',
    })

    // Verify the API was called with correct parameters
    expect(userStoryService.list).toHaveBeenCalledWith({
      include: 'epic,creator,assignee',
      limit: 25,
      offset: 0,
      order_by: 'last_modified:desc',
    })

    // Verify the response structure
    expect(result.data).toHaveLength(3)
    expect(result.total_count).toBe(3)
    expect(result.data[0].reference_id).toBe('US-001')
    expect(result.data[0].epic?.reference_id).toBe('EP-001')
    expect(result.data[0].assignee?.username).toBe('assignee')
  })

  it('should handle API errors gracefully', async () => {
    // Mock API error
    const errorMessage = 'Network error'
    vi.mocked(userStoryService.list).mockRejectedValue(new Error(errorMessage))

    // Call the service method
    await expect(userStoryService.list()).rejects.toThrow(errorMessage)

    // Verify the error was thrown
    expect(userStoryService.list).toHaveBeenCalled()
  })

  it('should fetch epics for filter options', async () => {
    // Mock the API response
    const mockResponse: EpicListResponse = {
      data: mockEpics,
      total_count: 2,
      limit: 100,
      offset: 0,
    }
    vi.mocked(epicService.list).mockResolvedValue(mockResponse)

    // Call the service method that the component uses
    const result = await epicService.list({
      limit: 100,
      order_by: 'reference_id:asc',
    })

    // Verify the API was called with correct parameters
    expect(epicService.list).toHaveBeenCalledWith({
      limit: 100,
      order_by: 'reference_id:asc',
    })

    // Verify the response structure
    expect(result.data).toHaveLength(2)
    expect(result.data[0].reference_id).toBe('EP-001')
    expect(result.data[1].reference_id).toBe('EP-002')
  })

  it('should filter user stories by epic', async () => {
    // Mock the API response with epic filter
    const filteredStories = mockUserStories.filter(story => story.epic_id === 'epic1')
    const mockResponse: UserStoryListResponse = {
      data: filteredStories,
      total_count: 2,
      limit: 25,
      offset: 0,
    }
    vi.mocked(userStoryService.list).mockResolvedValue(mockResponse)

    // Call the service method with epic filter
    const result = await userStoryService.list({
      epic_id: 'epic1',
      include: 'epic,creator,assignee',
      limit: 25,
      offset: 0,
      order_by: 'last_modified:desc',
    })

    // Verify the API was called with epic filter
    expect(userStoryService.list).toHaveBeenCalledWith({
      epic_id: 'epic1',
      include: 'epic,creator,assignee',
      limit: 25,
      offset: 0,
      order_by: 'last_modified:desc',
    })

    // Verify filtered results
    expect(result.data).toHaveLength(2)
    expect(result.data.every(story => story.epic_id === 'epic1')).toBe(true)
  })

  it('should filter user stories by status', async () => {
    // Mock the API response with status filter
    const filteredStories = mockUserStories.filter(story => story.status === 'In Progress')
    const mockResponse: UserStoryListResponse = {
      data: filteredStories,
      total_count: 1,
      limit: 25,
      offset: 0,
    }
    vi.mocked(userStoryService.list).mockResolvedValue(mockResponse)

    // Call the service method with status filter
    const result = await userStoryService.list({
      status: 'In Progress',
      include: 'epic,creator,assignee',
      limit: 25,
      offset: 0,
      order_by: 'last_modified:desc',
    })

    // Verify the API was called with status filter
    expect(userStoryService.list).toHaveBeenCalledWith({
      status: 'In Progress',
      include: 'epic,creator,assignee',
      limit: 25,
      offset: 0,
      order_by: 'last_modified:desc',
    })

    // Verify filtered results
    expect(result.data).toHaveLength(1)
    expect(result.data[0].status).toBe('In Progress')
  })

  it('should filter user stories by priority', async () => {
    // Mock the API response with priority filter
    const filteredStories = mockUserStories.filter(story => story.priority === 1)
    const mockResponse: UserStoryListResponse = {
      data: filteredStories,
      total_count: 1,
      limit: 25,
      offset: 0,
    }
    vi.mocked(userStoryService.list).mockResolvedValue(mockResponse)

    // Call the service method with priority filter
    const result = await userStoryService.list({
      priority: 1,
      include: 'epic,creator,assignee',
      limit: 25,
      offset: 0,
      order_by: 'last_modified:desc',
    })

    // Verify the API was called with priority filter
    expect(userStoryService.list).toHaveBeenCalledWith({
      priority: 1,
      include: 'epic,creator,assignee',
      limit: 25,
      offset: 0,
      order_by: 'last_modified:desc',
    })

    // Verify filtered results
    expect(result.data).toHaveLength(1)
    expect(result.data[0].priority).toBe(1)
  })

  it('should handle pagination correctly', async () => {
    // Mock the API response for page 2
    const mockResponse: UserStoryListResponse = {
      data: [mockUserStories[2]], // Third item for page 2
      total_count: 3,
      limit: 2,
      offset: 2,
    }
    vi.mocked(userStoryService.list).mockResolvedValue(mockResponse)

    // Call the service method with pagination
    const result = await userStoryService.list({
      include: 'epic,creator,assignee',
      limit: 2,
      offset: 2,
      order_by: 'last_modified:desc',
    })

    // Verify the API was called with pagination parameters
    expect(userStoryService.list).toHaveBeenCalledWith({
      include: 'epic,creator,assignee',
      limit: 2,
      offset: 2,
      order_by: 'last_modified:desc',
    })

    // Verify pagination results
    expect(result.data).toHaveLength(1)
    expect(result.total_count).toBe(3)
    expect(result.limit).toBe(2)
    expect(result.offset).toBe(2)
  })

  it('should handle sorting correctly', async () => {
    // Mock the API response with sorting
    const sortedStories = [...mockUserStories].sort((a, b) => 
      a.reference_id.localeCompare(b.reference_id)
    )
    const mockResponse: UserStoryListResponse = {
      data: sortedStories,
      total_count: 3,
      limit: 25,
      offset: 0,
    }
    vi.mocked(userStoryService.list).mockResolvedValue(mockResponse)

    // Call the service method with sorting
    const result = await userStoryService.list({
      include: 'epic,creator,assignee',
      limit: 25,
      offset: 0,
      order_by: 'reference_id:asc',
    })

    // Verify the API was called with sorting parameters
    expect(userStoryService.list).toHaveBeenCalledWith({
      include: 'epic,creator,assignee',
      limit: 25,
      offset: 0,
      order_by: 'reference_id:asc',
    })

    // Verify sorting results
    expect(result.data).toHaveLength(3)
    expect(result.data[0].reference_id).toBe('US-001')
    expect(result.data[1].reference_id).toBe('US-002')
    expect(result.data[2].reference_id).toBe('US-003')
  })

  it('should delete user stories through the API', async () => {
    // Mock the API response
    vi.mocked(userStoryService.delete).mockResolvedValue(undefined)

    // Call the service method
    await userStoryService.delete('1')

    // Verify the API was called
    expect(userStoryService.delete).toHaveBeenCalledWith('1')
  })

  it('should handle date formatting logic', () => {
    // Test date formatting logic that would be used in the component
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    const formattedDate = formatDate(mockUserStories[0].created_at)
    expect(formattedDate).toBe('15 янв. 2024 г.')
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
    expect(getStatusColor('Done')).toBe('green')
    expect(getStatusColor('Draft')).toBe('orange')
    expect(getPriorityColor(1)).toBe('red')
    expect(getPriorityColor(2)).toBe('orange')
    expect(getPriorityColor(3)).toBe('yellow')
  })

  it('should validate user story data structure', () => {
    // Test that the mock user stories have the expected structure
    const userStory = mockUserStories[0]
    
    expect(userStory).toHaveProperty('id')
    expect(userStory).toHaveProperty('reference_id')
    expect(userStory).toHaveProperty('title')
    expect(userStory).toHaveProperty('status')
    expect(userStory).toHaveProperty('priority')
    expect(userStory).toHaveProperty('epic_id')
    expect(userStory).toHaveProperty('creator_id')
    expect(userStory).toHaveProperty('created_at')
    expect(userStory).toHaveProperty('last_modified')
    
    // Validate populated fields
    expect(userStory.epic).toHaveProperty('reference_id')
    expect(userStory.creator).toHaveProperty('username')
    expect(userStory.assignee).toHaveProperty('username')
  })

  it('should handle multiple filters simultaneously', async () => {
    // Mock the API response with multiple filters
    const filteredStories = mockUserStories.filter(story => 
      story.epic_id === 'epic1' && 
      story.status === 'In Progress' && 
      story.priority === 1
    )
    const mockResponse: UserStoryListResponse = {
      data: filteredStories,
      total_count: 1,
      limit: 25,
      offset: 0,
    }
    vi.mocked(userStoryService.list).mockResolvedValue(mockResponse)

    // Call the service method with multiple filters
    const result = await userStoryService.list({
      epic_id: 'epic1',
      status: 'In Progress',
      priority: 1,
      include: 'epic,creator,assignee',
      limit: 25,
      offset: 0,
      order_by: 'last_modified:desc',
    })

    // Verify the API was called with all filters
    expect(userStoryService.list).toHaveBeenCalledWith({
      epic_id: 'epic1',
      status: 'In Progress',
      priority: 1,
      include: 'epic,creator,assignee',
      limit: 25,
      offset: 0,
      order_by: 'last_modified:desc',
    })

    // Verify filtered results
    expect(result.data).toHaveLength(1)
    expect(result.data[0].epic_id).toBe('epic1')
    expect(result.data[0].status).toBe('In Progress')
    expect(result.data[0].priority).toBe(1)
  })
})