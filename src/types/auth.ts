// Authentication related types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expires_at: string;
  user: UserResponse;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string; // minimum 8 characters
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: 'Administrator' | 'User' | 'Commenter';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'Administrator' | 'User' | 'Commenter';