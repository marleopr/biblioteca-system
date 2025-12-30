# Sistema de Gestão de Biblioteca

Sistema completo de gestão de biblioteca desenvolvido para bibliotecas públicas que trabalham com controles manuais. O sistema roda localmente, não depende de serviços pagos ou cloud, e é fácil de instalar e manter.

## 🎯 Características

- ✅ Backend Node.js + TypeScript + Express
- ✅ Frontend React + TypeScript + Vite
- ✅ Banco de dados SQLite (arquivo único, portável)
- ✅ Sistema de autenticação JWT
- ✅ Controle de permissões (ADMIN e USER)
- ✅ Backup e restauração automática
- ✅ Interface moderna com Chakra UI
- ✅ Código limpo e organizado
- ✅ Sem dependências de serviços pagos
- ✅ Executável Windows (.exe) para distribuição
- ✅ Sistema de migrations automático
- ✅ Validação de dados com Zod
- ✅ Upload e compressão de imagens
- ✅ Busca e filtros avançados
- ✅ Paginação em todas as listagens
- ✅ Histórico completo de empréstimos

## 📋 Requisitos

### Para Desenvolvimento
- Node.js 18+ 
- npm ou yarn
- Git (opcional)

### Para Executar o Executável
- Windows 10 ou superior
- Navegador web moderno (Chrome, Firefox, Edge)
- Não precisa instalar Node.js

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd Biblioteca
```

### 2. Instale as dependências

Na raiz do projeto:

```bash
npm install
```

Isso instalará as dependências da raiz, backend e frontend automaticamente.

### 3. Configure as variáveis de ambiente (Opcional)

Crie um arquivo `.env` na pasta `backend/` (opcional, tem valores padrão):

```env
PORT=3001
JWT_SECRET=sua-chave-secreta-aqui
NODE_ENV=development
```

### 4. Execute as migrations do banco de dados

```bash
cd backend
npm run migrate
```

Isso criará o banco de dados SQLite e um usuário administrador padrão:
- **CPF**: `00000000000`
- **Senha**: `admin123`

⚠️ **IMPORTANTE**: Altere a senha do administrador após o primeiro login!

### 5. Inicie o servidor de desenvolvimento

Na raiz do projeto:

```bash
npm run dev
```

Isso iniciará:
- Backend em `http://localhost:3001`
- Frontend em `http://localhost:3000` (com proxy para API)

## 👥 Tipos de Usuários

### ADMIN (Administrador)
- Gerencia tudo no sistema
- Pode criar usuários ADMIN ou USER
- Pode excluir livros e usuários
- Acessa todas as configurações
- Pode fazer backup e restaurar
- Gerencia nome e logo da biblioteca
- Configura cores e temas

### USER (Funcionário)
- Opera empréstimos
- Cadastra livros e clientes
- Edita livros e clientes (sem excluir)
- Visualiza relatórios e históricos
- Não pode excluir dados
- Não acessa configurações do sistema
- Não gerencia usuários

### CLIENT (Cliente/Leitor)
- Não faz login no sistema
- Apenas cadastrado no sistema para empréstimos
- Possui histórico de empréstimos

## 📚 Funcionalidades Principais

### Dashboard
- Visualização de empréstimos próximos do vencimento (30 dias)
- Lista de empréstimos atrasados
- Estatísticas gerais
- Destaques visuais e alertas

### Livros
- CRUD completo de livros
- Upload de foto do livro
- Campos: título, autor, categoria, foto, origem, tipo de aquisição
- Campos adicionais: código de barras, número de inventário, edição, tipo de capa, ISBN
- Controle de quantidade total e disponível
- Filtros por título, autor e categoria
- Busca avançada
- Histórico completo de empréstimos por livro
- Paginação

### Autores
- CRUD de autores
- Normalização automática de nomes
- Busca com debounce
- Contagem de livros por autor
- Paginação

### Categorias
- CRUD de categorias
- Normalização automática de nomes
- Busca com debounce
- Contagem de livros por categoria
- Paginação

### Clientes
- CRUD completo de clientes
- Upload de foto do cliente
- Campos: nome, CPF, telefone, email
- Endereço completo (rua, número, bairro, cidade, estado, CEP)
- Validação de CPF e telefone
- Busca por nome ou CPF
- Histórico completo de empréstimos por cliente
- Paginação

### Empréstimos
- Criar empréstimos com validações automáticas
- Devolver livros
- Selecionar estado do livro (novo, bom, regular, danificado)
- Validação automática de limites configuráveis
- Filtros por status (ativos, devolvidos, atrasados)
- Busca por livro ou cliente
- Notas e observações
- Paginação

