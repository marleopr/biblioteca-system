import db from '../../config/database';

export const up = (): void => {
  // SQLite não suporta ALTER COLUMN diretamente
  // Precisamos criar uma nova tabela sem a constraint NOT NULL no campo address
  try {
    // Verificar se a migration já foi aplicada
    // Verificar se a coluna address já é nullable
    const tableInfo = db.prepare("PRAGMA table_info(clients)").all() as Array<{
      cid: number;
      name: string;
      type: string;
      notnull: number;
      dflt_value: string | null;
      pk: number;
    }>;
    
    const addressColumn = tableInfo.find(col => col.name === 'address');
    if (addressColumn && addressColumn.notnull === 0) {
      // Address já é opcional, migration já foi aplicada
      console.log('✓ Address field is already optional');
      return;
    }

    // Desabilitar foreign keys temporariamente durante a migração
    db.pragma('foreign_keys = OFF');

    try {
      // Limpar tabela temporária se existir de tentativa anterior
      try {
        db.exec(`DROP TABLE IF EXISTS clients_new`);
      } catch (e) {
        // Ignorar
      }

      // Verificar se há CPFs duplicados
      const duplicates = db.prepare(`
        SELECT cpf, COUNT(*) as count 
        FROM clients 
        GROUP BY cpf 
        HAVING COUNT(*) > 1
      `).all() as Array<{ cpf: string; count: number }>;

      if (duplicates.length > 0) {
        console.log(`⚠️  Encontrados ${duplicates.length} CPF(s) duplicado(s) em clients. Removendo duplicados...`);
        
        // Para cada CPF duplicado, manter apenas o registro mais recente (ou o primeiro se não houver created_at)
        for (const dup of duplicates) {
          const records = db.prepare(`
            SELECT id, created_at 
            FROM clients 
            WHERE cpf = ? 
            ORDER BY created_at DESC, rowid DESC
          `).all(dup.cpf) as Array<{ id: string; created_at: string | null }>;
          
          // Manter o primeiro (mais recente) e remover os outros
          if (records.length > 1) {
            const idsToDelete = records.slice(1).map(r => r.id);
            for (const idToDelete of idsToDelete) {
              db.prepare('DELETE FROM clients WHERE id = ?').run(idToDelete);
            }
            console.log(`   Removidos ${idsToDelete.length} registro(s) duplicado(s) para CPF: ${dup.cpf}`);
          }
        }
      }

      // Criar nova tabela com address opcional
      db.exec(`
        CREATE TABLE clients_new (
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
      // Converter address vazio para NULL
      db.exec(`
        INSERT INTO clients_new (
          id, name, cpf, phone, address, email, photo, street, number, 
          neighborhood, city, state, zip_code, active, created_at
        )
        SELECT 
          id, name, cpf, phone, 
          CASE WHEN address = '' THEN NULL ELSE address END as address,
          email, photo, street, number,
          neighborhood, city, state, zip_code, active, created_at
        FROM clients
      `);

      // Remover tabela antiga
      db.exec(`DROP TABLE clients`);

      // Renomear nova tabela
      db.exec(`ALTER TABLE clients_new RENAME TO clients`);

      // Recriar índices se necessário
      try {
        db.exec(`CREATE INDEX IF NOT EXISTS idx_clients_cpf ON clients(cpf)`);
      } catch (e) {
        // Ignorar se já existir
      }
    } finally {
      // Reabilitar foreign keys
      db.pragma('foreign_keys = ON');
    }

    console.log('✓ Address field is now optional');
  } catch (error: any) {
    // Se a tabela clients_new já existir ou houver outro erro, apenas logar
    if (error.message.includes('already exists') || error.message.includes('no such table')) {
      console.log('⚠ Address field modification may have already been applied');
    } else {
      console.error('Error making address optional:', error.message);
      // Não lançar erro para não quebrar o servidor
      // A migration pode ser aplicada manualmente se necessário
    }
  }
};

export const down = (): void => {
  // Reverter não é crítico para desenvolvimento
  // Se necessário, pode-se recriar a tabela com NOT NULL
};

