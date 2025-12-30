import api from '../utils/api';
import { Category } from '../types';

import { PaginatedResponse } from './clientService';

export const categoryService = {
  findAll: async (search?: string, page?: number, limit?: number): Promise<PaginatedResponse<Category>> => {
    const response = await api.get<PaginatedResponse<Category>>('/categories', { 
      params: { search, page, limit } 
    });
    return response.data;
  },

  findById: async (id: string): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: Omit<Category, 'id' | 'active'>): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

