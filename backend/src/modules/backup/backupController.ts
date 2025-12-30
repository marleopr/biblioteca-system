import { Response } from 'express';
import { AuthRequest } from '../../shared/middlewares/auth';
import fs from 'fs';
import path from 'path';
import { AppError } from '../../shared/errors/AppError';
import { createLog } from '../logs/logService';
import { getBasePath } from '../../shared/utils/paths';

export const backupController = {
  create: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const { backupService } = require('./backupService');
      const backupFileName = backupService.createBackup();
      createLog(req.user.userId, 'CREATE_BACKUP');
      res.json({
        message: 'Backup criado com sucesso',
        filename: backupFileName,
      });
    } catch (error: any) {
      console.error('Erro ao criar backup:', error);
      throw new AppError(error.message || 'Falha ao criar backup', 500);
    }
  },

  list: (_req: AuthRequest, res: Response): void => {
    try {
      const basePath = getBasePath();
      const backupsDir = path.join(basePath, 'backups');

      if (!fs.existsSync(backupsDir)) {
        res.json([]);
        return;
      }

      const files = fs.readdirSync(backupsDir);
      const backups = files
        .filter((file) => file.endsWith('.sqlite'))
        .map((file) => {
          const filePath = path.join(backupsDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            size: stats.size,
            created_at: stats.birthtime.toISOString(),
          };
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      res.json(backups);
    } catch (error) {
      throw new AppError('Failed to list backups', 500);
    }
  },

  restore: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const { filename } = req.body;
      if (!filename) {
        throw new AppError('Filename is required', 400);
      }

      const basePath = getBasePath();
      const backupsDir = path.join(basePath, 'backups');
      const backupPath = path.join(backupsDir, filename);
      const dbPath = path.join(basePath, 'database.sqlite');

      if (!fs.existsSync(backupPath)) {
        throw new AppError('Backup file not found', 404);
      }

      // Verificar se o arquivo de backup está acessível
      try {
        const stats = fs.statSync(backupPath);
        if (stats.size === 0) {
          throw new AppError('Backup file is empty', 400);
        }
      } catch (error: any) {
        throw new AppError(`Cannot access backup file: ${error.message}`, 400);
      }

      // Criar log ANTES de fechar a conexão
      try {
        createLog(req.user.userId, `RESTORE_BACKUP:${filename}`);
      } catch (error: any) {
        // Continuar mesmo sem criar o log
      }

      // Fechar conexão do banco antes de restaurar
      try {
        const db = require('../../config/database').default;
        if (db && typeof db.close === 'function') {
          db.close();
        }
      } catch (error: any) {
        // Continuar mesmo se não conseguir fechar (pode estar em uso)
      }

      // Remover arquivos WAL/SHM se existirem
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

      // Create a backup of current database before restoring
      const currentBackupName = `pre-restore-${Date.now()}.sqlite`;
      const currentBackupPath = path.join(backupsDir, currentBackupName);
      if (fs.existsSync(dbPath)) {
        try {
          fs.copyFileSync(dbPath, currentBackupPath);
        } catch (error: any) {
          throw new AppError(`Cannot backup current database: ${error.message}`, 500);
        }
      }

      // Restore the backup
      try {
        fs.copyFileSync(backupPath, dbPath);
      } catch (error: any) {
        throw new AppError(`Cannot restore backup: ${error.message}. The database file may be in use. Please restart the server.`, 500);
      }

      res.json({
        message: 'Backup restored successfully. Please restart the server for changes to take effect.',
        warning: 'The server needs to be restarted for the restored database to be loaded.',
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to restore backup: ${error.message}`, 500);
    }
  },

  delete: (req: AuthRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const { filename } = req.params;
      if (!filename) {
        throw new AppError('Filename is required', 400);
      }

      const basePath = getBasePath();
      const backupsDir = path.join(basePath, 'backups');
      const backupPath = path.join(backupsDir, filename);

      if (!fs.existsSync(backupPath)) {
        throw new AppError('Backup file not found', 404);
      }

      fs.unlinkSync(backupPath);

      createLog(req.user.userId, `DELETE_BACKUP:${filename}`);

      res.json({
        message: 'Backup deleted successfully',
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete backup', 500);
    }
  },
};

