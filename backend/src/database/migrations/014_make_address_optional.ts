import db from '../../config/database';

export const up = (): void => {
  // SQLite não suporta ALTER COLUMN diretamente
  // Precisamos criar uma nova tabela sem a constraint NOT NULL no campo address
  try {
    // Criar nova tabela com address opcional
    db.exec(`
      CREATE TABLE IF NOT EXISTS clients_new (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        address TEXT,
        email TEXT,
        photo TEXT,
        street TEXT,
        number TEXT,
        neighborhood TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Copiar dados da tabela antiga para a nova
    db.exec(`
      INSERT INTO clients_new (
        id, name, cpf, phone, address, email, photo, street, number, 
        neighborhood, city, state, zip_code, active, created_at
      )
      SELECT 
        id, name, cpf, phone, address, email, photo, street, number,
        neighborhood, city, state, zip_code, active, created_at
      FROM clients
    `);

    // Remover tabela antiga
    db.exec(`DROP TABLE clients`);

    // Renomear nova tabela
    db.exec(`ALTER TABLE clients_new RENAME TO clients`);

    console.log('✓ Address field is now optional');
  } catch (error: any) {
    // Se a tabela clients_new já existir ou houver outro erro, apenas logar
    if (error.message.includes('already exists') || error.message.includes('no such table')) {
      console.log('⚠ Address field modification may have already been applied');
    } else {
      console.error('Error making address optional:', error.message);
      throw error;
    }
  }
};

export const down = (): void => {
  // Reverter não é crítico para desenvolvimento
  // Se necessário, pode-se recriar a tabela com NOT NULL
};

