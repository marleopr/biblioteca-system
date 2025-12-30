import db from '../../config/database';
import { Setting } from '../../shared/types';

export const settingRepository = {
  find: (): Setting | undefined => {
    return db.prepare('SELECT * FROM settings LIMIT 1').get() as Setting | undefined;
  },

  update: (data: Partial<Setting>): void => {
    // Primeiro, verifica se existe algum registro
    const existing = db.prepare('SELECT id FROM settings LIMIT 1').get() as { id: string } | undefined;
    
    if (!existing) {
      // Se não existe, cria um registro padrão
      const stmt = db.prepare(`
        INSERT INTO settings (id, max_loans_per_client, loan_duration_days, library_name, library_logo, sidebar_color)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        '079e2df8-0830-42a5-bf38-dd3f28cbed20',
        data.max_loans_per_client ?? 5,
        data.loan_duration_days ?? 14,
        data.library_name ?? 'Biblioteca',
        data.library_logo ?? null,
        data.sidebar_color ?? 'gray.800'
      );
      return;
    }

    // Sempre atualiza o primeiro registro (o mais antigo)
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.max_loans_per_client !== undefined) {
      fields.push('max_loans_per_client = ?');
      values.push(data.max_loans_per_client);
    }
    if (data.loan_duration_days !== undefined) {
      fields.push('loan_duration_days = ?');
      values.push(data.loan_duration_days);
    }
    if (data.library_name !== undefined) {
      fields.push('library_name = ?');
      values.push(data.library_name);
    }
    if (data.library_logo !== undefined) {
      fields.push('library_logo = ?');
      values.push(data.library_logo);
    }
    if (data.sidebar_color !== undefined) {
      fields.push('sidebar_color = ?');
      values.push(data.sidebar_color);
    }

    if (fields.length === 0) return;

    // Atualiza sempre o primeiro registro encontrado
    const stmt = db.prepare(`UPDATE settings SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values, existing.id);
  },
};

