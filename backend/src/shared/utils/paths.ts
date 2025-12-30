import path from 'path';

/**
 * Obtém o caminho base do projeto
 * Quando empacotado com pkg, usa process.cwd() (diretório de onde foi executado)
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
    // Quando empacotado com pkg, process.execPath aponta para o snapshot interno
    // Usamos process.cwd() que é o diretório de onde o executável foi chamado
    // IMPORTANTE: Execute o .exe sempre da mesma pasta onde ele está localizado
    return process.cwd();
  }
  // Em desenvolvimento, retorna a pasta backend
  return path.join(__dirname, '../..');
}


