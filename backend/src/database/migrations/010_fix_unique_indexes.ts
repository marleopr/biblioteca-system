import db from '../../config/database';

export const up = () => {
  // Remove os índices únicos antigos que não consideram active
  // Esses índices impedem a criação de novos registros mesmo quando há registros inativos
  try {
    db.exec(`DROP INDEX IF EXISTS idx_authors_name_normalized;`);
  } catch (error: any) {
    // Ignora erro se o índice não existir
  }

  try {
    db.exec(`DROP INDEX IF EXISTS idx_categories_name_normalized;`);
  } catch (error: any) {
    // Ignora erro se o índice não existir
  }

  // Não criamos novos índices únicos porque:
  // 1. SQLite não suporta índices parciais (WHERE active = 1)
  // 2. Um índice único composto (name_normalized, active) permitiria duplicatas
  //    entre registros ativos e inativos, mas não resolveria o problema
  // 3. A verificação no código (authorService.create) já garante que não haverá
  //    duplicatas entre autores ativos, e se houver um inativo, ele será reativado
};

