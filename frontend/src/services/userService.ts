import api from '../utils/api';
import { User } from '../types';

export const userService = {
  findAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  findById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: Omit<User, 'id' | 'created_at' | 'active'> & { password: string }): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  update: async (id: string, data: Partial<User> & { password?: string }): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  activate: async (id: string): Promise<void> => {
    await api.post(`/users/${id}/activate`);
  },

  deactivate: async (id: string): Promise<void> => {
    await api.post(`/users/${id}/deactivate`);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User> & { password?: string }): Promise<User> => {
    const response = await api.put<User>('/users/me', data);
    return response.data;
  },
};

