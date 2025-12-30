import { v4 as uuidv4 } from 'uuid';
import db from '../../config/database';
import { bookRepository } from './bookRepository';
import { AppError } from '../../shared/errors/AppError';
import { CreateBookDTO, UpdateBookDTO } from './bookDTO';
import { createLog } from '../logs/logService';

export const bookService = {
  findAll: (search?: string, authorId?: string, authorName?: string, categoryId?: string, page?: number, limit?: number) => {
    const result = bookRepository.findAll(search, authorId, authorName, categoryId, page, limit);
    const books = result.data.map((book) => {
      const author = db
        .prepare('SELECT name FROM authors WHERE id = ?')
        .get(book.author_id) as { name: string } | undefined;
      const category = db
        .prepare('SELECT name FROM categories WHERE id = ?')
        .get(book.category_id) as { name: string } | undefined;

      return {
        ...book,
        author_name: author?.name || '',
        category_name: category?.name || '',
      };
    });
    return { data: books, total: result.total };
  },

  findById: (id: string) => {
    const book = bookRepository.findByIdWithRelations(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }
    return book;
  },

  getLoanHistory: (id: string) => {
    return db
      .prepare(`
        SELECT 
          l.*,
          c.name as client_name,
          c.cpf as client_cpf
        FROM loans l
        LEFT JOIN clients c ON l.client_id = c.id
        WHERE l.book_id = ?
        ORDER BY l.loan_date DESC
      `)
      .all(id) as Array<{
      id: string;
      client_id: string;
      book_id: string;
      loan_date: string;
      due_date: string;
      return_date: string | null;
      condition_on_loan: string;
      condition_on_return: string | null;
      notes: string | null;
      client_name: string;
      client_cpf: string;
    }>;
  },

  create: (data: CreateBookDTO, loggedUserId: string) => {
    // Verify author exists
    const author = db
      .prepare('SELECT id FROM authors WHERE id = ? AND active = 1')
      .get(data.author_id);
    if (!author) {
      throw new AppError('Author not found', 404);
    }

    // Verify category exists
    const category = db
      .prepare('SELECT id FROM categories WHERE id = ? AND active = 1')
      .get(data.category_id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if barcode is unique (if provided)
    if (data.barcode) {
      const existingBarcode = db
        .prepare('SELECT id FROM books WHERE barcode = ? AND active = 1')
        .get(data.barcode);
      if (existingBarcode) {
        throw new AppError('Barcode already exists', 400);
      }
    }

    // Check if inventory_number is unique (if provided)
    if (data.inventory_number) {
      const existingInventory = db
        .prepare('SELECT id FROM books WHERE inventory_number = ? AND active = 1')
        .get(data.inventory_number);
      if (existingInventory) {
        throw new AppError('Inventory number already exists', 400);
      }
    }

    // Check if ISBN is unique (if provided)
    if (data.isbn) {
      const existingISBN = db
        .prepare('SELECT id FROM books WHERE isbn = ? AND active = 1')
        .get(data.isbn);
      if (existingISBN) {
        throw new AppError('ISBN already exists', 400);
      }
    }

    const book = {
      id: uuidv4(),
      title: data.title,
      author_id: data.author_id,
      category_id: data.category_id,
      photo: data.photo || null,
      origin: data.origin,
      acquisition_type: data.acquisition_type,
      total_quantity: data.total_quantity,
      available_quantity: data.total_quantity,
      barcode: data.barcode || null,
      inventory_number: data.inventory_number || null,
      edition: data.edition || null,
      cover_type: data.cover_type || null,
      isbn: data.isbn || null,
      active: 1,
    };

    bookRepository.create(book);
    createLog(loggedUserId, `CREATE_BOOK:${book.id}`);

    return book;
  },

  update: (id: string, data: UpdateBookDTO, loggedUserId: string) => {
    const book = bookRepository.findById(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    if (data.author_id) {
      const author = db
        .prepare('SELECT id FROM authors WHERE id = ? AND active = 1')
        .get(data.author_id);
      if (!author) {
        throw new AppError('Author not found', 404);
      }
    }

    if (data.category_id) {
      const category = db
        .prepare('SELECT id FROM categories WHERE id = ? AND active = 1')
        .get(data.category_id);
      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    // Check if barcode is unique (if provided and different from current)
    if (data.barcode !== undefined && data.barcode !== book.barcode) {
      if (data.barcode) {
        const existingBarcode = db
          .prepare('SELECT id FROM books WHERE barcode = ? AND active = 1 AND id != ?')
          .get(data.barcode, id);
        if (existingBarcode) {
          throw new AppError('Barcode already exists', 400);
        }
      }
    }

    // Check if inventory_number is unique (if provided and different from current)
    if (data.inventory_number !== undefined && data.inventory_number !== book.inventory_number) {
      if (data.inventory_number) {
        const existingInventory = db
          .prepare('SELECT id FROM books WHERE inventory_number = ? AND active = 1 AND id != ?')
          .get(data.inventory_number, id);
        if (existingInventory) {
          throw new AppError('Inventory number already exists', 400);
        }
      }
    }

    // Check if ISBN is unique (if provided and different from current)
    if (data.isbn !== undefined && data.isbn !== book.isbn) {
      if (data.isbn) {
        const existingISBN = db
          .prepare('SELECT id FROM books WHERE isbn = ? AND active = 1 AND id != ?')
          .get(data.isbn, id);
        if (existingISBN) {
          throw new AppError('ISBN already exists', 400);
        }
      }
    }

    bookRepository.update(id, data);
    createLog(loggedUserId, `UPDATE_BOOK:${id}`);

    const updatedBook = bookRepository.findByIdWithRelations(id);
    if (!updatedBook) {
      throw new AppError('Book not found', 404);
    }

    return updatedBook;
  },

  delete: (id: string, loggedUserId: string) => {
    const book = bookRepository.findById(id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Check if book has active loans
    const activeLoans = db
      .prepare('SELECT COUNT(*) as count FROM loans WHERE book_id = ? AND return_date IS NULL')
      .get(id) as { count: number };
    if (activeLoans.count > 0) {
      throw new AppError('Cannot delete book with active loans', 400);
    }

    bookRepository.deactivate(id);
    createLog(loggedUserId, `DELETE_BOOK:${id}`);
  },
};

