import { Response } from 'express';
import { AuthRequest } from '../../shared/middlewares/auth';
import { bookService } from './bookService';

export const bookController = {
  findAll: (req: AuthRequest, res: Response): void => {
    const search = req.query.search as string | undefined;
    const authorId = req.query.authorId as string | undefined;
    const authorName = req.query.authorName as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = bookService.findAll(search, authorId, authorName, categoryId, page, limit);
    
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
    const book = bookService.findById(id);
    res.json(book);
  },

  getLoanHistory: (req: AuthRequest, res: Response): void => {
    const { id } = req.params;
    const history = bookService.getLoanHistory(id);
    res.json(history);
  },

  create: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const book = bookService.create(req.body, req.user.userId);
    res.status(201).json(book);
  },

  update: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const book = bookService.update(id, req.body, req.user.userId);
    res.json(book);
  },

  delete: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    bookService.delete(id, req.user.userId);
    res.status(204).send();
  },
};

