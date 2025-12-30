import db from '../../config/database';

export const up = (): void => {
  // Add photo column to clients table
  db.exec(`
    ALTER TABLE clients ADD COLUMN photo TEXT
  `);
};

export const down = (): void => {
  // SQLite doesn't support DROP COLUMN directly
  // In production, you'd need to recreate the table without the photo column
};

