import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatar erros do Zod de forma mais legível
        const errorMessages = error.errors.map((err) => {
          const path = err.path.join('.');
          // Traduzir mensagens comuns
          if (err.message.includes('Invalid') && err.message.includes('uuid')) {
            return `Campo ${path} inválido`;
          }
          return err.message || `Erro no campo ${path}`;
        });
        throw new AppError(errorMessages.join('. '), 400);
      }
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw new AppError('Validation error', 400);
    }
  };
};

