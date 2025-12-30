import { Response } from 'express';
import { AuthRequest } from '../../shared/middlewares/auth';
import { userService } from './userService';

export const userController = {
  findAll: (_req: AuthRequest, res: Response): void => {
    const users = userService.findAll();
    res.json(users.map(({ password_hash, ...user }) => user));
  },

  findById: (req: AuthRequest, res: Response): void => {
    const { id } = req.params;
    const user = userService.findById(id);
    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  },

  create: async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await userService.create(req.body, req.user.userId);
    res.status(201).json(user);
  },

  update: async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const user = await userService.update(id, req.body, req.user.userId);
    res.json(user);
  },

  activate: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    userService.activate(id, req.user.userId);
    res.status(204).send();
  },

  deactivate: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    userService.deactivate(id, req.user.userId);
    res.status(204).send();
  },

  delete: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    userService.delete(id, req.user.userId);
    res.status(204).send();
  },

  getProfile: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = userService.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  },

  updateProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await userService.updateProfile(req.user.userId, req.body, req.user.role);
    res.json(user);
  },
};

