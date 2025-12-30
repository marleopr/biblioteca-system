import { Response } from 'express';
import { AuthRequest } from '../../shared/middlewares/auth';
import { loanService } from './loanService';

export const loanController = {
  findAll: (req: AuthRequest, res: Response): void => {
    const status = req.query.status as 'active' | 'returned' | 'overdue' | undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const bookSearch = req.query.bookSearch as string | undefined;
    const clientSearch = req.query.clientSearch as string | undefined;
    const result = loanService.findAll(status, page, limit, bookSearch, clientSearch);
    
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
    const loan = loanService.findById(id);
    res.json(loan);
  },

  findByClientId: (req: AuthRequest, res: Response): void => {
    const { clientId } = req.params;
    const loans = loanService.findByClientId(clientId);
    res.json(loans);
  },

  create: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const loan = loanService.create(req.body, req.user.userId);
    res.status(201).json(loan);
  },

  returnLoan: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const loan = loanService.returnLoan(id, req.body, req.user.userId);
    res.json(loan);
  },

  getUpcomingDue: (req: AuthRequest, res: Response): void => {
    const days = req.query.days ? Number(req.query.days) : 30;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const loans = loanService.getUpcomingDue(days, limit);
    res.json(loans);
  },

  getOverdue: (_req: AuthRequest, res: Response): void => {
    const loans = loanService.getOverdue();
    res.json(loans);
  },

  getTopBooks: (req: AuthRequest, res: Response): void => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const topBooks = loanService.getTopBooks(limit);
    res.json(topBooks);
  },

  getTopAuthors: (req: AuthRequest, res: Response): void => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const topAuthors = loanService.getTopAuthors(limit);
    res.json(topAuthors);
  },

  getTopCategories: (req: AuthRequest, res: Response): void => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const topCategories = loanService.getTopCategories(limit);
    res.json(topCategories);
  },

  getTopClients: (req: AuthRequest, res: Response): void => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const topClients = loanService.getTopClients(limit);
    res.json(topClients);
  },

  getTopBooksByAuthor: (req: AuthRequest, res: Response): void => {
    const { authorId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const topBooks = loanService.getTopBooksByAuthor(authorId, limit);
    res.json(topBooks);
  },

  getTopBooksByCategory: (req: AuthRequest, res: Response): void => {
    const { categoryId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const topBooks = loanService.getTopBooksByCategory(categoryId, limit);
    res.json(topBooks);
  },
};

