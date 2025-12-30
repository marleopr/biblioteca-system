import api from '../utils/api';

export interface Backup {
  filename: string;
  size: number;
  created_at: string;
}

export const backupService = {
  create: async (): Promise<{ message: string; filename: string }> => {
    const response = await api.post<{ message: string; filename: string }>('/backup');
    return response.data;
  },

  list: async (): Promise<Backup[]> => {
    const response = await api.get<Backup[]>('/backup');
    return response.data;
  },

  restore: async (filename: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/backup/restore', { filename });
    return response.data;
  },

  delete: async (filename: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/backup/${filename}`);
    return response.data;
  },
};

