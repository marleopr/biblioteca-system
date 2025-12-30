# 📚 Manual do Sistema de Gestão de Biblioteca

## Bem-vindo!

Este é o manual de uso do Sistema de Gestão de Biblioteca. Este documento explica como usar o sistema de forma simples e prática.

## 🚀 Como Iniciar o Sistema

### Primeira Vez

1. **Encontre a pasta do sistema** no computador
2. **Clique duas vezes** no arquivo `executar.bat` (ou `biblioteca-system.exe`)
3. **Aguarde** alguns segundos até aparecer a mensagem "Server running"
4. **Abra seu navegador** (Chrome, Firefox ou Edge)
5. **Digite na barra de endereço**: `http://localhost:3001`
6. **Pressione Enter**

### Próximas Vezes

Siga os mesmos passos acima. O sistema já estará configurado!

## 🔑 Como Fazer Login

Na primeira vez, use estas credenciais:

- **CPF**: `00000000000`
- **Senha**: `admin123`

⚠️ **IMPORTANTE**: Após o primeiro login, altere a senha imediatamente!

### Como Alterar a Senha

1. Faça login
2. Clique no seu nome no canto superior direito
3. Selecione "Perfil"
4. Digite sua senha atual
5. Digite a nova senha
6. Confirme a nova senha
7. Clique em "Salvar"

## 📖 Como Usar o Sistema

### Dashboard (Página Inicial)

Aqui você vê:
- Empréstimos que estão próximos do vencimento
- Empréstimos atrasados
- Informações gerais do sistema

### 📚 Livros

**Cadastrar um Livro:**
1. Clique em "Livros" no menu
2. Clique no botão "+ Novo Livro"
3. Preencha as informações:
   - Título do livro
   - Autor (ou crie um novo)
   - Categoria (ou crie uma nova)
   - Foto do livro (opcional)
   - Quantidade de exemplares
   - Outras informações
4. Clique em "Salvar"

**Buscar um Livro:**
- Use a barra de busca no topo da lista
- Digite o título, autor ou categoria

**Ver Histórico de Empréstimos:**
- Clique no livro desejado
- Veja a aba "Histórico de Empréstimos"

### 👥 Clientes

**Cadastrar um Cliente:**
1. Clique em "Clientes" no menu
2. Clique no botão "+ Novo Cliente"
3. Preencha:
   - Nome completo
   - CPF
   - Telefone
   - Endereço (opcional)
   - Email (opcional)
   - Foto (opcional)
4. Clique em "Salvar"

**Buscar um Cliente:**
- Use a barra de busca
- Digite o nome ou CPF

### 📖 Empréstimos

**Fazer um Empréstimo:**
1. Clique em "Empréstimos" no menu
2. Clique no botão "+ Novo Empréstimo"
3. Selecione o cliente
4. Selecione o livro
5. O sistema calculará automaticamente a data de devolução
6. Selecione o estado do livro (novo, bom, regular, danificado)
7. Adicione observações se necessário
8. Clique em "Salvar"

**Devolver um Livro:**
1. Na lista de empréstimos, encontre o empréstimo ativo
2. Clique no botão "Devolver"
3. Selecione o estado do livro na devolução
4. Adicione observações se necessário
5. Clique em "Confirmar Devolução"

**Ver Empréstimos:**
- Use os filtros para ver:
  - Empréstimos ativos
  - Empréstimos devolvidos
  - Empréstimos atrasados

### ⚙️ Configurações (Apenas Administradores)

**Alterar Configurações:**
1. Clique em "Configurações" no menu
2. Você pode alterar:
   - Nome da biblioteca
   - Logo da biblioteca
   - Cor da barra lateral
   - Limite de empréstimos por cliente
   - Prazo de empréstimo em dias

**Gerenciar Usuários:**
1. Na página de Configurações
2. Vá para a aba "Usuários"
3. Clique em "+ Novo Usuário" para criar
4. Ou clique em um usuário para editar

**Fazer Backup:**
1. Na página de Configurações
2. Vá para a aba "Backups"
3. Clique em "Criar Backup"
4. O backup será criado automaticamente

**Restaurar Backup:**
1. Na página de Configurações
2. Vá para a aba "Backups"
3. Encontre o backup desejado na lista
4. Clique em "Restaurar"
5. ⚠️ **IMPORTANTE**: Após restaurar, feche e abra o sistema novamente

## 💡 Dicas Importantes

### Fazer Backup Regularmente

- Faça backup pelo menos uma vez por semana
- O sistema cria backups automáticos diários
- Guarde os backups em local seguro (pen drive, nuvem, etc.)

### Quando Fechar o Sistema

1. Clique no X do console (janela preta)
2. Ou pressione Ctrl+C no console
3. Aguarde a mensagem "Servidor encerrado"

### Se o Sistema Não Abrir

1. Verifique se a porta 3001 não está sendo usada por outro programa
2. Feche outros programas que possam estar usando
3. Tente executar novamente

### Se Esqueceu a Senha

- Entre em contato com o administrador do sistema
- Ou use o usuário administrador padrão (se ainda não foi alterado)

## ❓ Perguntas Frequentes

**P: O sistema precisa de internet?**  
R: Não! O sistema funciona completamente offline.

**P: Posso usar em mais de um computador?**  
R: Sim, mas cada computador terá seu próprio banco de dados. Para compartilhar dados, você precisará copiar o arquivo `database.sqlite` entre os computadores.

**P: Onde ficam salvos os dados?**  
R: Todos os dados ficam no arquivo `database.sqlite` na mesma pasta do sistema.

**P: Como atualizar o sistema?**  
R: Entre em contato com o desenvolvedor para receber a versão atualizada. Você precisará substituir os arquivos e fazer backup antes.

**P: O sistema funciona em outros sistemas operacionais?**  
R: Atualmente, o executável é apenas para Windows. Para outros sistemas, é necessário instalar Node.js e rodar o código fonte.

## 🆘 Precisa de Ajuda?

Se tiver dúvidas ou problemas:
1. Verifique este manual primeiro
2. Entre em contato com o suporte técnico
3. Anote a mensagem de erro (se houver) para facilitar o diagnóstico

---

**Bom uso do sistema! 📚**

