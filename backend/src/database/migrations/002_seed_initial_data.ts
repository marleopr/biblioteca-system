import db from '../../config/database';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const up = async (): Promise<void> => {
  // Create default admin user (password: admin123)
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminId = uuidv4();

  db.prepare(`
    INSERT OR IGNORE INTO users (id, name, cpf, phone, address, role, password_hash, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    adminId,
    'Administrador',
    '00000000000',
    '00000000000',
    'Biblioteca',
    'ADMIN',
    adminPasswordHash,
    1
  );

  // Create default settings (só cria se não existir nenhum)
  const existingSettings = db.prepare('SELECT id FROM settings LIMIT 1').get();
  if (!existingSettings) {
    db.prepare(`
      INSERT INTO settings (id, max_loans_per_client, loan_duration_days, library_name)
      VALUES (?, ?, ?, ?)
    `).run('079e2df8-0830-42a5-bf38-dd3f28cbed20', 5, 14, 'Biblioteca');
  }
};

export const down = (): void => {
  db.prepare('DELETE FROM users WHERE cpf = ?').run('00000000000');
  db.prepare('DELETE FROM settings').run();
};

