import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { ReactElement } from 'react';

export interface ButtonProps extends Omit<ChakraButtonProps, 'leftIcon' | 'rightIcon'> {
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
  icon?: ReactElement; // Ícone genérico (será posicionado à esquerda por padrão)
  htmlFor?: string; // Para quando usado como label
}

export const Button = ({ 
  leftIcon, 
  rightIcon, 
  icon,
  children, 
  ...props 
}: ButtonProps) => {
  // Se icon for fornecido sem leftIcon/rightIcon, usa como leftIcon
  const finalLeftIcon = leftIcon || icon;
  
  return (
    <ChakraButton
      leftIcon={finalLeftIcon}
      rightIcon={rightIcon}
      {...props}
    >
      {children}
    </ChakraButton>
  );
};
