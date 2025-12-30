import { Response } from 'express';
import { AuthRequest } from '../../shared/middlewares/auth';
import { authorService } from './authorService';

export const authorController = {
  findAll: (req: AuthRequest, res: Response): void => {
    const search = req.query.search as string | undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = authorService.findAll(search, page, limit);
    
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
    const author = authorService.findById(id);
    res.json(author);
  },

  create: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const author = authorService.create(req.body, req.user.userId);
    res.status(201).json(author);
  },

  update: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const author = authorService.update(id, req.body, req.user.userId);
    res.json(author);
  },

  delete: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    authorService.delete(id, req.user.userId);
    res.status(204).send();
  },
};

