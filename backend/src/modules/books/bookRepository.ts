import db from '../../config/database';
import { Book } from '../../shared/types';

export const bookRepository = {
  findAll: (search?: string, authorId?: string, authorName?: string, categoryId?: string, page?: number, limit?: number): { data: Book[]; total: number } => {
    let whereClause = 'WHERE b.active = 1';
    const params: unknown[] = [];
    let joinClause = '';

    if (search) {
      whereClause += ' AND (b.title LIKE ? OR b.barcode LIKE ? OR b.inventory_number LIKE ? OR b.isbn LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (authorId) {
      whereClause += ' AND b.author_id = ?';
      params.push(authorId);
    }

    if (authorName) {
      joinClause = 'LEFT JOIN authors a ON b.author_id = a.id';
      whereClause += ' AND a.name LIKE ?';
      const authorNameTerm = `%${authorName}%`;
      params.push(authorNameTerm);
    }

    if (categoryId) {
      whereClause += ' AND b.category_id = ?';
      params.push(categoryId);
    }

    // Get total count
    const totalResult = db
      .prepare(`SELECT COUNT(*) as total FROM books b ${joinClause} ${whereClause}`)
      .get(...params) as { total: number };
    const total = totalResult.total;

    // Get paginated data
    let query = `SELECT b.* FROM books b ${joinClause} ${whereClause} ORDER BY b.title`;
    if (page !== undefined && limit !== undefined) {
      const offset = (page - 1) * limit;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const data = db.prepare(query).all(...params) as Book[];
    return { data, total };
  },

  findById: (id: string): Book | undefined => {
    return db
      .prepare('SELECT * FROM books WHERE id = ? AND active = 1')
      .get(id) as Book | undefined;
  },

  findByIdWithRelations: (id: string) => {
    return db
      .prepare(`
        SELECT 
          b.*,
          a.name as author_name,
          c.name as category_name
        FROM books b
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.id = ? AND b.active = 1
      `)
      .get(id) as (Book & { author_name: string; category_name: string }) | undefined;
  },

  create: (book: Omit<Book, 'created_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO books (
        id, title, author_id, category_id, photo, origin,
        acquisition_type, total_quantity, available_quantity, 
        barcode, inventory_number, edition, cover_type, isbn, active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      book.id,
      book.title,
      book.author_id,
      book.category_id,
      book.photo || null,
      book.origin,
      book.acquisition_type,
      book.total_quantity,
      book.available_quantity,
      book.barcode || null,
      book.inventory_number || null,
      book.edition || null,
      book.cover_type || null,
      book.isbn || null,
      book.active
    );
  },

  update: (id: string, data: Partial<Book>): void => {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.author_id !== undefined) {
      fields.push('author_id = ?');
      values.push(data.author_id);
    }
    if (data.category_id !== undefined) {
      fields.push('category_id = ?');
      values.push(data.category_id);
    }
    if (data.photo !== undefined) {
      fields.push('photo = ?');
      values.push(data.photo);
    }
    if (data.origin !== undefined) {
      fields.push('origin = ?');
      values.push(data.origin);
    }
    if (data.acquisition_type !== undefined) {
      fields.push('acquisition_type = ?');
      values.push(data.acquisition_type);
    }
    if (data.total_quantity !== undefined) {
      fields.push('total_quantity = ?');
      values.push(data.total_quantity);
      // Recalculate available_quantity
      const currentBook = bookRepository.findById(id);
      if (currentBook) {
        const loansCount = db
          .prepare(
            'SELECT COUNT(*) as count FROM loans WHERE book_id = ? AND return_date IS NULL'
          )
          .get(id) as { count: number };
        const newAvailable = data.total_quantity - loansCount.count;
        fields.push('available_quantity = ?');
        values.push(Math.max(0, newAvailable));
      }
    }
    if (data.barcode !== undefined) {
      fields.push('barcode = ?');
      values.push(data.barcode || null);
    }
    if (data.inventory_number !== undefined) {
      fields.push('inventory_number = ?');
      values.push(data.inventory_number || null);
    }
    if (data.edition !== undefined) {
      fields.push('edition = ?');
      values.push(data.edition || null);
    }
    if (data.cover_type !== undefined) {
      fields.push('cover_type = ?');
      values.push(data.cover_type || null);
    }
    if (data.isbn !== undefined) {
      fields.push('isbn = ?');
      values.push(data.isbn || null);
    }

    if (fields.length === 0) return;

    values.push(id);
    const stmt = db.prepare(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
  },

  deactivate: (id: string): void => {
    db.prepare('UPDATE books SET active = 0 WHERE id = ?').run(id);
  },

  decrementAvailable: (id: string): void => {
    db.prepare(
      'UPDATE books SET available_quantity = available_quantity - 1 WHERE id = ? AND available_quantity > 0'
    ).run(id);
  },

  incrementAvailable: (id: string): void => {
    db.prepare('UPDATE books SET available_quantity = available_quantity + 1 WHERE id = ?').run(
      id
    );
  },
};

