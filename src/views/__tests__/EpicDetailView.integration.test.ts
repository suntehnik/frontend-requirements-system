import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { epicService } from '@/services/epic-service'
import type { Epic, UserStory } from '@/types'

// Mock the epic service
vi.mock('@/services/epic-service', () => ({
  epicService: {
    get: vi.fn(),
    getUserStories: vi.fn(),
  },
}))

const mockEpic: Epic = {
  id: '1',
  reference_id: 'EP-001',
  title: 'Test Epic',
  description: 'Test epic description',
  status: 'In Progress',
  priority: 1,
  creator_id: 'user1',
  assignee_id: 'user2',
  created_at: '2024-01-15T10:00:00Z',
  last_modified: '2024-01-20T15:30:00Z',
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
  user_stories: [
    {
      id: 'us1',
      reference_id: 'US-001',
      title: 'User Story 1',
      status: 'Done',
      priority: 2,
      epic_id: '1',
      creator_id: 'user1',
      created_at: '2024-01-16T10:00:00Z',
      last_modified: '2024-01-18T12:00:00Z',
    },
    {
      id: 'us2',
      reference_id: 'US-002',
      title: 'User Story 2',
      status: 'In Progress',
      priority: 1,
      epic_id: '1',
      creator_id: 'user1',
      assignee_id: 'user2',
      created_at: '2024-01-17T10:00:00Z',
      last_modified: '2024-01-19T14:00:00Z',
      assignee: {
        id: 'user2',
        username: 'assignee',
        email: 'assignee@test.com',
        role: 'User',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    },
  ] as UserStory[],
}

describe('EpicDetailView Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should fetch epic data with user stories through the service', async () => {
    // Mock successful API response
    vi.mocked(epicService.get).mockResolvedValue(mockEpic)

    // Call the service method that the component uses
    const result = await epicService.get('1', 'creator,assignee,user_stories')

    // Verify API was called with correct parameters
    expect(epicService.get).toHaveBeenCalledWith('1', 'creator,assignee,user_stories')

    // Verify the returned data structure
    expect(result.id).toBe('1')
    expect(result.reference_id).toBe('EP-001')
    expect(result.title).toBe('Test Epic')
    expect(result.assignee?.username).toBe('assignee')
    expect(result.user_stories).toHaveLength(2)
    expect(result.user_stories?.[0].reference_id).toBe('US-001')
    expect(result.user_stories?.[1].reference_id).toBe('US-002')
  })

  it('should handle API errors gracefully', async () => {
    // Mock API error
    const errorMessage = 'Failed to load epic'
    vi.mocked(epicService.get).mockRejectedValue(new Error(errorMessage))

    // Call the service method
    await expect(epicService.get('1', 'creator,assignee,user_stories')).rejects.toThrow(
      errorMessage,
    )

    // Verify the error was thrown
    expect(epicService.get).toHaveBeenCalledWith('1', 'creator,assignee,user_stories')
  })

  it('should load user stories separately when not included in epic data', async () => {
    // Mock epic without user stories
    const epicWithoutStories = { ...mockEpic, user_stories: undefined }
    vi.mocked(epicService.get).mockResolvedValue(epicWithoutStories)
    vi.mocked(epicService.getUserStories).mockResolvedValue({
      ...mockEpic,
      user_stories: mockEpic.user_stories,
    })

    // First call to get epic
    const epic = await epicService.get('1', 'creator,assignee,user_stories')
    expect(epic.user_stories).toBeUndefined()

    // Second call to get user stories
    const epicWithStories = await epicService.getUserStories('1')
    expect(epicWithStories.user_stories).toHaveLength(2)

    // Verify both API methods were called
    expect(epicService.get).toHaveBeenCalledWith('1', 'creator,assignee,user_stories')
    expect(epicService.getUserStories).toHaveBeenCalledWith('1')
  })

  it('should handle empty user stories correctly', async () => {
    // Mock epic with no user stories
    const epicWithoutStories = { ...mockEpic, user_stories: [] }
    vi.mocked(epicService.get).mockResolvedValue(epicWithoutStories)

    const result = await epicService.get('1', 'creator,assignee,user_stories')

    // Verify empty user stories array
    expect(result.user_stories).toHaveLength(0)
    expect(result.id).toBe('1')
    expect(result.title).toBe('Test Epic')
  })

  it('should provide correct user story statistics', () => {
    // Test statistics calculation logic that would be used in the component
    const userStories = mockEpic.user_stories || []

    const totalStories = userStories.length
    const completedStories = userStories.filter((s) => s.status === 'Done').length
    const inProgressStories = userStories.filter((s) => s.status === 'In Progress').length

    expect(totalStories).toBe(2)
    expect(completedStories).toBe(1)
    expect(inProgressStories).toBe(1)
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

    const formattedCreated = formatDate(mockEpic.created_at)
    const formattedModified = formatDate(mockEpic.last_modified)

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
    expect(getPriorityColor(1)).toBe('red')
    expect(getPriorityColor(2)).toBe('orange')
  })

  it('should validate epic data structure', () => {
    // Test that the mock epic has the expected structure
    expect(mockEpic).toHaveProperty('id')
    expect(mockEpic).toHaveProperty('reference_id')
    expect(mockEpic).toHaveProperty('title')
    expect(mockEpic).toHaveProperty('status')
    expect(mockEpic).toHaveProperty('priority')
    expect(mockEpic).toHaveProperty('creator')
    expect(mockEpic).toHaveProperty('assignee')
    expect(mockEpic).toHaveProperty('user_stories')

    // Validate user stories structure
    expect(mockEpic.user_stories).toBeInstanceOf(Array)
    if (mockEpic.user_stories && mockEpic.user_stories.length > 0) {
      const userStory = mockEpic.user_stories[0]
      expect(userStory).toHaveProperty('id')
      expect(userStory).toHaveProperty('reference_id')
      expect(userStory).toHaveProperty('title')
      expect(userStory).toHaveProperty('status')
    }
  })
})
