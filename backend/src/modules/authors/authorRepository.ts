import db from '../../config/database';
import { normalizeText } from '../../shared/utils/normalize';
import { Author } from '../../shared/types';

export const authorRepository = {
  findAll: (search?: string, page?: number, limit?: number): { data: (Author & { book_count: number })[]; total: number } => {
    let whereClause = 'WHERE a.active = 1';
    const params: unknown[] = [];

    if (search) {
      const searchTerm = `%${normalizeText(search)}%`;
      whereClause += ' AND a.name_normalized LIKE ?';
      params.push(searchTerm);
    }

    // Get total count
    const totalResult = db
      .prepare(`SELECT COUNT(DISTINCT a.id) as total FROM authors a ${whereClause}`)
      .get(...params) as { total: number };
    const total = totalResult.total;

    // Get paginated data with book count
    let query = `
      SELECT 
        a.*,
        COUNT(b.id) as book_count
      FROM authors a
      LEFT JOIN books b ON a.id = b.author_id AND b.active = 1
      ${whereClause}
      GROUP BY a.id
      ORDER BY a.name
    `;
    if (page !== undefined && limit !== undefined) {
      const offset = (page - 1) * limit;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const data = db.prepare(query).all(...params) as (Author & { book_count: number })[];
    return { data, total };
  },

  findById: (id: string): Author | undefined => {
    return db
      .prepare('SELECT * FROM authors WHERE id = ? AND active = 1')
      .get(id) as Author | undefined;
  },

  findByName: (name: string): Author | undefined => {
    const normalizedName = normalizeText(name);
    return db
      .prepare('SELECT * FROM authors WHERE name_normalized = ? AND active = 1')
      .get(normalizedName) as Author | undefined;
  },

  findByNameIncludingInactive: (name: string): Author | undefined => {
    const normalizedName = normalizeText(name);
    return db
      .prepare('SELECT * FROM authors WHERE name_normalized = ?')
      .get(normalizedName) as Author | undefined;
  },

  reactivate: (id: string, name: string): void => {
    db.prepare('UPDATE authors SET active = 1, name = ?, name_normalized = ? WHERE id = ?').run(
      name,
      normalizeText(name),
      id
    );
  },

  create: (author: Omit<Author, 'active'>): void => {
    const stmt = db.prepare('INSERT INTO authors (id, name, name_normalized, active) VALUES (?, ?, ?, ?)');
    stmt.run(author.id, author.name, normalizeText(author.name), 1);
  },

  update: (id: string, name: string): void => {
    db.prepare('UPDATE authors SET name = ?, name_normalized = ? WHERE id = ?').run(name, normalizeText(name), id);
  },

  deactivate: (id: string): void => {
    db.prepare('UPDATE authors SET active = 0 WHERE id = ?').run(id);
  },
};

