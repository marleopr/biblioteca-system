import db from '../../config/database';
import { Client } from '../../shared/types';

export const clientRepository = {
  findAll: (search?: string, page?: number, limit?: number): { data: Client[]; total: number } => {
    let whereClause = 'WHERE active = 1';
    const params: unknown[] = [];

    if (search) {
      const searchTerm = `%${search}%`;
      whereClause += ' AND (name LIKE ? OR cpf LIKE ?)';
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    const totalResult = db
      .prepare(`SELECT COUNT(*) as total FROM clients ${whereClause}`)
      .get(...params) as { total: number };
    const total = totalResult.total;

    // Get paginated data
    let query = `SELECT * FROM clients ${whereClause} ORDER BY name`;
    if (page !== undefined && limit !== undefined) {
      const offset = (page - 1) * limit;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const data = db.prepare(query).all(...params) as Client[];
    return { data, total };
  },

  findById: (id: string): Client | undefined => {
    return db
      .prepare('SELECT * FROM clients WHERE id = ? AND active = 1')
      .get(id) as Client | undefined;
  },

  findByCpf: (cpf: string): Client | undefined => {
    return db
      .prepare('SELECT * FROM clients WHERE cpf = ? AND active = 1')
      .get(cpf) as Client | undefined;
  },

  findByPhone: (phone: string): Client | undefined => {
    return db
      .prepare('SELECT * FROM clients WHERE phone = ? AND active = 1')
      .get(phone) as Client | undefined;
  },

  create: (client: Omit<Client, 'created_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO clients (
        id, name, cpf, phone, address, street, number, neighborhood, 
        city, state, zip_code, email, photo, active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      client.id,
      client.name,
      client.cpf,
      client.phone,
      client.address || null,
      client.street || null,
      client.number || null,
      client.neighborhood || null,
      client.city || null,
      client.state || null,
      client.zip_code || null,
      client.email || null,
      client.photo || null,
      client.active
    );
  },

  update: (id: string, data: Partial<Client>): void => {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }
    if (data.address !== undefined) {
      fields.push('address = ?');
      values.push(data.address);
    }
    if (data.street !== undefined) {
      fields.push('street = ?');
      values.push(data.street);
    }
    if (data.number !== undefined) {
      fields.push('number = ?');
      values.push(data.number);
    }
    if (data.neighborhood !== undefined) {
      fields.push('neighborhood = ?');
      values.push(data.neighborhood);
    }
    if (data.city !== undefined) {
      fields.push('city = ?');
      values.push(data.city);
    }
    if (data.state !== undefined) {
      fields.push('state = ?');
      values.push(data.state);
    }
    if (data.zip_code !== undefined) {
      fields.push('zip_code = ?');
      values.push(data.zip_code);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.photo !== undefined) {
      fields.push('photo = ?');
      values.push(data.photo);
    }

    if (fields.length === 0) return;

    values.push(id);
    const stmt = db.prepare(`UPDATE clients SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
  },

  deactivate: (id: string): void => {
    db.prepare('UPDATE clients SET active = 0 WHERE id = ?').run(id);
  },
};

