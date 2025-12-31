import bcrypt from 'bcrypt';
import db from '../../config/database';
import { generateToken } from '../../config/auth';
import { AppError } from '../../shared/errors/AppError';
import { LoginDTO } from './authDTO';
import { createLog } from '../logs/logService';

export const login = async (data: LoginDTO) => {
  // Remove formatação do CPF (pontos e traços) antes de buscar no banco
  // O banco armazena CPF apenas com números
  const cleanCpf = data.cpf.replace(/\D/g, '');
  
  const user = db
    .prepare('SELECT * FROM users WHERE cpf = ? AND active = 1')
    .get(cleanCpf) as {
    id: string;
    name: string;
    cpf: string;
    role: 'ADMIN' | 'USER';
    password_hash: string;
    photo: string | null;
  } | undefined;

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const passwordMatch = await bcrypt.compare(data.password, user.password_hash);

  if (!passwordMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  createLog(user.id, 'LOGIN');

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      role: user.role,
      photo: user.photo || null,
    },
  };
};

