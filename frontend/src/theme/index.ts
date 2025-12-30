import { extendTheme } from '@chakra-ui/react';
import { libraryColors } from './colors';

export const theme = extendTheme({
  colors: {
    library: libraryColors,
    // Mantém as cores padrão do Chakra UI
    brand: libraryColors.primary,
    // Adiciona cores customizadas ao tema do Chakra
    primary: libraryColors.primary,
    success: libraryColors.success,
    error: libraryColors.error,
    warning: libraryColors.warning,
    info: libraryColors.info,
  },
  
  // Configurações globais
  styles: {
    global: {
      body: {
        bg: libraryColors.background.light,
        color: libraryColors.text.primary,
      },
    },
  },
  
  // Componentes customizados
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'blue',
      },
      variants: {
        primary: {
          bg: libraryColors.primary[500],
          color: 'white',
          _hover: {
            bg: libraryColors.primary[600],
          },
        },
      },
    },
    
    Card: {
      baseStyle: {
        container: {
          bg: libraryColors.background.card,
          borderColor: libraryColors.border.light,
          _hover: {
            bg: libraryColors.background.cardHover,
          },
        },
      },
    },
  },
});

