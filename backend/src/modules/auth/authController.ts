import { Request, Response, NextFunction } from 'express';
import { login as loginService } from './authService';
import { LoginDTO } from './authDTO';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data: LoginDTO = req.body;
    const result = await loginService(data);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

