import { settingRepository } from './settingRepository';
import { UpdateSettingsDTO } from './settingDTO';
import { createLog } from '../logs/logService';

export const settingService = {
  find: () => {
    return settingRepository.find();
  },

  update: (data: UpdateSettingsDTO, loggedUserId: string) => {
    settingRepository.update(data);
    createLog(loggedUserId, 'UPDATE_SETTINGS');
    return settingRepository.find();
  },
};

