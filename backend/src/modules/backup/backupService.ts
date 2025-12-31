import fs from 'fs';
import path from 'path';
import { getDatabasePath } from '../../config/database';

export const backupService = {
  createBackup: (): string => {
    const dbPath = getDatabasePath();
    const basePath = path.dirname(dbPath);
    const backupsDir = path.join(basePath, 'backups');

    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    if (!fs.existsSync(dbPath)) {
      throw new Error('Database file not found');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.sqlite`;
    const backupPath = path.join(backupsDir, backupFileName);

    // Copiar arquivo diretamente (mais simples e confiável)
    fs.copyFileSync(dbPath, backupPath);

    // Limpar backups antigos (manter apenas os últimos 30 dias)
    cleanupOldBackups(backupsDir);

    return backupFileName;
  },

  shouldCreateDailyBackup: (backupsDir: string): boolean => {
    if (!fs.existsSync(backupsDir)) {
      return true;
    }

    const files = fs.readdirSync(backupsDir);
    const today = new Date().toDateString();
    
    // Verificar se já existe um backup de hoje
    const todayBackup = files.find((file) => {
      if (!file.startsWith('backup-') || !file.endsWith('.sqlite')) {
        return false;
      }
      const filePath = path.join(backupsDir, file);
      const stats = fs.statSync(filePath);
      return stats.birthtime.toDateString() === today;
    });

    return !todayBackup;
  },

  cleanupOldBackups: (backupsDir: string, daysToKeep: number = 30): void => {
    cleanupOldBackups(backupsDir, daysToKeep);
  },
};

const cleanupOldBackups = (backupsDir: string, daysToKeep: number = 30): void => {
  if (!fs.existsSync(backupsDir)) {
    return;
  }

  const files = fs.readdirSync(backupsDir);
  const now = Date.now();
  const daysInMs = daysToKeep * 24 * 60 * 60 * 1000;

  files.forEach((file) => {
    if (file.endsWith('.sqlite')) {
      const filePath = path.join(backupsDir, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.birthtime.getTime();

      if (fileAge > daysInMs) {
        fs.unlinkSync(filePath);
      }
    }
  });
};

