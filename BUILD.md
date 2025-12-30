# Guia de Build - Sistema de Biblioteca

Este guia explica como gerar o executável (.exe) do Sistema de Gestão de Biblioteca para Windows.

## Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **npm** (vem com Node.js)
3. **Windows** (para gerar o .exe do Windows)

## Passo a Passo

### 1. Instalar Dependências

Na raiz do projeto, execute:

```bash
npm install
```

Isso instalará as dependências do script de build e também das pastas `backend` e `frontend`.

### 2. Build do Frontend

O frontend React será compilado para arquivos estáticos:

```bash
npm run build:frontend
```

Ou execute o build completo:

```bash
npm run build
```

### 3. Build do Backend

O backend TypeScript será compilado para JavaScript:

```bash
npm run build:backend
```

### 4. Gerar o Executável (.exe)

Execute o comando para gerar o .exe:

```bash
npm run build:exe
```

Este script irá:
1. Buildar o frontend
2. Buildar o backend
3. Copiar os arquivos do frontend para o local correto
4. Gerar o executável com pkg
5. Copiar o frontend para a pasta do executável

O executável será gerado em: `backend/dist/pkg/biblioteca-system.exe` (ou `biblioteca-system-win.exe` dependendo da versão do pkg)

## Estrutura Final

Após o build, você terá:

```
backend/dist/pkg/
├── biblioteca-system.exe  (executável principal)
└── frontend/
    └── dist/              (arquivos estáticos do frontend)
```

## Distribuição

Para distribuir o sistema, você precisa:

1. **Executável**: `backend/dist/pkg/biblioteca-system.exe`
2. **Pasta frontend**: Copiar `backend/dist/pkg/frontend/` junto com o .exe
3. **Banco de dados**: O arquivo `database.sqlite` será criado automaticamente na primeira execução

### Estrutura de Distribuição Recomendada

```
Biblioteca-System/
├── biblioteca-system.exe
├── frontend/
│   └── dist/
│       ├── index.html
│       ├── assets/
│       └── ...
├── database.sqlite        (criado automaticamente)
└── backups/               (criado automaticamente)
```

## Execução

1. Execute o `biblioteca-system.exe`
2. Abra o navegador em: `http://localhost:3001`
3. O sistema estará pronto para uso!

## Notas Importantes

- **Porta**: O sistema usa a porta **3001** por padrão (pode ser alterada via variável de ambiente `PORT`)
- **Banco de Dados**: O arquivo `database.sqlite` será criado na mesma pasta do .exe
- **Backups**: A pasta `backups/` será criada automaticamente na mesma pasta do .exe
- **Primeira Execução**: Na primeira execução, o sistema criará as tabelas e dados iniciais automaticamente
- **Permissões**: Não são necessárias permissões de administrador (porta 3001 não requer privilégios elevados)

## Desenvolvimento

Para desenvolvimento, use:

```bash
npm run dev
```

Isso iniciará:
- Backend na porta 3001
- Frontend na porta 3000 (com proxy para API)

## Troubleshooting

### Erro: "Port 3001 is already in use"

Se a porta 3001 estiver em uso, você pode:
1. Fechar o aplicativo que está usando a porta 3001
2. Ou definir uma porta customizada: `set PORT=8080 && biblioteca-system.exe`

### Erro ao gerar o .exe

Certifique-se de que:
- Todas as dependências estão instaladas
- O build do frontend foi executado com sucesso
- O build do backend foi executado com sucesso
- Você está no Windows (pkg gera executáveis específicos do sistema operacional)

### O frontend não carrega

Verifique se a pasta `frontend/dist/` está presente na mesma pasta do .exe ou em `frontend/dist/` relativa ao .exe.

