// Estilos globais do sistema
import { libraryColors } from './colors';

export const globalStyles = {
  // Cores de fundo
  background: {
    light: libraryColors.background.light,
    dark: libraryColors.background.dark,
    sidebar: libraryColors.background.sidebar,
    card: libraryColors.background.card,
    cardHover: libraryColors.background.cardHover,
  },
  
  // Cores de texto
  text: {
    primary: libraryColors.text.primary,
    secondary: libraryColors.text.secondary,
    tertiary: libraryColors.text.tertiary,
    inverse: libraryColors.text.inverse,
    disabled: libraryColors.text.disabled,
  },
  
  // Cores de borda
  border: {
    light: libraryColors.border.light,
    medium: libraryColors.border.medium,
    dark: libraryColors.border.dark,
  },
  
  // Cores de status
  status: {
    success: libraryColors.success,
    error: libraryColors.error,
    warning: libraryColors.warning,
    info: libraryColors.info,
  },
  
  // Cores da sidebar
  sidebar: libraryColors.sidebar,
  
  // Cores primárias
  primary: libraryColors.primary,
};

// Função helper para obter cores do tema
export const getThemeColor = (colorPath: string): string => {
  const paths: Record<string, string> = {
    // Backgrounds
    'bg.light': globalStyles.background.light,
    'bg.dark': globalStyles.background.dark,
    'bg.sidebar': globalStyles.background.sidebar,
    'bg.card': globalStyles.background.card,
    'bg.cardHover': globalStyles.background.cardHover,
    
    // Text
    'text.primary': globalStyles.text.primary,
    'text.secondary': globalStyles.text.secondary,
    'text.tertiary': globalStyles.text.tertiary,
    'text.inverse': globalStyles.text.inverse,
    'text.disabled': globalStyles.text.disabled,
    
    // Borders
    'border.light': globalStyles.border.light,
    'border.medium': globalStyles.border.medium,
    'border.dark': globalStyles.border.dark,
    
    // Status
    'status.success': globalStyles.status.success[500],
    'status.error': globalStyles.status.error[500],
    'status.warning': globalStyles.status.warning[500],
    'status.info': globalStyles.status.info[500],
  };
  
  return paths[colorPath] || colorPath;
};