### Configurações (ADMIN)
- Alterar limite de empréstimos por cliente
- Alterar prazo de empréstimo em dias
- Configurar nome da biblioteca
- Upload de logo da biblioteca
- Personalizar cor da sidebar
- Gerenciar usuários (criar, editar, ativar/desativar)
- Sistema de backup e restauração

### Perfil
- Visualizar e editar perfil do usuário logado
- Alterar senha
- Atualizar foto de perfil

## 💾 Backup e Restauração

### Criar Backup (via Interface)

1. Faça login como ADMIN
2. Acesse **Configurações** → **Backups**
3. Clique em **Criar Backup**
4. O backup será salvo automaticamente na pasta `backups/` com timestamp

### Restaurar Backup (via Interface)

1. Faça login como ADMIN
2. Acesse **Configurações** → **Backups**
3. Selecione o backup desejado na lista
4. Clique em **Restaurar**
5. O sistema criará um backup do banco atual antes de restaurar
6. **Reinicie o servidor** após restaurar

### Backup Automático

O sistema cria backups automáticos:
- Uma vez por dia ao iniciar o servidor
- Mantém backups dos últimos 30 dias
- Limpa backups antigos automaticamente

### Backup Manual

Você também pode fazer backup manualmente copiando o arquivo `database.sqlite`:

```bash
# Windows
copy database.sqlite backups\backup-manual-YYYYMMDD-HHMMSS.sqlite

# Linux/Mac
cp database.sqlite backups/backup-manual-$(date +%Y%m%d-%H%M%S).sqlite
```

## 📦 Gerar Executável (.exe)

### Processo Completo

Na raiz do projeto:

```bash
npm run build:exe
```

Este comando automatiza todo o processo:
1. Builda o frontend (compila React para arquivos estáticos)
2. Builda o backend (compila TypeScript para JavaScript)
3. Copia os arquivos do frontend para o local correto
4. Gera o executável com pkg
5. Copia o frontend para a pasta do executável

### Resultado

O executável será gerado em: `backend/dist/pkg/biblioteca-system.exe`

### Estrutura para Distribuição

```
backend/dist/pkg/
├── biblioteca-system.exe  (executável principal)
├── executar.bat           (script para executar - opcional)
└── frontend/              (pasta completa - obrigatória)
    └── dist/
        ├── index.html
        ├── assets/
        └── favicon.ico
```

### Distribuir o Sistema

Copie a pasta completa `backend/dist/pkg/` contendo:
- O arquivo `.exe`
- A pasta `frontend/` completa

**Importante**: O banco de dados (`database.sqlite`) será criado automaticamente na primeira execução na mesma pasta do executável.

Para mais detalhes sobre o build, consulte [BUILD.md](./BUILD.md).

## 🔄 Processo de Atualização

### Durante o Desenvolvimento

```bash
# Desenvolvimento com hot reload
npm run dev
```

Alterações são aplicadas automaticamente, não precisa rebuildar.

### Após Fazer Alterações

1. Teste tudo funcionando em desenvolvimento
2. Gere o executável:
   ```bash
   npm run build:exe
   ```
3. Teste o executável localmente
4. Distribua para a biblioteca

### Atualizar na Biblioteca

1. **Pare o servidor** (Ctrl+C no console)
2. **Faça backup do banco de dados** (copie `database.sqlite`)
3. **Substitua os arquivos**:
   - Substitua `biblioteca-system.exe` pelo novo
   - Se mudou frontend, substitua a pasta `frontend/` completa
4. **Inicie o servidor novamente**

## 🏗️ Estrutura do Projeto

```
Biblioteca/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações (database, env, auth)
│   │   ├── database/        # Migrations e seeds
│   │   │   └── migrations/  # Arquivos de migração
│   │   ├── modules/         # Módulos do sistema
│   │   │   ├── auth/        # Autenticação
│   │   │   ├── users/       # Usuários
│   │   │   ├── clients/     # Clientes
│   │   │   ├── books/       # Livros
│   │   │   ├── authors/     # Autores
│   │   │   ├── categories/  # Categorias
│   │   │   ├── loans/       # Empréstimos
│   │   │   ├── settings/    # Configurações
│   │   │   ├── backup/      # Backup e restauração
│   │   │   └── logs/        # Logs do sistema
│   │   ├── shared/          # Código compartilhado
│   │   │   ├── errors/      # Tratamento de erros
│   │   │   ├── middlewares/ # Middlewares Express
│   │   │   ├── types/       # Tipos TypeScript
│   │   │   └── utils/       # Utilitários
│   │   ├── routes.ts        # Rotas principais
│   │   └── server.ts        # Servidor Express
│   ├── dist/                # Código compilado
│   │   └── pkg/             # Executável gerado
│   ├── database.sqlite      # Banco de dados (desenvolvimento)
│   └── backups/            # Backups do banco
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/          # Páginas do sistema
│   │   ├── services/       # Serviços de API
│   │   ├── hooks/          # Hooks customizados
│   │   ├── contexts/       # Contextos React
│   │   ├── utils/          # Utilitários
│   │   ├── theme/          # Tema e estilos
│   │   └── types/          # Tipos TypeScript
│   ├── dist/               # Build de produção
│   └── public/             # Arquivos públicos
│
├── build-exe.js            # Script de build automatizado
├── BUILD.md                # Documentação do build
├── package.json            # Scripts da raiz
└── README.md               # Este arquivo
```

