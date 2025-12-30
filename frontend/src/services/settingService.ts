import api from '../utils/api';
import { Setting } from '../types';

export const settingService = {
  find: async (): Promise<Setting> => {
    const response = await api.get<Setting>('/settings');
    return response.data;
  },

  update: async (data: { max_loans_per_client?: number; loan_duration_days?: number; library_name?: string; library_logo?: string | null; sidebar_color?: string }): Promise<Setting> => {
    const response = await api.put<Setting>('/settings', data);
    return response.data;
  },
};

