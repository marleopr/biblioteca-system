import db from '../../config/database';

export const up = () => {
  try {
    // Busca todos os registros de settings
    const allSettings = db.prepare('SELECT * FROM settings ORDER BY id').all() as Array<{
      id: string;
      max_loans_per_client: number;
      loan_duration_days: number;
    }>;

    if (allSettings.length === 0) {
      // Se não existe nenhum, cria um padrão
      db.prepare(`
        INSERT INTO settings (id, max_loans_per_client, loan_duration_days)
        VALUES (?, ?, ?)
      `).run('079e2df8-0830-42a5-bf38-dd3f28cbed20', 5, 14);
      return;
    }

    // Mantém apenas o primeiro registro (o mais antigo)
    const firstSetting = allSettings[0];

    // Deleta todos os outros registros
    if (allSettings.length > 1) {
      // SQLite não suporta DELETE com muitos IDs de uma vez, então deleta um por um
      const idsToDelete = allSettings.slice(1).map((s) => s.id);
      const deleteStmt = db.prepare('DELETE FROM settings WHERE id = ?');
      for (const id of idsToDelete) {
        deleteStmt.run(id);
      }
    }

    // Garante que o primeiro registro tem os valores corretos
    db.prepare(`
      UPDATE settings 
      SET max_loans_per_client = ?, loan_duration_days = ?
      WHERE id = ?
    `).run(firstSetting.max_loans_per_client, firstSetting.loan_duration_days, firstSetting.id);
  } catch (error: any) {
    console.error('Error cleaning up duplicate settings:', error);
  }
};

