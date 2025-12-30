import db from '../../config/database';
import { normalizeText } from '../../shared/utils/normalize';

export const up = () => {
  // Adiciona coluna name_normalized na tabela authors
  try {
    db.exec(`
      ALTER TABLE authors ADD COLUMN name_normalized TEXT;
    `);
    
    // Preenche name_normalized com valores normalizados dos nomes existentes
    const authors = db.prepare('SELECT id, name FROM authors').all() as Array<{ id: string; name: string }>;
    
    for (const author of authors) {
      // Para dados existentes, name já está normalizado, então copiamos para name_normalized
      // E capitalizamos a primeira letra do name para melhor visualização
      const capitalizedName = author.name.charAt(0).toUpperCase() + author.name.slice(1);
      const normalizedName = normalizeText(author.name);
      db.prepare('UPDATE authors SET name = ?, name_normalized = ? WHERE id = ?').run(capitalizedName, normalizedName, author.id);
    }
  } catch (error: any) {
    // Ignora se a coluna já existe
    if (!error.message.includes('duplicate column')) {
      console.error('Error adding name_normalized to authors:', error);
    }
  }

  // Adiciona coluna name_normalized na tabela categories
  try {
    db.exec(`
      ALTER TABLE categories ADD COLUMN name_normalized TEXT;
    `);
    
    // Preenche name_normalized com valores normalizados dos nomes existentes
    const categories = db.prepare('SELECT id, name FROM categories').all() as Array<{ id: string; name: string }>;
    
    for (const category of categories) {
      // Para dados existentes, name já está normalizado, então copiamos para name_normalized
      // E capitalizamos a primeira letra do name para melhor visualização
      const capitalizedName = category.name.charAt(0).toUpperCase() + category.name.slice(1);
      const normalizedName = normalizeText(category.name);
      db.prepare('UPDATE categories SET name = ?, name_normalized = ? WHERE id = ?').run(capitalizedName, normalizedName, category.id);
    }
  } catch (error: any) {
    // Ignora se a coluna já existe
    if (!error.message.includes('duplicate column')) {
      console.error('Error adding name_normalized to categories:', error);
    }
  }

  // Remove constraint UNIQUE de name e adiciona em name_normalized
  // SQLite não suporta DROP CONSTRAINT diretamente, então vamos criar índices únicos
  try {
    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_authors_name_normalized ON authors(name_normalized);
    `);
    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name_normalized ON categories(name_normalized);
    `);
  } catch (error: any) {
    console.error('Error creating unique indexes:', error);
  }
};

