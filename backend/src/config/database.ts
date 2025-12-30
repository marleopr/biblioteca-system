import Database, { type Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { getBasePath } from '../shared/utils/paths';

// Obter o caminho do banco de forma segura
// Quando empacotado, sempre usar process.cwd() (diretório de trabalho atual)
function getDatabasePath(): string {
  // Detectar se está empacotado verificando se __dirname contém "snapshot"
  // ou se process.pkg existe (propriedade definida pelo pkg)
  const isPackaged = 
    typeof (process as any).pkg !== 'undefined' ||
    __dirname.includes('snapshot') ||
    process.execPath.includes('snapshot');
  
  let basePath: string;
  if (isPackaged) {
    // Quando empacotado, SEMPRE usar process.cwd()
    // O script .bat garante que estamos no diretório correto
    basePath = process.cwd();
  } else {
    // Em desenvolvimento, usar getBasePath()
    basePath = getBasePath();
  }
  
  const dbPath = path.join(basePath, 'database.sqlite');
  
  return dbPath;
}

const dbPath = getDatabasePath();
const dbDir = path.dirname(dbPath);

// Garantir que o diretório existe
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`Diretório criado: ${dbDir}`);
  } catch (error) {
    console.error(`Erro ao criar diretório ${dbDir}:`, error);
    throw error;
  }
}

// Verificar se o diretório tem permissão de escrita
try {
  const testFile = path.join(dbDir, '.write-test');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
} catch (error) {
  console.error(`Erro: Sem permissão de escrita no diretório ${dbDir}`);
  console.error(`   Verifique as permissões da pasta ou execute como administrador`);
  throw new Error(`Sem permissão de escrita em: ${dbDir}`);
}

// Verificar e limpar arquivos WAL/SHM se existirem (podem causar problemas)
const walPath = `${dbPath}-wal`;
const shmPath = `${dbPath}-shm`;
if (fs.existsSync(walPath)) {
  try {
    fs.unlinkSync(walPath);
  } catch (e) {
    // Ignorar
  }
}
if (fs.existsSync(shmPath)) {
  try {
    fs.unlinkSync(shmPath);
  } catch (e) {
    // Ignorar
  }
}

// Verificar se o arquivo existe e está corrompido
let db: DatabaseType | null = null;
try {
  db = new Database(dbPath);
  
  // Tentar executar uma query simples para verificar se está corrompido
  db.prepare('SELECT 1').get();
  
  // Habilitar foreign keys
  db.pragma('foreign_keys = ON');
  
  // Otimizações
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
} catch (error: any) {
  if (error.code === 'SQLITE_CORRUPT' || error.message?.includes('malformed')) {
    console.error('\n❌ ERRO: Banco de dados corrompido detectado!');
    console.error(`   Arquivo: ${dbPath}`);
    
    // Fechar conexão se estiver aberta
    try {
      if (db) {
        db.close();
      }
    } catch (e) {
      // Ignorar
    }
    
    // Tentar fazer backup do arquivo corrompido antes de remover
    if (fs.existsSync(dbPath)) {
      const corruptedBackup = `${dbPath}.corrupted-${Date.now()}`;
      try {
        fs.copyFileSync(dbPath, corruptedBackup);
        console.log(`\n📦 Arquivo corrompido movido para: ${path.basename(corruptedBackup)}`);
      } catch (e) {
        console.warn(`   Não foi possível fazer backup do arquivo corrompido`);
      }
      
      // Remover arquivo corrompido
      try {
        fs.unlinkSync(dbPath);
        console.log(`✅ Arquivo corrompido removido. O sistema criará um novo banco vazio.`);
        console.log(`\n💡 Para restaurar dados:`);
        console.log(`   1. Coloque um backup válido na pasta backups/`);
        console.log(`   2. Use a interface do sistema (Configurações > Backups) para restaurar`);
        console.log(`   3. Ou renomeie o backup para database.sqlite`);
        console.log(`\n🔄 Reiniciando...`);
        
        // Tentar criar novo banco
        db = new Database(dbPath);
        db.pragma('foreign_keys = ON');
        db.pragma('journal_mode = WAL');
        db.pragma('synchronous = NORMAL');
        console.log(`✅ Novo banco de dados criado com sucesso!`);
      } catch (e) {
        console.error(`\n❌ Erro ao remover arquivo corrompido: ${e}`);
        console.error(`   Por favor, remova manualmente o arquivo: ${dbPath}`);
        throw new Error('Database file is corrupted and could not be removed. Please remove it manually.');
      }
    } else {
      // Arquivo não existe, criar novo
      db = new Database(dbPath);
      db.pragma('foreign_keys = ON');
      db.pragma('journal_mode = WAL');
      db.pragma('synchronous = NORMAL');
      console.log(`✅ Novo banco de dados criado!`);
    }
  } else {
    throw error;
  }
}

// Garantir que db não seja null
if (!db) {
  throw new Error('Failed to initialize database');
}

// Type assertion para garantir que TypeScript saiba que db não é null
const database = db as DatabaseType;

export { database as db };

export default database;