## 🔒 Regras de Negócio

- **Empréstimos**: Não permite empréstimo se `available_quantity = 0`
- **Limites**: Não permite empréstimo se cliente atingiu limite configurado
- **Configurações**: Limite e prazo são configuráveis pelo ADMIN
- **Soft Delete**: Exclusões são lógicas, nunca deleta dados permanentemente
- **Normalização**: Normalização automática de textos para autores e categorias
- **Logs**: Registro de logs das ações principais (criar, editar, excluir)
- **Validações**: Validação de CPF, telefone, email
- **Fotos**: Compressão automática de imagens ao fazer upload

## 🛠️ Desenvolvimento

### Scripts Disponíveis

Na raiz do projeto:

```bash
npm run dev              # Inicia backend e frontend em desenvolvimento
npm run build            # Builda frontend e backend
npm run build:frontend   # Builda apenas o frontend
npm run build:backend    # Builda apenas o backend
npm run build:exe        # Gera o executável completo
```

### Backend

```bash
cd backend
npm run dev      # Desenvolvimento com hot reload
npm run build    # Compilar TypeScript
npm start        # Rodar versão compilada
npm run migrate  # Executar migrations
```

### Frontend

```bash
cd frontend
npm run dev      # Desenvolvimento com hot reload
npm run build    # Build para produção
npm run preview  # Preview do build
```

## 🗄️ Banco de Dados

### SQLite

O sistema usa SQLite como banco de dados:
- Arquivo único: `database.sqlite`
- Portável e fácil de fazer backup
- Não requer servidor de banco de dados
- Criação automática na primeira execução

### Migrations

O sistema possui sistema de migrations automático:
- Executadas automaticamente na inicialização
- Versionamento do banco de dados
- Facilita atualizações futuras

### Estrutura das Tabelas

- `users` - Usuários do sistema (ADMIN e USER)
- `clients` - Clientes/leitores
- `authors` - Autores dos livros
- `categories` - Categorias dos livros
- `books` - Livros do acervo
- `loans` - Empréstimos
- `settings` - Configurações do sistema
- `logs` - Logs de ações do sistema

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Validação de dados com Zod
- Proteção contra SQL Injection (prepared statements)
- CORS configurado
- Validação de permissões por rota

## 🐛 Troubleshooting

### Banco de dados não é criado

Execute manualmente as migrations:

```bash
cd backend
npm run migrate
```

### Erro de permissão no SQLite

Certifique-se de que a pasta tem permissões de escrita.

### Porta já em uso

Altere a porta no arquivo `.env` do backend ou use variável de ambiente:

```bash
set PORT=8080 && npm run dev
```

### Erro ao gerar o .exe

Certifique-se de que:
- Todas as dependências estão instaladas
- O build do frontend foi executado com sucesso
- O build do backend foi executado com sucesso
- Você está no Windows (pkg gera executáveis específicos do sistema)

### O frontend não carrega no executável

Verifique se a pasta `frontend/dist/` está presente na mesma pasta do `.exe`.

### Banco de dados corrompido

O sistema detecta automaticamente e tenta recuperar. Se não conseguir:
1. Pare o servidor
2. Remova `database.sqlite`, `database.sqlite-wal` e `database.sqlite-shm`
3. Restaure de um backup válido
4. Inicie novamente

## 📝 Tecnologias Utilizadas

### Backend
- Node.js
- TypeScript
- Express.js
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- bcrypt
- Zod (validação)
- node-cron (agendamento)

### Frontend
- React
- TypeScript
- Vite
- Chakra UI
- React Router
- React Query
- Axios
- date-fns
- Framer Motion

## 📄 Licença

Este projeto foi desenvolvido para doação a bibliotecas públicas.

## 🤝 Contribuindo

Este é um projeto de doação. Para sugestões ou melhorias, entre em contato.

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte a documentação
- Verifique o arquivo BUILD.md para questões de build
- Entre em contato com o desenvolvedor

---

**Desenvolvido com ❤️ para bibliotecas públicas**
