import db from '../../config/database';

export const up = (): void => {
  // Add email column to users table
  db.exec(`
    ALTER TABLE users ADD COLUMN email TEXT
  `);

  // Add email column to clients table
  db.exec(`
    ALTER TABLE clients ADD COLUMN email TEXT
  `);
};

export const down = (): void => {
  // SQLite doesn't support DROP COLUMN directly, so we'd need to recreate the table
  // For simplicity, we'll just leave it as is in the down migration
  // In production, you'd need to recreate the tables without the email column
};

