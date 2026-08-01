import { apiRequest } from './api';
import type { LoginResponse, ProfileResponse } from '../types/auth';

export const loginRequest = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  return apiRequest<LoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

export const getProfileRequest = async (): Promise<ProfileResponse> => {
  return apiRequest<ProfileResponse>('/profile');
};

export const logoutRequest = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};