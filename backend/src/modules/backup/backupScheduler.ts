import { backupService } from './backupService';
import path from 'path';
import { getDatabasePath } from '../../config/database';

// Criar backup automático ao iniciar o servidor (uma vez por dia)
export const createStartupBackup = () => {
  try {
    const dbPath = getDatabasePath();
    const basePath = path.dirname(dbPath);
    const backupsDir = path.join(basePath, 'backups');
    
    // Sempre limpar backups antigos ao iniciar (mesmo que não crie novo backup)
    backupService.cleanupOldBackups(backupsDir);
    
    // Verificar se já existe um backup de hoje
    if (backupService.shouldCreateDailyBackup(backupsDir)) {
      console.log('Criando backup automático de inicialização...');
      const backupFileName = backupService.createBackup();
      console.log(`Backup automático criado: ${backupFileName}`);
    } else {
      console.log('Backup de hoje já existe, pulando backup automático de inicialização.');
    }
  } catch (error) {
    console.error('Erro ao criar backup automático de inicialização:', error);
  }
};

