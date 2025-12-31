import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import routes from './routes';
import { errorHandler } from './shared/middlewares/errorHandler';
import { env } from './config/env';
import db from './config/database';
import { up as createTables } from './database/migrations/001_create_tables';
import { up as seedData } from './database/migrations/002_seed_initial_data';
import { up as addEmailFields } from './database/migrations/003_add_email_fields';
import { up as addClientPhoto } from './database/migrations/004_add_client_photo';
import { up as addNormalizedNames } from './database/migrations/005_add_normalized_names';
import { up as cleanupDuplicateSettings } from './database/migrations/006_cleanup_duplicate_settings';
import { up as addLibraryName } from './database/migrations/007_add_library_name';
import { up as addLibraryLogo } from './database/migrations/008_add_library_logo';
import { up as addSidebarColor } from './database/migrations/009_add_sidebar_color';
import { up as fixUniqueIndexes } from './database/migrations/010_fix_unique_indexes';
import { up as addBookFields } from './database/migrations/011_add_book_fields';
import { up as addAddressFields } from './database/migrations/013_add_address_fields';
import { up as makeAddressOptional } from './database/migrations/014_make_address_optional';
import { up as makeOriginOptional } from './database/migrations/015_make_origin_optional';
// import { up as seedTestData } from './database/migrations/012_seed_test_data';
import { createStartupBackup } from './modules/backup/backupScheduler';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database
try {
  createTables();
  try {
    addEmailFields();
  } catch (error) {
    // Ignore error if columns already exist
  }
  try {
    addClientPhoto();
  } catch (error) {
    // Ignore error if column already exists
  }
  try {
    addNormalizedNames();
  } catch (error) {
    // Ignore error if columns already exist
  }
  try {
    cleanupDuplicateSettings();
  } catch (error) {
    // Ignore error if migration fails
  }
  try {
    addLibraryName();
  } catch (error) {
    // Ignore error if column already exists
  }
  try {
    addLibraryLogo();
  } catch (error) {
    // Ignore error if column already exists
  }
  try {
    addSidebarColor();
  } catch (error) {
    // Ignore error if column already exists
  }
  try {
    fixUniqueIndexes();
  } catch (error) {
    // Ignore error if migration fails
  }
  try {
    addBookFields();
  } catch (error) {
    // Ignore error if columns already exist
  }
  try {
    addAddressFields();
  } catch (error) {
    // Ignore error if columns already exist
  }
  try {
    makeAddressOptional();
  } catch (error) {
    // Ignore error if migration fails
  }
  try {
    makeOriginOptional();
  } catch (error) {
    // Ignore error if migration fails
  }
  seedData().catch(console.error);
  // Seed test data (comentado por padrão - descomente para executar)
  // seedTestData().catch(console.error);
  console.log('Database initialized');
} catch (error) {
  console.error('Database initialization error:', error);
}

// API Routes
app.use('/api', routes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Servir arquivos estáticos do frontend
// Quando empacotado, o frontend estará na pasta frontend/dist relativa ao .exe
// Quando em desenvolvimento, não servimos estáticos (vite cuida disso)
const isPackaged = 
  typeof (process as any).pkg !== 'undefined' ||
  __dirname.includes('snapshot') ||
  process.execPath.includes('snapshot');
if (isPackaged) {
  // Quando empacotado, o frontend/dist estará na mesma pasta do .exe
  // pkg coloca os assets em process.cwd() ou relativo ao executável
  const possiblePaths = [
    path.join(process.cwd(), 'frontend', 'dist'), // Mesma pasta do .exe
    path.join(path.dirname(process.execPath), 'frontend', 'dist'), // Pasta do .exe
  ];
  
  let frontendDistPath: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath) && fs.existsSync(path.join(possiblePath, 'index.html'))) {
      frontendDistPath = possiblePath;
      break;
    }
  }
  
  if (frontendDistPath) {
    console.log(`Servindo frontend de: ${frontendDistPath}`);
    app.use(express.static(frontendDistPath));
    
    // Para todas as rotas que não são API, servir index.html (SPA routing)
    app.get('*', (_req, res) => {
      res.sendFile(path.join(frontendDistPath!, 'index.html'));
    });
  } else {
    console.warn('Frontend dist não encontrado. Servindo apenas API.');
    console.warn('Procurou em:', possiblePaths);
  }
}

// Error handler
app.use(errorHandler);

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, _promise) => {
  console.error('⚠️  Promise rejeitada não tratada:', reason);
  console.error('Stack trace:', reason instanceof Error ? reason.stack : 'N/A');
  // Não encerrar o servidor imediatamente - apenas logar o erro
  // O servidor continuará rodando para não interromper outras requisições
});

// Start server
const PORT = env.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  // Criar backup automático ao iniciar (uma vez por dia)
  try {
    createStartupBackup();
  } catch (error) {
    console.error('Erro ao criar backup inicial:', error);
  }
}).on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Erro: Porta ${PORT} já está em uso!`);
    console.error(`   Feche o aplicativo que está usando a porta ${PORT} ou`);
    console.error(`   Defina outra porta: set PORT=8080 && biblioteca-system.exe`);
  } else {
    console.error('❌ Erro ao iniciar servidor:', error);
  }
  process.exit(1);
});

// Função para fechar o banco corretamente
const closeDatabase = () => {
  try {
    console.log('\n🔄 Fechando banco de dados...');
    db.close();
    console.log('✅ Banco de dados fechado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao fechar banco de dados:', error);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

// Garantir fechamento do banco ao encerrar (Windows)
process.on('exit', () => {
  try {
    if (db && typeof db.close === 'function') {
      db.close();
    }
  } catch (error) {
    // Ignorar erros no exit
  }
});

