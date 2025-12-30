import { v4 as uuidv4 } from 'uuid';
import { clientRepository } from './clientRepository';
import { AppError } from '../../shared/errors/AppError';
import { CreateClientDTO, UpdateClientDTO } from './clientDTO';
import { createLog } from '../logs/logService';

export const clientService = {
  findAll: (search?: string, page?: number, limit?: number) => {
    return clientRepository.findAll(search, page, limit);
  },

  findById: (id: string) => {
    const client = clientRepository.findById(id);
    if (!client) {
      throw new AppError('Client not found', 404);
    }
    return client;
  },

  create: (data: CreateClientDTO, loggedUserId: string) => {
    const existingClientByCpf = clientRepository.findByCpf(data.cpf);
    if (existingClientByCpf) {
      throw new AppError('CPF já cadastrado', 400);
    }

    const existingClientByPhone = clientRepository.findByPhone(data.phone);
    if (existingClientByPhone) {
      throw new AppError('Telefone já cadastrado', 400);
    }

    const client = {
      id: uuidv4(),
      name: data.name,
      cpf: data.cpf,
      phone: data.phone,
      address: data.address || null,
      street: data.street || null,
      number: data.number || null,
      neighborhood: data.neighborhood || null,
      city: data.city || null,
      state: data.state || null,
      zip_code: data.zip_code || null,
      email: data.email || null,
      photo: data.photo || null,
      active: 1,
    };

    clientRepository.create(client);
    createLog(loggedUserId, `CREATE_CLIENT:${client.id}`);

    return client;
  },

  update: (id: string, data: UpdateClientDTO, loggedUserId: string) => {
    const client = clientRepository.findById(id);
    if (!client) {
      throw new AppError('Client not found', 404);
    }

    clientRepository.update(id, data);
    createLog(loggedUserId, `UPDATE_CLIENT:${id}`);

    const updatedClient = clientRepository.findById(id);
    if (!updatedClient) {
      throw new AppError('Client not found', 404);
    }

    return updatedClient;
  },

  delete: (id: string, loggedUserId: string) => {
    const client = clientRepository.findById(id);
    if (!client) {
      throw new AppError('Client not found', 404);
    }

    clientRepository.deactivate(id);
    createLog(loggedUserId, `DELETE_CLIENT:${id}`);
  },
};

