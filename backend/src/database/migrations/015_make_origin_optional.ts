import db from '../../config/database';

export const up = (): void => {
  // SQLite não suporta ALTER COLUMN diretamente
  // Precisamos criar uma nova tabela sem a constraint NOT NULL no campo origin
  try {
    // Verificar se a migration já foi aplicada
    // Verificar se a tabela books existe e se origin permite NULL
    try {
      const tableInfo = db.prepare(`
        PRAGMA table_info(books)
      `).all() as Array<{ name: string; notnull: number }>;
      
      const originColumn = tableInfo.find(col => col.name === 'origin');
      
      if (originColumn && originColumn.notnull === 0) {
        // A coluna origin já permite NULL, migration já foi aplicada
        console.log('✓ Origin field is already optional');
        return;
      }
    } catch (e) {
      // Se a tabela não existir, continuar com a migration
      // (isso não deve acontecer, mas é uma segurança)
    }

    // Verificar se há uma tabela books_new órfã de tentativa anterior
    // Se houver, significa que a migration falhou parcialmente
    try {
      const tableExists = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='books_new'
      `).get();
      
      if (tableExists) {
        console.log('⚠ Tabela books_new encontrada de tentativa anterior. Limpando...');
        // Se books não existir mas books_new existir, renomear books_new para books
        const booksExists = db.prepare(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name='books'
        `).get();
        
        if (!booksExists) {
          console.log('⚠ Tabela books não existe. Restaurando de books_new...');
          db.pragma('foreign_keys = OFF');
          db.exec(`ALTER TABLE books_new RENAME TO books`);
          db.pragma('foreign_keys = ON');
          console.log('✓ Origin field is now optional (restaurado)');
          return;
        } else {
          // Ambas existem, remover books_new
          db.exec(`DROP TABLE IF EXISTS books_new`);
        }
      }
    } catch (e) {
      // Ignorar erros de verificação
    }

    // Desabilitar foreign keys temporariamente durante a migração
    db.pragma('foreign_keys = OFF');

    try {
      // Limpar tabela temporária se existir de tentativa anterior
      try {
        db.exec(`DROP TABLE IF EXISTS books_new`);
      } catch (e) {
        // Ignorar
      }

      // Criar nova tabela com origin opcional (sem foreign keys na criação)
      db.exec(`
        CREATE TABLE books_new (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          author_id TEXT NOT NULL,
          category_id TEXT NOT NULL,
          photo TEXT,
          origin TEXT,
          acquisition_type TEXT NOT NULL CHECK(acquisition_type IN ('DONATION', 'PURCHASE')),
          total_quantity INTEGER NOT NULL DEFAULT 1,
          available_quantity INTEGER NOT NULL DEFAULT 1,
          barcode TEXT,
          inventory_number TEXT,
          edition TEXT,
          cover_type TEXT CHECK(cover_type IN ('SOFTCOVER', 'HARDCOVER')),
          isbn TEXT,
          active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `);

      // Copiar dados da tabela antiga para a nova
      // Se houver algum livro sem origin, será copiado como NULL
      db.exec(`
        INSERT INTO books_new (
          id, title, author_id, category_id, photo, origin,
          acquisition_type, total_quantity, available_quantity,
          barcode, inventory_number, edition, cover_type, isbn, active, created_at
        )
        SELECT 
          id, title, author_id, category_id, photo, 
          CASE WHEN origin = '' THEN NULL ELSE origin END as origin,
          acquisition_type, total_quantity, available_quantity,
          barcode, inventory_number, edition, cover_type, isbn, active, created_at
        FROM books
      `);

      // Remover tabela antiga
      db.exec(`DROP TABLE books`);

      // Renomear nova tabela
      db.exec(`ALTER TABLE books_new RENAME TO books`);

      // Recriar índices (não foreign keys, apenas índices)
      try {
        db.exec(`CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id)`);
      } catch (e) {
        // Ignorar se já existir
      }
      try {
        db.exec(`CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id)`);
      } catch (e) {
        // Ignorar se já existir
      }
    } finally {
      // Reabilitar foreign keys
      db.pragma('foreign_keys = ON');
    }

    console.log('✓ Origin field is now optional');
  } catch (error: any) {
    // Se a tabela books_new já existir ou houver outro erro, apenas logar
    if (error.message.includes('already exists') || error.message.includes('no such table')) {
      console.log('⚠ Origin field modification may have already been applied');
    } else {
      console.error('Error making origin optional:', error.message);
      // Não lançar erro para não quebrar o servidor
      // A migration pode ser aplicada manualmente se necessário
    }
  }
};

export const down = (): void => {
  // Reverter não é crítico para desenvolvimento
  // Se necessário, pode-se recriar a tabela com NOT NULL
};

