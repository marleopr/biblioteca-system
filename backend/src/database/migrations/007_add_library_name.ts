import db from '../../config/database';

export const up = () => {
  try {
    // Adiciona coluna library_name na tabela settings
    db.exec(`
      ALTER TABLE settings ADD COLUMN library_name TEXT DEFAULT 'Biblioteca';
    `);
    
    // Atualiza registros existentes para ter o valor padrão
    db.exec(`
      UPDATE settings SET library_name = 'Biblioteca' WHERE library_name IS NULL;
    `);
  } catch (error: any) {
    // Ignora se a coluna já existe
    if (!error.message.includes('duplicate column')) {
      console.error('Error adding library_name to settings:', error);
    }
  }
};

