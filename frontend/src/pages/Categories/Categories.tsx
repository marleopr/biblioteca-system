import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  VStack,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  HStack,
  useToast,
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  UnorderedList,
  ListItem,
  Tooltip,
} from '@chakra-ui/react';
import { Button } from '../../components/Button/Button';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { categoryService } from '../../services/categoryService';
import { useDebounce } from '../../hooks/useDebounce';
import { Modal } from '../../components/Modal/Modal';
import { CategoryForm } from './CategoryForm';
import { FaPlus } from 'react-icons/fa';
import { Pagination } from '../../components/Pagination/Pagination';
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { Loading } from '../../components/Loading/Loading';
import { BookCountTooltip } from './BookCountTooltip';

export const Categories = () => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const { isOpen: isBooksModalOpen, onOpen: onBooksModalOpen, onClose: onBooksModalClose } = useDisclosure();
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [associatedBooks, setAssociatedBooks] = useState<Array<{ id: string; title: string }>>([]);

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories', debouncedSearch, page, itemsPerPage],
    queryFn: () => categoryService.findAll(debouncedSearch || undefined, page, itemsPerPage),
  });

  const categories = categoriesData?.data || [];
  const totalItems = categoriesData?.total || 0;
  const totalPages = categoriesData?.totalPages || 1;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Categoria excluída',
        description: 'A categoria foi excluída com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Não foi possível excluir a categoria.';
      const books = error.response?.data?.data?.books;
      
      if (books && books.length > 0) {
        // Se houver livros associados, mostra modal com a lista
        setAssociatedBooks(books);
        onBooksModalOpen();
      } else {
        // Caso contrário, mostra toast de erro genérico
        toast({
          title: 'Erro',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const handleCreate = () => {
    setEditingCategory(null);
    onFormOpen();
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    onFormOpen();
  };

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
    onConfirmOpen();
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete);
      setCategoryToDelete(null);
    }
  };

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Heading>Categorias</Heading>
          <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={handleCreate}>
            Nova Categoria
          </Button>
        </HStack>

        <Input
          placeholder="Buscar categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW="300px"
        />

        {isLoading ? (
          <Loading size="small" />
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Livros</Th>
                  <Th textAlign="right">Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categories.map((category) => (
                  <Tr key={category.id}>
                    <Td>{category.name}</Td>
                    <Td>
                      <BookCountTooltip categoryId={category.id} bookCount={category.book_count || 0} />
                    </Td>
                    <Td textAlign="right">
                      <HStack justify="flex-end">
                        <Tooltip label="Editar categoria" placement="top">
                          <IconButton
                            aria-label="Editar"
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => handleEdit(category)}
                          />
                        </Tooltip>
                        <Tooltip label="Excluir categoria" placement="top">
                          <IconButton
                            aria-label="Excluir"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDelete(category.id)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {!isLoading && totalItems > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setPage}
            onItemsPerPageChange={(newLimit) => {
              setItemsPerPage(newLimit);
              setPage(1);
            }}
          />
        )}

        <Modal
          isOpen={isFormOpen}
          onClose={onFormClose}
          title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
          showFooter={false}
        >
          <CategoryForm
            category={editingCategory}
            onClose={onFormClose}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['categories'] });
              onFormClose();
            }}
          />
        </Modal>

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={onConfirmClose}
          onConfirm={handleConfirmDelete}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir esta categoria?"
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          isLoading={deleteMutation.isPending}
        />

        <ChakraModal isOpen={isBooksModalOpen} onClose={onBooksModalClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Não é possível excluir a categoria</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text mb={4}>
                Esta categoria não pode ser excluída pois possui {associatedBooks.length} livro{associatedBooks.length > 1 ? 's' : ''} associado{associatedBooks.length > 1 ? 's' : ''}:
              </Text>
              <UnorderedList spacing={2}>
                {associatedBooks.map((book) => (
                  <ListItem key={book.id}>{book.title}</ListItem>
                ))}
              </UnorderedList>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onBooksModalClose}>Fechar</Button>
            </ModalFooter>
          </ModalContent>
        </ChakraModal>
      </VStack>
    </Box>
  );
};

