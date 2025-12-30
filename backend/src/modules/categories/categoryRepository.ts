import db from '../../config/database';
import { normalizeText } from '../../shared/utils/normalize';
import { Category } from '../../shared/types';

export const categoryRepository = {
  findAll: (search?: string, page?: number, limit?: number): { data: (Category & { book_count: number })[]; total: number } => {
    let whereClause = 'WHERE c.active = 1';
    const params: unknown[] = [];

    if (search) {
      const searchTerm = `%${normalizeText(search)}%`;
      whereClause += ' AND c.name_normalized LIKE ?';
      params.push(searchTerm);
    }

    // Get total count
    const totalResult = db
      .prepare(`SELECT COUNT(DISTINCT c.id) as total FROM categories c ${whereClause}`)
      .get(...params) as { total: number };
    const total = totalResult.total;

    // Get paginated data with book count
    let query = `
      SELECT 
        c.*,
        COUNT(b.id) as book_count
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id AND b.active = 1
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.name
    `;
    if (page !== undefined && limit !== undefined) {
      const offset = (page - 1) * limit;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const data = db.prepare(query).all(...params) as (Category & { book_count: number })[];
    return { data, total };
  },

  findById: (id: string): Category | undefined => {
    return db
      .prepare('SELECT * FROM categories WHERE id = ? AND active = 1')
      .get(id) as Category | undefined;
  },

  findByName: (name: string): Category | undefined => {
    const normalizedName = normalizeText(name);
    return db
      .prepare('SELECT * FROM categories WHERE name_normalized = ? AND active = 1')
      .get(normalizedName) as Category | undefined;
  },

  findByNameIncludingInactive: (name: string): Category | undefined => {
    const normalizedName = normalizeText(name);
    return db
      .prepare('SELECT * FROM categories WHERE name_normalized = ?')
      .get(normalizedName) as Category | undefined;
  },

  reactivate: (id: string, name: string): void => {
    db.prepare('UPDATE categories SET active = 1, name = ?, name_normalized = ? WHERE id = ?').run(
      name,
      normalizeText(name),
      id
    );
  },

  create: (category: Omit<Category, 'active'>): void => {
    const stmt = db.prepare('INSERT INTO categories (id, name, name_normalized, active) VALUES (?, ?, ?, ?)');
    stmt.run(category.id, category.name, normalizeText(category.name), 1);
  },

  update: (id: string, name: string): void => {
    db.prepare('UPDATE categories SET name = ?, name_normalized = ? WHERE id = ?').run(name, normalizeText(name), id);
  },

  deactivate: (id: string): void => {
    db.prepare('UPDATE categories SET active = 0 WHERE id = ?').run(id);
  },
};

