# 📚 Sistema de Gestão de Biblioteca

Sistema completo de gestão de biblioteca desenvolvido para bibliotecas públicas. Roda localmente, sem dependências de serviços pagos ou cloud.

## ✨ Características

- 🎯 **Backend**: Node.js + TypeScript + Express
- ⚛️ **Frontend**: React + TypeScript + Vite
- 💾 **Banco de Dados**: SQLite (arquivo único, portável)
- 🔐 **Autenticação**: JWT com controle de permissões (ADMIN/USER)
- 💾 **Backup**: Sistema automático de backup e restauração
- 🎨 **UI**: Interface moderna com Chakra UI
- 📦 **Distribuição**: Executável Windows (.exe) pronto para uso

## 🚀 Início Rápido

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd Biblioteca

# Instale as dependências
npm install

# Execute as migrations
cd backend && npm run migrate

# Inicie o servidor de desenvolvimento
cd .. && npm run dev
```

Acesse:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

**Credenciais padrão:**
- CPF: `00000000000`
- Senha: `admin123`

## 📦 Gerar Executável

```bash
npm run build:exe
```

O executável será gerado em `backend/dist/pkg/biblioteca-system.exe`

## 🎯 Funcionalidades

- ✅ Gestão completa de livros, autores, categorias
- ✅ Cadastro de clientes/leitores
- ✅ Sistema de empréstimos com validações
- ✅ Dashboard com estatísticas
- ✅ Backup e restauração automática
- ✅ Upload de fotos com compressão
- ✅ Busca e filtros avançados
- ✅ Histórico completo de empréstimos
- ✅ Configurações personalizáveis

## 🛠️ Tecnologias

**Backend:** Node.js, TypeScript, Express, SQLite, JWT  
**Frontend:** React, TypeScript, Vite, Chakra UI, React Query

## 📖 Documentação

- [README Completo](./README.md) - Documentação detalhada
- [BUILD.md](./BUILD.md) - Guia de build e distribuição

## 📝 Licença

Projeto desenvolvido para doação a bibliotecas públicas.

---

⭐ **Desenvolvido com ❤️ para bibliotecas públicas**

