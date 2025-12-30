import api from '../utils/api';
import { LoginResponse } from '../types';

export const authService = {
  login: async (cpf: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { cpf, password });
    return response.data;
  },
};

