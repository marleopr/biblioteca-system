# 🚀 Guia de Versionamento e GitHub

Este guia explica como versionar o projeto e enviar para o GitHub.

## 📋 Pré-requisitos

1. **Git instalado** no seu computador
2. **Conta no GitHub** criada
3. **Repositório criado no GitHub** (vazio ou com README)

## 🔧 Passo a Passo

### 1. Inicializar o Repositório Git

Na raiz do projeto, execute:

```bash
git init
```

### 2. Adicionar Todos os Arquivos

```bash
git add .
```

### 3. Fazer o Primeiro Commit

```bash
git commit -m "Initial commit: Sistema de Gestão de Biblioteca"
```

### 4. Conectar com o GitHub

Substitua `<seu-usuario>` e `<nome-do-repositorio>` pelos seus dados:

```bash
git remote add origin https://github.com/<seu-usuario>/<nome-do-repositorio>.git
```

**Exemplo:**
```bash
git remote add origin https://github.com/seuusuario/biblioteca-system.git
```

### 5. Enviar para o GitHub

```bash
git branch -M main
git push -u origin main
```

## 📝 Comandos Git Úteis

### Ver Status dos Arquivos

```bash
git status
```

### Adicionar Arquivos Específicos

```bash
git add arquivo.ts
git add pasta/
```

### Fazer Commit

```bash
git commit -m "Descrição da alteração"
```

### Enviar Alterações

```bash
git push
```

### Ver Histórico

```bash
git log
```

### Criar Nova Branch

```bash
git checkout -b nome-da-branch
```

## 🔄 Fluxo de Trabalho Recomendado

### Quando Fizer Alterações:

1. **Verificar o que mudou:**
   ```bash
   git status
   ```

2. **Adicionar as alterações:**
   ```bash
   git add .
   ```

3. **Fazer commit:**
   ```bash
   git commit -m "Descrição clara do que foi alterado"
   ```

4. **Enviar para o GitHub:**
   ```bash
   git push
   ```

## 📦 O que NÃO será enviado (já está no .gitignore)

- `node_modules/` - Dependências (instaladas via npm)
- `dist/` - Arquivos compilados
- `*.exe` - Executáveis
- `*.sqlite` - Bancos de dados
- `backups/` - Backups
- `.env` - Variáveis de ambiente

## ⚠️ Importante

**NUNCA faça commit de:**
- Arquivos de banco de dados (`.sqlite`)
- Backups
- Arquivos `.env` com senhas
- `node_modules/`
- Executáveis (`.exe`)

O `.gitignore` já está configurado para ignorar esses arquivos automaticamente.

## 🔗 Criar Repositório no GitHub

1. Acesse https://github.com
2. Clique em **"New repository"** (ou **"+"** → **"New repository"**)
3. Escolha um nome (ex: `biblioteca-system`)
4. **NÃO** marque "Initialize with README" (já temos README)
5. Clique em **"Create repository"**
6. Copie a URL do repositório
7. Use no comando `git remote add origin`

## 📚 Estrutura Recomendada no GitHub

Você pode organizar assim:
- **README.md** - Documentação completa (já existe)
- **README-GITHUB.md** - Descrição resumida (copie para a descrição do repositório)
- **BUILD.md** - Guia de build
- **Código fonte** - Todo o código TypeScript/React

## 🎯 Exemplo Completo

```bash
# 1. Inicializar
git init

# 2. Adicionar tudo
git add .

# 3. Primeiro commit
git commit -m "Initial commit: Sistema de Gestão de Biblioteca completo"

# 4. Conectar ao GitHub (substitua pela sua URL)
git remote add origin https://github.com/seuusuario/biblioteca-system.git

# 5. Enviar
git branch -M main
git push -u origin main
```

## 🔄 Atualizações Futuras

Após fazer alterações no código:

```bash
git add .
git commit -m "Descrição da alteração"
git push
```

---

**Dica**: Use mensagens de commit descritivas, como:
- "Adiciona funcionalidade de backup automático"
- "Corrige bug no cálculo de empréstimos"
- "Melhora interface do dashboard"

