import api from './axios';
import { ApiResponse, User, UserRole } from '../types';

interface AuthData {
  token: string;
  user: User;
}

export const authApi = {
  register: (name: string, email: string, password: string, role?: UserRole) =>
    api.post<ApiResponse<AuthData>>('/auth/register', { name, email, password, role }),
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthData>>('/auth/login', { email, password }),
  getMe: () => api.get<ApiResponse<User>>('/auth/me'),
};
