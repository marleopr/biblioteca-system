import { Request, Response } from 'express';
import { login as loginService } from './authService';
import { LoginDTO } from './authDTO';

export const login = async (req: Request, res: Response): Promise<void> => {
  const data: LoginDTO = req.body;
  const result = await loginService(data);
  res.json(result);
};

