import db from '../../config/database';

export const up = () => {
  try {
    // Adiciona coluna library_logo na tabela settings
    db.exec(`
      ALTER TABLE settings ADD COLUMN library_logo TEXT;
    `);
  } catch (error: any) {
    // Ignora se a coluna já existe
    if (!error.message.includes('duplicate column')) {
      console.error('Error adding library_logo to settings:', error);
    }
  }
};

