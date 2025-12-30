import db from '../../config/database';
import { User } from '../../shared/types';

export const userRepository = {
  findAll: (): User[] => {
    return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as User[];
  },

  findById: (id: string): User | undefined => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  },

  findByCpf: (cpf: string): User | undefined => {
    return db.prepare('SELECT * FROM users WHERE cpf = ?').get(cpf) as User | undefined;
  },

  create: (user: Omit<User, 'created_at'>): void => {
    const stmt = db.prepare(`
      INSERT INTO users (id, name, cpf, phone, address, email, photo, role, password_hash, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      user.id,
      user.name,
      user.cpf,
      user.phone,
      user.address,
      user.email || null,
      user.photo || null,
      user.role,
      user.password_hash,
      user.active
    );
  },

  update: (id: string, data: Partial<User>): void => {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.cpf !== undefined) {
      fields.push('cpf = ?');
      values.push(data.cpf);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }
    if (data.address !== undefined) {
      fields.push('address = ?');
      values.push(data.address);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.photo !== undefined) {
      fields.push('photo = ?');
      values.push(data.photo);
    }
    if (data.password_hash !== undefined) {
      fields.push('password_hash = ?');
      values.push(data.password_hash);
    }

    if (fields.length === 0) return;

    values.push(id);
    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
  },

  activate: (id: string): void => {
    db.prepare('UPDATE users SET active = 1 WHERE id = ?').run(id);
  },

  deactivate: (id: string): void => {
    db.prepare('UPDATE users SET active = 0 WHERE id = ?').run(id);
  },

  delete: (id: string): void => {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
  },
};

