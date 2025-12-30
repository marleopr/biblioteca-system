import db from '../../config/database';

export const up = () => {
  try {
    // Adiciona coluna sidebar_color na tabela settings
    db.exec(`
      ALTER TABLE settings ADD COLUMN sidebar_color TEXT DEFAULT 'gray.800';
    `);
    
    // Atualiza registros existentes para ter o valor padrão
    db.exec(`
      UPDATE settings SET sidebar_color = 'gray.800' WHERE sidebar_color IS NULL;
    `);
  } catch (error: any) {
    // Ignora se a coluna já existe
    if (!error.message.includes('duplicate column')) {
      console.error('Error adding sidebar_color to settings:', error);
    }
  }
};

