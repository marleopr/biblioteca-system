// Cores do sistema de biblioteca
export const libraryColors = {
  // Cores principais
  primary: {
    50: '#e6f2ff',
    100: '#b3d9ff',
    200: '#80bfff',
    300: '#4da6ff',
    400: '#1a8cff',
    500: '#0073e6', // Cor principal
    600: '#005bb3',
    700: '#004280',
    800: '#00294d',
    900: '#00101a',
  },
  
  // Cores de status
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Cores da sidebar
  sidebar: {
    gray: '#1a202c',      // gray.800
    blue: '#2c5282',      // blue.800
    green: '#276749',     // green.800
    purple: '#553c9a',    // purple.800
    red: '#9b2c2c',       // red.800
    orange: '#c05621',    // orange.800
    teal: '#234e52',      // teal.800
    cyan: '#0e7490',      // cyan.800
  },
  
  // Cores neutras
  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
  },
  
  // Cores de fundo
  background: {
    light: '#ffffff',
    dark: '#1a202c',
    sidebar: '#1a202c', // padrão
    card: '#ffffff',
    cardHover: '#f9fafb',
  },
  
  // Cores de texto
  text: {
    primary: '#1a202c',
    secondary: '#4b5563',
    tertiary: '#6b7280',
    inverse: '#ffffff',
    disabled: '#9ca3af',
  },
  
  // Cores de borda
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
  },
  
  // Cores para avatares (estilo Google Material Design)
  avatar: {
    blue: '#4285F4',
    green: '#34A853',
    red: '#EA4335',
    yellow: '#FBBC04',
    orange: '#FF6D01',
    purple: '#9334E6',
    redVariant: '#E94235',
    blueVariant: '#1A73E8',
    greenVariant: '#137333',
    blueDark: '#1967D2',
  },
};

// Mapeamento de cores da sidebar para valores do Chakra UI
export const sidebarColorMap: Record<string, string> = {
  'gray.800': libraryColors.sidebar.gray,
  'blue.800': libraryColors.sidebar.blue,
  'green.800': libraryColors.sidebar.green,
  'purple.800': libraryColors.sidebar.purple,
  'red.800': libraryColors.sidebar.red,
  'orange.800': libraryColors.sidebar.orange,
  'teal.800': libraryColors.sidebar.teal,
  'cyan.800': libraryColors.sidebar.cyan,
};

// Opções de cores da sidebar para o seletor
export const sidebarColorOptions = [
  { value: 'gray.800', label: 'Padrão', color: libraryColors.sidebar.gray },
  { value: 'blue.800', label: 'Azul', color: libraryColors.sidebar.blue },
  { value: 'green.800', label: 'Verde', color: libraryColors.sidebar.green },
  { value: 'purple.800', label: 'Roxo', color: libraryColors.sidebar.purple },
  { value: 'red.800', label: 'Vermelho', color: libraryColors.sidebar.red },
  { value: 'orange.800', label: 'Laranja', color: libraryColors.sidebar.orange },
  { value: 'teal.800', label: 'Verde-azulado', color: libraryColors.sidebar.teal },
  { value: 'cyan.800', label: 'Ciano', color: libraryColors.sidebar.cyan },
];

// Cores para avatares (array para uso no componente Avatar)
export const avatarColors = [
  { bg: libraryColors.avatar.blue, text: '#FFFFFF' },
  { bg: libraryColors.avatar.green, text: '#FFFFFF' },
  { bg: libraryColors.avatar.red, text: '#FFFFFF' },
  { bg: libraryColors.avatar.yellow, text: '#202124' },
  { bg: libraryColors.avatar.orange, text: '#FFFFFF' },
  { bg: libraryColors.avatar.purple, text: '#FFFFFF' },
  { bg: libraryColors.avatar.redVariant, text: '#FFFFFF' },
  { bg: libraryColors.avatar.blueVariant, text: '#FFFFFF' },
  { bg: libraryColors.avatar.greenVariant, text: '#FFFFFF' },
  { bg: libraryColors.avatar.blueDark, text: '#FFFFFF' },
];

