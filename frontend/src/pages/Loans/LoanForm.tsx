import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FormControl,
  FormLabel,
  Select,
  VStack,
  HStack,
  useDisclosure,
  Box,
  useToast,
} from '@chakra-ui/react';
import { Button } from '../../components/Button/Button';
import { loanService } from '../../services/loanService';
import { ClientSearch } from '../../components/ClientSearch/ClientSearch';
import { BookSearch } from '../../components/BookSearch/BookSearch';
import { Modal } from '../../components/Modal/Modal';
import { ClientForm } from '../Clients/ClientForm';

interface LoanFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const LoanForm = ({ onClose, onSuccess }: LoanFormProps) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [clientId, setClientId] = useState('');
  const [bookId, setBookId] = useState('');
  const [condition, setCondition] = useState<'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED'>('GOOD');
  const { isOpen: isClientFormOpen, onOpen: onClientFormOpen, onClose: onClientFormClose } = useDisclosure();

  const createMutation = useMutation({
    mutationFn: (data: any) => loanService.create(data),
    onSuccess: () => {
      toast({
        title: 'Empréstimo criado',
        description: 'O empréstimo foi criado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Não foi possível criar o empréstimo.';
      
      // Verifica se o erro é sobre limite de empréstimos
      let title = 'Erro';
      let description = errorMessage;
      
      if (errorMessage.includes('maximum loan limit') || errorMessage.includes('limite máximo')) {
        title = 'Limite de Empréstimos Atingido';
        description = 'Este cliente atingiu o limite máximo de empréstimos permitidos. É necessário devolver algum livro antes de realizar um novo empréstimo.';
      }
      
      toast({
        title,
        description,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleClientFormSuccess = (newClientId?: string) => {
    // Invalida as queries de clientes para atualizar a lista de busca
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['clients-search'] });
    onClientFormClose();
    // Se um novo cliente foi criado, seleciona automaticamente
    if (newClientId) {
      setClientId(newClientId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validação: só submete se cliente e livro estiverem selecionados
    if (!clientId || !bookId) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um cliente e um livro.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    createMutation.mutate({
      client_id: clientId,
      book_id: bookId,
      condition_on_loan: condition,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Cliente</FormLabel>
          <HStack spacing={2}>
            <Box flex={1}>
              <ClientSearch
                value={clientId}
                onChange={setClientId}
                onNewClient={onClientFormOpen}
              />
            </Box>
            <Button onClick={onClientFormOpen} colorScheme="green" size="md">
              + Novo
            </Button>
          </HStack>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Livro</FormLabel>
          <BookSearch
            value={bookId}
            onChange={setBookId}
            onlyAvailable={true}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Estado do Livro</FormLabel>
          <Select
            value={condition}
            onChange={(e) => setCondition(e.target.value as 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED')}
          >
            <option value="NEW">Novo</option>
            <option value="GOOD">Bom</option>
            <option value="FAIR">Regular</option>
            <option value="DAMAGED">Danificado</option>
          </Select>
        </FormControl>

        <HStack w="100%" justify="flex-end">
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={createMutation.isPending}
          >
            Criar Empréstimo
          </Button>
        </HStack>
      </VStack>

      <Modal
        isOpen={isClientFormOpen}
        onClose={onClientFormClose}
        title="Novo Cliente"
        showFooter={false}
        size="4xl"
      >
        <ClientForm
          client={null}
          onClose={onClientFormClose}
          onSuccess={handleClientFormSuccess}
        />
      </Modal>
    </form>
  );
};

