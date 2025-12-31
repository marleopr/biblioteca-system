import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { userRepository } from './userRepository';
import { AppError } from '../../shared/errors/AppError';
import { CreateUserDTO, UpdateUserDTO, UpdateProfileDTO } from './userDTO';
import { createLog } from '../logs/logService';
import db from '../../config/database';

export const userService = {
  findAll: () => {
    return userRepository.findAll();
  },

  findById: (id: string) => {
    const user = userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }
    return user;
  },

  create: async (data: CreateUserDTO, loggedUserId: string) => {
    const existingUser = userRepository.findByCpf(data.cpf);
    if (existingUser) {
      throw new AppError('CPF já cadastrado', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = {
      id: uuidv4(),
      name: data.name,
      cpf: data.cpf,
      phone: data.phone,
      address: data.address,
      email: data.email || null,
      photo: data.photo || null,
      role: data.role,
      password_hash: passwordHash,
      active: 1,
    };

    userRepository.create(user);
    createLog(loggedUserId, `CREATE_USER:${user.id}`);

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  update: async (id: string, data: UpdateUserDTO, loggedUserId: string) => {
    const user = userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const updateData: Partial<typeof user> = { ...data };

    if (data.password) {
      updateData.password_hash = await bcrypt.hash(data.password, 10);
    }

    userRepository.update(id, updateData);
    createLog(loggedUserId, `UPDATE_USER:${id}`);

    const updatedUser = userRepository.findById(id);
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }

    const { password_hash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },

  activate: (id: string, loggedUserId: string) => {
    const user = userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    userRepository.activate(id);
    createLog(loggedUserId, `ACTIVATE_USER:${id}`);
  },

  deactivate: (id: string, loggedUserId: string) => {
    const user = userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    userRepository.deactivate(id);
    createLog(loggedUserId, `DEACTIVATE_USER:${id}`);
  },

  delete: (id: string, loggedUserId: string) => {
    const user = userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Impedir que o usuário delete a própria conta
    if (id === loggedUserId) {
      throw new AppError('Você não pode deletar sua própria conta. Peça a outro administrador para fazer isso.', 400);
    }

    // Verificar se há logs relacionados
    const logsCount = db.prepare('SELECT COUNT(*) as count FROM logs WHERE user_id = ?').get(id) as { count: number };
    
    if (logsCount.count > 0) {
      // Deletar logs relacionados antes de deletar o usuário
      db.prepare('DELETE FROM logs WHERE user_id = ?').run(id);
    }

    // Criar log ANTES de deletar o usuário (para evitar erro de foreign key)
    createLog(loggedUserId, `DELETE_USER_PERMANENT:${id}`);
    
    userRepository.delete(id);
  },

  updateProfile: async (id: string, data: UpdateProfileDTO, userRole: string) => {
    const user = userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const updateData: Partial<typeof user> = { ...data };

    // Só permite alterar CPF se for ADMIN
    if (data.cpf) {
      if (userRole !== 'ADMIN') {
        throw new AppError('Apenas ADMIN pode alterar o CPF', 403);
      }
      
      // Verificar se o CPF já está em uso por outro usuário
      const existingUser = userRepository.findByCpf(data.cpf);
      if (existingUser && existingUser.id !== id) {
        throw new AppError('CPF já cadastrado', 400);
      }
      
      updateData.cpf = data.cpf;
    } else {
      // Remove CPF do updateData se não foi fornecido
      delete updateData.cpf;
    }

    if (data.password) {
      updateData.password_hash = await bcrypt.hash(data.password, 10);
    }

    userRepository.update(id, updateData);
    createLog(id, `UPDATE_PROFILE:${id}`);

    const updatedUser = userRepository.findById(id);
    if (!updatedUser) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const { password_hash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },
};

