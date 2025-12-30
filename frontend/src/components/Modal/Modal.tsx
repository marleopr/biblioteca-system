import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  ModalProps as ChakraModalProps,
} from '@chakra-ui/react';
import { ReactNode } from 'react';

interface ModalProps extends Omit<ChakraModalProps, 'children'> {
  title: string;
  children: ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  showFooter?: boolean;
}

export const Modal = ({
  title,
  children,
  onConfirm,
  confirmLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  showFooter = true,
  ...props
}: ModalProps) => {
  return (
    <ChakraModal {...props}>
      <ModalOverlay />
      <ModalContent maxW={props.size === '4xl' ? '900px' : undefined} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody onClick={(e) => e.stopPropagation()}>{children}</ModalBody>
        {showFooter && (
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={props.onClose}>
              {cancelLabel}
            </Button>
            {onConfirm && (
              <Button colorScheme="blue" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            )}
          </ModalFooter>
        )}
      </ModalContent>
    </ChakraModal>
  );
};

