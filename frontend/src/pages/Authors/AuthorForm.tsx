import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { Button } from '../../components/Button/Button';
import { authorService } from '../../services/authorService';
import { Author } from '../../types';

interface AuthorFormProps {
  author?: Author | null;
  onClose: () => void;
  onSuccess: (createdAuthorId?: string) => void;
}

export const AuthorForm = ({ author, onClose, onSuccess }: AuthorFormProps) => {
  const toast = useToast();
  const [name, setName] = useState('');

  useEffect(() => {
    if (author) {
      setName(author.name);
    }
  }, [author]);

  const createMutation = useMutation({
    mutationFn: (data: any) => authorService.create(data),
    onSuccess: (createdAuthor) => {
      toast({
        title: 'Autor criado',
        description: 'O autor foi criado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess(createdAuthor.id);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Não foi possível criar o autor.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => authorService.update(id, data),
    onSuccess: () => {
      toast({
        title: 'Autor atualizado',
        description: 'O autor foi atualizado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Não foi possível atualizar o autor.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevenir propagação para o form pai
    const data = { name };

    if (author) {
      updateMutation.mutate({ id: author.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Nome</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormControl>

        <HStack w="100%" justify="flex-end">
          <Button type="button" onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {author ? 'Atualizar' : 'Criar'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

