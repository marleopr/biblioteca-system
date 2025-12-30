import { Router } from 'express';
import { login } from './authController';
import { validate } from '../../shared/middlewares/validate';
import { loginSchema } from './authDTO';

const router = Router();

router.post('/login', validate(loginSchema), login);

export default router;

