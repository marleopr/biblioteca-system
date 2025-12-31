import path from 'path';

/**
 * Obtém o caminho base do projeto
 * Quando empacotado com pkg, usa o diretório do executável
 * Quando em desenvolvimento, usa __dirname relativo
 */
export function getBasePath(): string {
  // Detectar se está empacotado verificando se __dirname contém "snapshot"
  // ou se process.pkg existe (propriedade definida pelo pkg)
  const isPackaged = 
    typeof (process as any).pkg !== 'undefined' ||
    __dirname.includes('snapshot') ||
    process.execPath.includes('snapshot');
    
  if (isPackaged) {
    // Quando empacotado, usar o diretório do executável
    // Isso garante consistência independentemente de onde o .exe foi executado
    return path.dirname(process.execPath);
  }
  // Em desenvolvimento, retorna a pasta backend
  return path.join(__dirname, '../..');
}


