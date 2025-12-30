import { v4 as uuidv4 } from 'uuid';
import db from '../../config/database';
import { loanRepository } from './loanRepository';
import { bookRepository } from '../books/bookRepository';
import { AppError } from '../../shared/errors/AppError';
import { CreateLoanDTO, ReturnLoanDTO } from './loanDTO';
import { createLog } from '../logs/logService';
import { Loan } from '../../shared/types';

export const loanService = {
  findAll: (status?: 'active' | 'returned' | 'overdue', page?: number, limit?: number, bookSearch?: string, clientSearch?: string) => {
    const result = loanRepository.findAll(status, page, limit, bookSearch, clientSearch);
    const loans = result.data.map((loan) => {
      const client = db
        .prepare('SELECT name, cpf FROM clients WHERE id = ?')
        .get(loan.client_id) as { name: string; cpf: string } | undefined;
      const book = db
        .prepare('SELECT title, photo FROM books WHERE id = ?')
        .get(loan.book_id) as { title: string; photo: string | null } | undefined;

      return {
        ...loan,
        client_name: client?.name || '',
        client_cpf: client?.cpf || '',
        book_title: book?.title || '',
        book_photo: book?.photo || null,
      };
    });
    return { data: loans, total: result.total };
  },

  findById: (id: string) => {
    const loan = loanRepository.findById(id);
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    const client = db
      .prepare('SELECT * FROM clients WHERE id = ?')
      .get(loan.client_id) as { name: string; cpf: string; phone: string; address: string } | undefined;
    const book = db
      .prepare('SELECT * FROM books WHERE id = ?')
      .get(loan.book_id) as { title: string; author_id: string; category_id: string } | undefined;

    return {
      ...loan,
      client: client,
      book: book,
    };
  },

  findByClientId: (clientId: string) => {
    return loanRepository.findByClientId(clientId);
  },

  create: (data: CreateLoanDTO, loggedUserId: string) => {
    // Verify client exists
    const client = db
      .prepare('SELECT id FROM clients WHERE id = ? AND active = 1')
      .get(data.client_id);
    if (!client) {
      throw new AppError('Client not found', 404);
    }

    // Verify book exists and is available
    const book = bookRepository.findById(data.book_id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    if (book.available_quantity <= 0) {
      throw new AppError('Book is not available', 400);
    }

    // Get settings
    const settings = db
      .prepare('SELECT * FROM settings LIMIT 1')
      .get() as { max_loans_per_client: number; loan_duration_days: number } | undefined;

    const maxLoans = settings?.max_loans_per_client || 5;
    const loanDuration = settings?.loan_duration_days || 14;

    // Check client loan limit
    const activeLoans = loanRepository.findActiveByClientId(data.client_id);
    if (activeLoans.length >= maxLoans) {
      throw new AppError(`Client has reached the maximum loan limit (${maxLoans})`, 400);
    }

    // Calculate due date
    const loanDate = new Date().toISOString();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDuration);

    const loan = {
      id: uuidv4(),
      client_id: data.client_id,
      book_id: data.book_id,
      loan_date: loanDate,
      due_date: dueDate.toISOString(),
      condition_on_loan: data.condition_on_loan,
      notes: data.notes || null,
    };

    loanRepository.create(loan);
    bookRepository.decrementAvailable(data.book_id);
    createLog(loggedUserId, `CREATE_LOAN:${loan.id}`);

    return loan;
  },

  returnLoan: (id: string, data: ReturnLoanDTO, loggedUserId: string) => {
    const loan = loanRepository.findById(id);
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    if (loan.return_date) {
      throw new AppError('Loan already returned', 400);
    }

    loanRepository.returnLoan(id, data.condition_on_return, data.notes || null);
    bookRepository.incrementAvailable(loan.book_id);
    createLog(loggedUserId, `RETURN_LOAN:${id}`);

    const returnedLoan = loanRepository.findById(id);
    if (!returnedLoan) {
      throw new AppError('Loan not found', 404);
    }

    return returnedLoan;
  },

  getUpcomingDue: (days: number = 30, limit: number = 10) => {
    return db
      .prepare(`
        SELECT 
          l.*,
          c.name as client_name,
          c.cpf as client_cpf,
          b.title as book_title
        FROM loans l
        LEFT JOIN clients c ON l.client_id = c.id
        LEFT JOIN books b ON l.book_id = b.id
        WHERE l.return_date IS NULL 
          AND l.due_date BETWEEN date('now') AND date('now', '+' || ? || ' days')
        ORDER BY l.due_date ASC
        LIMIT ?
      `)
      .all(days, limit) as Array<Loan & { client_name: string; client_cpf: string; book_title: string }>;
  },

  getTopBooks: (limit: number = 10) => {
    return db
      .prepare(`
        SELECT 
          b.id,
          b.title,
          COUNT(l.id) as loan_count
        FROM books b
        INNER JOIN loans l ON b.id = l.book_id
        WHERE b.active = 1
        GROUP BY b.id, b.title
        ORDER BY loan_count DESC
        LIMIT ?
      `)
      .all(limit) as Array<{ id: string; title: string; loan_count: number }>;
  },

  getTopAuthors: (limit: number = 10) => {
    return db
      .prepare(`
        SELECT 
          a.id,
          a.name,
          COUNT(l.id) as loan_count
        FROM authors a
        INNER JOIN books b ON a.id = b.author_id
        INNER JOIN loans l ON b.id = l.book_id
        WHERE a.active = 1
        GROUP BY a.id, a.name
        ORDER BY loan_count DESC
        LIMIT ?
      `)
      .all(limit) as Array<{ id: string; name: string; loan_count: number }>;
  },

  getTopCategories: (limit: number = 10) => {
    return db
      .prepare(`
        SELECT 
          c.id,
          c.name,
          COUNT(l.id) as loan_count
        FROM categories c
        INNER JOIN books b ON c.id = b.category_id
        INNER JOIN loans l ON b.id = l.book_id
        WHERE c.active = 1
        GROUP BY c.id, c.name
        ORDER BY loan_count DESC
        LIMIT ?
      `)
      .all(limit) as Array<{ id: string; name: string; loan_count: number }>;
  },

  getTopClients: (limit: number = 10) => {
    return db
      .prepare(`
        SELECT 
          c.id,
          c.name,
          COUNT(l.id) as loan_count
        FROM clients c
        INNER JOIN loans l ON c.id = l.client_id
        WHERE c.active = 1
        GROUP BY c.id, c.name
        ORDER BY loan_count DESC
        LIMIT ?
      `)
      .all(limit) as Array<{ id: string; name: string; loan_count: number }>;
  },

  getTopBooksByAuthor: (authorId: string, limit: number = 5) => {
    return db
      .prepare(`
        SELECT 
          b.id,
          b.title,
          COUNT(l.id) as loan_count
        FROM books b
        INNER JOIN loans l ON b.id = l.book_id
        WHERE b.author_id = ? AND b.active = 1
        GROUP BY b.id, b.title
        ORDER BY loan_count DESC
        LIMIT ?
      `)
      .all(authorId, limit) as Array<{ id: string; title: string; loan_count: number }>;
  },

  getTopBooksByCategory: (categoryId: string, limit: number = 5) => {
    return db
      .prepare(`
        SELECT 
          b.id,
          b.title,
          COUNT(l.id) as loan_count
        FROM books b
        INNER JOIN loans l ON b.id = l.book_id
        WHERE b.category_id = ? AND b.active = 1
        GROUP BY b.id, b.title
        ORDER BY loan_count DESC
        LIMIT ?
      `)
      .all(categoryId, limit) as Array<{ id: string; title: string; loan_count: number }>;
  },

  getOverdue: () => {
    return db
      .prepare(`
        SELECT 
          l.*,
          c.name as client_name,
          c.cpf as client_cpf,
          b.title as book_title
        FROM loans l
        LEFT JOIN clients c ON l.client_id = c.id
        LEFT JOIN books b ON l.book_id = b.id
        WHERE l.return_date IS NULL 
          AND l.due_date < date('now')
        ORDER BY l.due_date ASC
      `)
      .all() as Array<Loan & { client_name: string; client_cpf: string; book_title: string }>;
  },
};

