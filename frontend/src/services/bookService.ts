import api from '../utils/api';
import { Book, Loan } from '../types';

import { PaginatedResponse } from './clientService';

export const bookService = {
  findAll: async (search?: string, authorId?: string, authorName?: string, categoryId?: string, page?: number, limit?: number): Promise<PaginatedResponse<Book>> => {
    const response = await api.get<PaginatedResponse<Book>>('/books', {
      params: { search, authorId, authorName, categoryId, page, limit },
    });
    return response.data;
  },

  findById: async (id: string): Promise<Book> => {
    const response = await api.get<Book>(`/books/${id}`);
    return response.data;
  },

  getLoanHistory: async (id: string): Promise<Loan[]> => {
    const response = await api.get<Loan[]>(`/books/${id}/history`);
    return response.data;
  },

  create: async (data: Omit<Book, 'id' | 'created_at' | 'active' | 'available_quantity'>): Promise<Book> => {
    const response = await api.post<Book>('/books', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Book>): Promise<Book> => {
    const response = await api.put<Book>(`/books/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/books/${id}`);
  },
};

