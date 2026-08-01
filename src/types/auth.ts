export type UserRole = 'super_admin' | 'admin' | 'user';

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  client_id: number | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface ProfileResponse {
  success: boolean;
  user: AuthUser;
}