import api from '../utils/api';
import { Author } from '../types';

import { PaginatedResponse } from './clientService';

export const authorService = {
  findAll: async (search?: string, page?: number, limit?: number): Promise<PaginatedResponse<Author>> => {
    const response = await api.get<PaginatedResponse<Author>>('/authors', { 
      params: { search, page, limit } 
    });
    return response.data;
  },

  findById: async (id: string): Promise<Author> => {
    const response = await api.get<Author>(`/authors/${id}`);
    return response.data;
  },

  create: async (data: Omit<Author, 'id' | 'active'>): Promise<Author> => {
    const response = await api.post<Author>('/authors', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Author>): Promise<Author> => {
    const response = await api.put<Author>(`/authors/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/authors/${id}`);
  },
};

