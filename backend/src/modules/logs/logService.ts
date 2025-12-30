import db from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

export const createLog = (userId: string, action: string): void => {
  const stmt = db.prepare(`
    INSERT INTO logs (id, user_id, action)
    VALUES (?, ?, ?)
  `);
  
  stmt.run(uuidv4(), userId, action);
};

