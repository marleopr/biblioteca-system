import { v4 as uuidv4 } from 'uuid';
import { authorRepository } from './authorRepository';
import { AppError } from '../../shared/errors/AppError';
import { CreateAuthorDTO, UpdateAuthorDTO } from './authorDTO';
import { createLog } from '../logs/logService';

export const authorService = {
  findAll: (search?: string, page?: number, limit?: number) => {
    return authorRepository.findAll(search, page, limit);
  },

  findById: (id: string) => {
    const author = authorRepository.findById(id);
    if (!author) {
      throw new AppError('Author not found', 404);
    }
    return author;
  },

  create: (data: CreateAuthorDTO, loggedUserId: string) => {
    // Verifica se existe um autor ativo com o mesmo nome
    const existingActiveAuthor = authorRepository.findByName(data.name);
    if (existingActiveAuthor) {
      throw new AppError('Author already exists', 400);
    }

    // Verifica se existe um autor inativo com o mesmo nome
    const existingInactiveAuthor = authorRepository.findByNameIncludingInactive(data.name);
    if (existingInactiveAuthor) {
      // Reativa o autor existente ao invés de criar um novo
      authorRepository.reactivate(existingInactiveAuthor.id, data.name);
      createLog(loggedUserId, `REACTIVATE_AUTHOR:${existingInactiveAuthor.id}`);
      
      const reactivatedAuthor = authorRepository.findById(existingInactiveAuthor.id);
      if (!reactivatedAuthor) {
        throw new AppError('Author not found', 404);
      }
      return reactivatedAuthor;
    }

    // Cria um novo autor se não existir nenhum (ativo ou inativo)
    const author = {
      id: uuidv4(),
      name: data.name,
    };

    authorRepository.create(author);
    createLog(loggedUserId, `CREATE_AUTHOR:${author.id}`);

    return author;
  },

  update: (id: string, data: UpdateAuthorDTO, loggedUserId: string) => {
    const author = authorRepository.findById(id);
    if (!author) {
      throw new AppError('Author not found', 404);
    }

    const existingAuthor = authorRepository.findByName(data.name);
    if (existingAuthor && existingAuthor.id !== id) {
      throw new AppError('Author name already exists', 400);
    }

    authorRepository.update(id, data.name);
    createLog(loggedUserId, `UPDATE_AUTHOR:${id}`);

    const updatedAuthor = authorRepository.findById(id);
    if (!updatedAuthor) {
      throw new AppError('Author not found', 404);
    }

    return updatedAuthor;
  },

  delete: (id: string, loggedUserId: string) => {
    const author = authorRepository.findById(id);
    if (!author) {
      throw new AppError('Author not found', 404);
    }

    // Check if author is used in books
    const db = require('../../config/database').default;
    const books = db
      .prepare('SELECT id, title FROM books WHERE author_id = ? AND active = 1')
      .all(id) as Array<{ id: string; title: string }>;
    if (books.length > 0) {
      throw new AppError('Cannot delete author with associated books', 400, { books });
    }

    authorRepository.deactivate(id);
    createLog(loggedUserId, `DELETE_AUTHOR:${id}`);
  },
};

