import { Response } from 'express';
import { AuthRequest } from '../../shared/middlewares/auth';
import { clientService } from './clientService';

export const clientController = {
  findAll: (req: AuthRequest, res: Response): void => {
    const search = req.query.search as string | undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = clientService.findAll(search, page, limit);
    
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
    const client = clientService.findById(id);
    res.json(client);
  },

  create: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    try {
      const client = clientService.create(req.body, req.user.userId);
      res.status(201).json(client);
    } catch (error) {
      console.error('Error creating client:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },

  update: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    try {
      const { id } = req.params;
      const client = clientService.update(id, req.body, req.user.userId);
      res.json(client);
    } catch (error) {
      console.error('Error updating client:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },

  delete: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    clientService.delete(id, req.user.userId);
    res.status(204).send();
  },
};

