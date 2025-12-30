import { Response } from 'express';
import { AuthRequest } from '../../shared/middlewares/auth';
import { categoryService } from './categoryService';

export const categoryController = {
  findAll: (req: AuthRequest, res: Response): void => {
    const search = req.query.search as string | undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = categoryService.findAll(search, page, limit);
    
    const totalPages = limit ? Math.ceil(result.total / limit) : 1;
    res.json({
      data: result.data,
      total: result.total,
      page: page || 1,
      limit: limit || result.total,
      totalPages,
    });
  },

  findById: (req: AuthRequest, res: Response): void => {
    const { id } = req.params;
    const category = categoryService.findById(id);
    res.json(category);
  },

  create: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const category = categoryService.create(req.body, req.user.userId);
    res.status(201).json(category);
  },

  update: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const category = categoryService.update(id, req.body, req.user.userId);
    res.json(category);
  },

  delete: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    categoryService.delete(id, req.user.userId);
    res.status(204).send();
  },
};

