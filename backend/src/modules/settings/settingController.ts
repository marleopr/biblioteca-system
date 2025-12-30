import { Response } from 'express';
import { AuthRequest } from '../../shared/middlewares/auth';
import { settingService } from './settingService';

export const settingController = {
  find: (_req: AuthRequest, res: Response): void => {
    const settings = settingService.find();
    res.json(settings);
  },

  update: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const settings = settingService.update(req.body, req.user.userId);
    res.json(settings);
  },
};

