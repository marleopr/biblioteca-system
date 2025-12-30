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
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types';

interface CategoryFormProps {
  category?: Category | null;
  onClose: () => void;
  onSuccess: (createdCategoryId?: string) => void;
}

export const CategoryForm = ({ category, onClose, onSuccess }: CategoryFormProps) => {
  const toast = useToast();
  const [name, setName] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, [category]);

  const createMutation = useMutation({
    mutationFn: (data: any) => categoryService.create(data),
    onSuccess: (createdCategory) => {
      toast({
        title: 'Categoria criada',
        description: 'A categoria foi criada com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess(createdCategory.id);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Não foi possível criar a categoria.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoryService.update(id, data),
    onSuccess: () => {
      toast({
        title: 'Categoria atualizada',
        description: 'A categoria foi atualizada com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Não foi possível atualizar a categoria.',
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

    if (category) {
      updateMutation.mutate({ id: category.id, data });
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
            {category ? 'Atualizar' : 'Criar'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

