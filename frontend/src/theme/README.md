# Sistema de Cores do Sistema de Biblioteca

Este diretório contém a configuração centralizada de cores e estilos do sistema.

## Estrutura

- `colors.ts` - Define todas as cores do sistema
- `styles.ts` - Estilos globais e helpers
- `index.ts` - Configuração do tema do Chakra UI

## Uso

### Importar cores

```typescript
import { libraryColors, sidebarColorOptions } from '../../theme/colors';
```

### Usar no componente

```typescript
<Box bg={libraryColors.primary[500]} color={libraryColors.text.inverse}>
  Conteúdo
</Box>
```

### Cores disponíveis

- `libraryColors.primary` - Cores primárias (50-900)
- `libraryColors.success` - Cores de sucesso
- `libraryColors.error` - Cores de erro
- `libraryColors.warning` - Cores de aviso
- `libraryColors.info` - Cores informativas
- `libraryColors.sidebar` - Cores da sidebar
- `libraryColors.background` - Cores de fundo
- `libraryColors.text` - Cores de texto
- `libraryColors.border` - Cores de borda
- `libraryColors.avatar` - Cores para avatares

