// Base entity interfaces to avoid circular imports
// These are minimal interfaces that can be extended by the full entity types

export interface BaseUser {
  id: string;
  username: string;
  email: string;
  role: 'Administrator' | 'User' | 'Commenter';
}

export interface BaseEpic {
  id: string;
  reference_id: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
}

export interface BaseUserStory {
  id: string;
  reference_id: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
}

export interface BaseAcceptanceCriteria {
  id: string;
  reference_id: string;
  description: string;
}

export interface BaseRequirement {
  id: string;
  reference_id: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
}

export interface BaseComment {
  id: string;
  content: string;
  entity_type: string;
  entity_id: string;
  is_resolved: boolean;
}