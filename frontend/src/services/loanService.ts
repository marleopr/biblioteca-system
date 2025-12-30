import api from '../utils/api';
import { Loan } from '../types';

import { PaginatedResponse } from './clientService';

export const loanService = {
  findAll: async (status?: 'active' | 'returned' | 'overdue', page?: number, limit?: number, bookSearch?: string, clientSearch?: string): Promise<PaginatedResponse<Loan>> => {
    const response = await api.get<PaginatedResponse<Loan>>('/loans', { 
      params: { status, page, limit, bookSearch, clientSearch } 
    });
    return response.data;
  },

  findById: async (id: string): Promise<Loan> => {
    const response = await api.get<Loan>(`/loans/${id}`);
    return response.data;
  },

  findByClientId: async (clientId: string): Promise<Loan[]> => {
    const response = await api.get<Loan[]>(`/loans/client/${clientId}`);
    return response.data;
  },

  create: async (data: {
    client_id: string;
    book_id: string;
    condition_on_loan: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';
    notes?: string | null;
  }): Promise<Loan> => {
    const response = await api.post<Loan>('/loans', data);
    return response.data;
  },

  returnLoan: async (id: string, data: {
    condition_on_return: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';
    notes?: string | null;
  }): Promise<Loan> => {
    const response = await api.post<Loan>(`/loans/${id}/return`, data);
    return response.data;
  },

  getUpcomingDue: async (days?: number, limit?: number): Promise<Loan[]> => {
    const response = await api.get<Loan[]>('/loans/upcoming', { params: { days, limit } });
    return response.data;
  },

  getOverdue: async (): Promise<Loan[]> => {
    const response = await api.get<Loan[]>('/loans/overdue');
    return response.data;
  },

  getTopBooks: async (limit?: number): Promise<Array<{ id: string; title: string; loan_count: number }>> => {
    const response = await api.get<Array<{ id: string; title: string; loan_count: number }>>('/loans/top/books', { params: { limit } });
    return response.data;
  },

  getTopAuthors: async (limit?: number): Promise<Array<{ id: string; name: string; loan_count: number }>> => {
    const response = await api.get<Array<{ id: string; name: string; loan_count: number }>>('/loans/top/authors', { params: { limit } });
    return response.data;
  },

  getTopCategories: async (limit?: number): Promise<Array<{ id: string; name: string; loan_count: number }>> => {
    const response = await api.get<Array<{ id: string; name: string; loan_count: number }>>('/loans/top/categories', { params: { limit } });
    return response.data;
  },

  getTopClients: async (limit?: number): Promise<Array<{ id: string; name: string; loan_count: number }>> => {
    const response = await api.get<Array<{ id: string; name: string; loan_count: number }>>('/loans/top/clients', { params: { limit } });
    return response.data;
  },

  getTopBooksByAuthor: async (authorId: string, limit?: number): Promise<Array<{ id: string; title: string; loan_count: number }>> => {
    const response = await api.get<Array<{ id: string; title: string; loan_count: number }>>(`/loans/top/books/author/${authorId}`, { params: { limit } });
    return response.data;
  },

  getTopBooksByCategory: async (categoryId: string, limit?: number): Promise<Array<{ id: string; title: string; loan_count: number }>> => {
    const response = await api.get<Array<{ id: string; title: string; loan_count: number }>>(`/loans/top/books/category/${categoryId}`, { params: { limit } });
    return response.data;
  },
};

