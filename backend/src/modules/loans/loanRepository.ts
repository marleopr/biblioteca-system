import db from '../../config/database';
import { Loan } from '../../shared/types';

export const loanRepository = {
  findAll: (status?: 'active' | 'returned' | 'overdue', page?: number, limit?: number, bookSearch?: string, clientSearch?: string): { data: Loan[]; total: number } => {
    let whereClause = 'WHERE 1=1';
    const params: unknown[] = [];

    if (status === 'active') {
      whereClause += ' AND return_date IS NULL';
    } else if (status === 'returned') {
      whereClause += ' AND return_date IS NOT NULL';
    } else if (status === 'overdue') {
      whereClause += ' AND return_date IS NULL AND due_date < date("now")';
    }

    // Search by book title
    if (bookSearch) {
      whereClause += ` AND book_id IN (SELECT id FROM books WHERE title LIKE ?)`;
      params.push(`%${bookSearch}%`);
    }

    // Search by client name
    if (clientSearch) {
      whereClause += ` AND client_id IN (SELECT id FROM clients WHERE name LIKE ? OR cpf LIKE ?)`;
      params.push(`%${clientSearch}%`, `%${clientSearch}%`);
    }

    // Get total count
    const totalResult = db
      .prepare(`SELECT COUNT(*) as total FROM loans ${whereClause}`)
      .get(...params) as { total: number };
    const total = totalResult.total;

    // Get paginated data
    let query = `SELECT * FROM loans ${whereClause} ORDER BY loan_date DESC`;
    if (page !== undefined && limit !== undefined) {
      const offset = (page - 1) * limit;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const data = db.prepare(query).all(...params) as Loan[];
    return { data, total };
  },

  findById: (id: string): Loan | undefined => {
    return db.prepare('SELECT * FROM loans WHERE id = ?').get(id) as Loan | undefined;
  },

  findByClientId: (clientId: string): Loan[] => {
    return db
      .prepare('SELECT * FROM loans WHERE client_id = ? ORDER BY loan_date DESC')
      .all(clientId) as Loan[];
  },

  findActiveByClientId: (clientId: string): Loan[] => {
    return db
      .prepare(
        'SELECT * FROM loans WHERE client_id = ? AND return_date IS NULL ORDER BY loan_date DESC'
      )
      .all(clientId) as Loan[];
  },

  create: (loan: Omit<Loan, 'return_date' | 'condition_on_return'>): void => {
    const stmt = db.prepare(`
      INSERT INTO loans (
        id, client_id, book_id, loan_date, due_date,
        condition_on_loan, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      loan.id,
      loan.client_id,
      loan.book_id,
      loan.loan_date,
      loan.due_date,
      loan.condition_on_loan,
      loan.notes || null
    );
  },

  returnLoan: (id: string, conditionOnReturn: string, notes: string | null): void => {
    db.prepare(
      "UPDATE loans SET return_date = datetime('now'), condition_on_return = ?, notes = ? WHERE id = ?"
    ).run(conditionOnReturn, notes || null, id);
  },
};

