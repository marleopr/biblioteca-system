import { v4 as uuidv4 } from 'uuid';
import { categoryRepository } from './categoryRepository';
import { AppError } from '../../shared/errors/AppError';
import { CreateCategoryDTO, UpdateCategoryDTO } from './categoryDTO';
import { createLog } from '../logs/logService';

export const categoryService = {
  findAll: (search?: string, page?: number, limit?: number) => {
    return categoryRepository.findAll(search, page, limit);
  },

  findById: (id: string) => {
    const category = categoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  },

  create: (data: CreateCategoryDTO, loggedUserId: string) => {
    // Verifica se existe uma categoria ativa com o mesmo nome
    const existingActiveCategory = categoryRepository.findByName(data.name);
    if (existingActiveCategory) {
      throw new AppError('Category already exists', 400);
    }

    // Verifica se existe uma categoria inativa com o mesmo nome
    const existingInactiveCategory = categoryRepository.findByNameIncludingInactive(data.name);
    if (existingInactiveCategory) {
      // Reativa a categoria existente ao invés de criar uma nova
      categoryRepository.reactivate(existingInactiveCategory.id, data.name);
      createLog(loggedUserId, `REACTIVATE_CATEGORY:${existingInactiveCategory.id}`);
      
      const reactivatedCategory = categoryRepository.findById(existingInactiveCategory.id);
      if (!reactivatedCategory) {
        throw new AppError('Category not found', 404);
      }
      return reactivatedCategory;
    }

    // Cria uma nova categoria se não existir nenhuma (ativa ou inativa)
    const category = {
      id: uuidv4(),
      name: data.name,
    };

    categoryRepository.create(category);
    createLog(loggedUserId, `CREATE_CATEGORY:${category.id}`);

    return category;
  },

  update: (id: string, data: UpdateCategoryDTO, loggedUserId: string) => {
    const category = categoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const existingCategory = categoryRepository.findByName(data.name);
    if (existingCategory && existingCategory.id !== id) {
      throw new AppError('Category name already exists', 400);
    }

    categoryRepository.update(id, data.name);
    createLog(loggedUserId, `UPDATE_CATEGORY:${id}`);

    const updatedCategory = categoryRepository.findById(id);
    if (!updatedCategory) {
      throw new AppError('Category not found', 404);
    }

    return updatedCategory;
  },

  delete: (id: string, loggedUserId: string) => {
    const category = categoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if category is used in books
    const db = require('../../config/database').default;
    const books = db
      .prepare('SELECT id, title FROM books WHERE category_id = ? AND active = 1')
      .all(id) as Array<{ id: string; title: string }>;
    if (books.length > 0) {
      throw new AppError('Cannot delete category with associated books', 400, { books });
    }

    categoryRepository.deactivate(id);
    createLog(loggedUserId, `DELETE_CATEGORY:${id}`);
  },
};

