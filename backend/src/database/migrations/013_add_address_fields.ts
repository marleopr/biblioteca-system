import db from '../../config/database';

export const up = (): void => {
  // Adicionar novos campos de endereço
  try {
    db.exec(`ALTER TABLE clients ADD COLUMN street TEXT NULL`);
    console.log('✓ Added street column');
  } catch (error: any) {
    if (!error.message.includes('duplicate column name')) {
      throw error;
    }
  }

  try {
    db.exec(`ALTER TABLE clients ADD COLUMN number TEXT NULL`);
    console.log('✓ Added number column');
  } catch (error: any) {
    if (!error.message.includes('duplicate column name')) {
      throw error;
    }
  }

  try {
    db.exec(`ALTER TABLE clients ADD COLUMN neighborhood TEXT NULL`);
    console.log('✓ Added neighborhood column');
  } catch (error: any) {
    if (!error.message.includes('duplicate column name')) {
      throw error;
    }
  }

  try {
    db.exec(`ALTER TABLE clients ADD COLUMN city TEXT NULL`);
    console.log('✓ Added city column');
  } catch (error: any) {
    if (!error.message.includes('duplicate column name')) {
      throw error;
    }
  }

  try {
    db.exec(`ALTER TABLE clients ADD COLUMN state TEXT NULL`);
    console.log('✓ Added state column');
  } catch (error: any) {
    if (!error.message.includes('duplicate column name')) {
      throw error;
    }
  }

  try {
    db.exec(`ALTER TABLE clients ADD COLUMN zip_code TEXT NULL`);
    console.log('✓ Added zip_code column');
  } catch (error: any) {
    if (!error.message.includes('duplicate column name')) {
      throw error;
    }
  }

  // Tornar o campo address opcional (NULL)
  try {
    // SQLite não suporta ALTER COLUMN diretamente, então precisamos criar uma nova tabela
    // Mas como o campo já pode ser NULL em alguns casos, vamos apenas garantir que não há constraint NOT NULL
    // Na prática, vamos deixar o campo address como está por enquanto para não perder dados existentes
    console.log('✓ Address fields added (address field remains for backward compatibility)');
  } catch (error: any) {
    console.log('⚠ Could not modify address field');
  }
};

export const down = (): void => {
  // Note: SQLite doesn't support DROP COLUMN directly
  // This would require recreating the table, which is complex
  // For now, we'll leave this empty as it's not critical for development
};

