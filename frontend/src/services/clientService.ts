import api from '../utils/api';
import { Client } from '../types';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const clientService = {
  findAll: async (search?: string, page?: number, limit?: number): Promise<PaginatedResponse<Client>> => {
    const response = await api.get<PaginatedResponse<Client>>('/clients', { 
      params: { search, page, limit } 
    });
    return response.data;
  },

  findById: async (id: string): Promise<Client> => {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },

  create: async (data: Omit<Client, 'id' | 'created_at' | 'active'>): Promise<Client> => {
    const response = await api.post<Client>('/clients', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Client>): Promise<Client> => {
    const response = await api.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};

