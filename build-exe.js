const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando build do executável...\n');

// 1. Build do frontend
console.log('📦 Buildando frontend...');
try {
  execSync('npm run build:frontend', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Frontend buildado com sucesso!\n');
} catch (error) {
  console.error('❌ Erro ao buildar frontend:', error.message);
  process.exit(1);
}

// 2. Build do backend
console.log('📦 Buildando backend...');
try {
  execSync('npm run build:backend', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Backend buildado com sucesso!\n');
} catch (error) {
  console.error('❌ Erro ao buildar backend:', error.message);
  process.exit(1);
}

// 3. Copiar frontend/dist para backend/frontend/dist
console.log('📋 Copiando arquivos do frontend...');
const frontendDist = path.join(__dirname, 'frontend', 'dist');
const backendFrontendDist = path.join(__dirname, 'backend', 'frontend', 'dist');

if (!fs.existsSync(frontendDist)) {
  console.error('❌ Pasta frontend/dist não encontrada!');
  process.exit(1);
}

// Criar diretório se não existir
if (!fs.existsSync(path.join(__dirname, 'backend', 'frontend'))) {
  fs.mkdirSync(path.join(__dirname, 'backend', 'frontend'), { recursive: true });
}

// Limpar pasta destino se existir
if (fs.existsSync(backendFrontendDist)) {
  fs.rmSync(backendFrontendDist, { recursive: true, force: true });
}

// Copiar arquivos
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(frontendDist, backendFrontendDist);
console.log('✅ Arquivos do frontend copiados!\n');

// 4. Gerar executável com pkg
console.log('🔨 Gerando executável com pkg...');
try {
  execSync('npm run pkg', { stdio: 'inherit', cwd: path.join(__dirname, 'backend') });
  console.log('✅ Executável gerado com sucesso!\n');
} catch (error) {
  console.error('❌ Erro ao gerar executável:', error.message);
  process.exit(1);
}

// 5. Copiar frontend/dist para a pasta do executável
console.log('📋 Copiando frontend para pasta do executável...');
const exeDir = path.join(__dirname, 'backend', 'dist', 'pkg');
const exeFrontendDist = path.join(exeDir, 'frontend', 'dist');

if (fs.existsSync(exeDir)) {
  if (!fs.existsSync(path.join(exeDir, 'frontend'))) {
    fs.mkdirSync(path.join(exeDir, 'frontend'), { recursive: true });
  }
  
  if (fs.existsSync(exeFrontendDist)) {
    fs.rmSync(exeFrontendDist, { recursive: true, force: true });
  }
  
  copyRecursiveSync(backendFrontendDist, exeFrontendDist);
  console.log('✅ Frontend copiado para pasta do executável!\n');
}

console.log('🎉 Build completo!');

// Verificar qual arquivo foi gerado (pkg pode gerar com sufixo -win)
const exeFiles = fs.existsSync(exeDir) ? fs.readdirSync(exeDir).filter(f => f.endsWith('.exe')) : [];
if (exeFiles.length > 0) {
  console.log(`📁 Executável gerado em: ${path.join(exeDir, exeFiles[0])}`);
} else {
  console.log(`📁 Executável gerado em: ${exeDir}`);
}

console.log('\n💡 Para distribuir, copie:');
console.log('   - O arquivo .exe gerado');
console.log('   - A pasta frontend/ (pasta completa)');
console.log('\n📝 O banco de dados (database.sqlite) será criado automaticamente na primeira execução.');

// 6. Criar pacote ZIP para distribuição (opcional)
console.log('\n📦 Criando pacote ZIP para distribuição...');
try {
  const archiver = require('archiver');
  const zipPath = path.join(exeDir, 'biblioteca-system-dist.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`✅ Pacote ZIP criado: ${zipPath}`);
    console.log(`   Tamanho: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
    console.log('\n📦 Para distribuir, envie o arquivo ZIP e instrua o usuário a:');
    console.log('   1. Extrair o ZIP em uma pasta');
    console.log('   2. Executar o biblioteca-system.exe');
    console.log('   3. Abrir http://localhost:3001 no navegador');
  });

  archive.on('error', (err) => {
    console.warn('⚠️  Aviso: Não foi possível criar o ZIP (archiver não instalado)');
    console.warn('   Você pode criar manualmente um ZIP com o .exe e a pasta frontend/');
  });

  archive.pipe(output);
  
  // Adicionar o executável
  const exeFile = exeFiles.length > 0 ? exeFiles[0] : null;
  if (exeFile) {
    archive.file(path.join(exeDir, exeFile), { name: exeFile });
  }
  
  // Adicionar a pasta frontend
  if (fs.existsSync(path.join(exeDir, 'frontend'))) {
    archive.directory(path.join(exeDir, 'frontend'), 'frontend');
  }
  
  archive.finalize();
} catch (error) {
  console.warn('⚠️  Aviso: Não foi possível criar o ZIP automaticamente');
  console.warn('   Instale o pacote "archiver": npm install archiver --save-dev');
  console.warn('   Ou crie manualmente um ZIP com o .exe e a pasta frontend/');
}

