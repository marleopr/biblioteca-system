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
  Select,
  Image,
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useToast,
  Tooltip,
} from '@chakra-ui/react';
import { Button } from '../../components/Button/Button';
import { EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { bookService } from '../../services/bookService';
import { categoryService } from '../../services/categoryService';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../../components/Modal/Modal';
import { BookForm } from './BookForm';
import { BookHistory } from './BookHistory';
import { FaPlus } from 'react-icons/fa';
import { Pagination } from '../../components/Pagination/Pagination';
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { Loading } from '../../components/Loading/Loading';

export const Books = () => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const debouncedSearch = useDebounce(search);
  const debouncedAuthorFilter = useDebounce(authorFilter);
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, debouncedAuthorFilter, categoryFilter]);

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const { isOpen: isCoverModalOpen, onOpen: onCoverModalOpen, onClose: onCoverModalClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [selectedCover, setSelectedCover] = useState<string | null>(null);
  const [selectedBookTitle, setSelectedBookTitle] = useState<string>('');
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);

  const { data: booksData, isLoading } = useQuery({
    queryKey: ['books', debouncedSearch, debouncedAuthorFilter, categoryFilter, page, itemsPerPage],
    queryFn: () =>
      bookService.findAll(
        debouncedSearch || undefined,
        undefined, // authorId - não usado mais
        debouncedAuthorFilter || undefined, // authorName
        categoryFilter || undefined,
        page,
        itemsPerPage
      ),
  });

  const books = booksData?.data || [];
  const totalItems = booksData?.total || 0;
  const totalPages = booksData?.totalPages || 1;

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.findAll(),
  });
  const categories = categoriesData?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bookService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({
        title: 'Livro excluído',
        description: 'O livro foi excluído com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o livro.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleCreate = () => {
    setEditingBook(null);
    onFormOpen();
  };

  const handleEdit = (book: any) => {
    setEditingBook(book);
    onFormOpen();
  };

  const handleViewHistory = (bookId: string) => {
    setSelectedBook(bookId);
    onHistoryOpen();
  };

  const handleDelete = (id: string) => {
    setBookToDelete(id);
    onConfirmOpen();
  };

  const handleConfirmDelete = () => {
    if (bookToDelete) {
      deleteMutation.mutate(bookToDelete);
      setBookToDelete(null);
    }
  };

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Heading>Livros</Heading>
          <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={handleCreate}>
            Novo Livro
          </Button>
        </HStack>

        <HStack spacing={4}>
          <Input
            placeholder="Buscar por título, ISBN, código de barras ou número de inventário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxW="400px"
          />
          <Input
            placeholder="Filtrar por autor"
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            maxW="200px"
          />
          <Select
            placeholder="Filtrar por categoria"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            maxW="200px"
          >
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </HStack>

        {isLoading ? (
          <Loading size="small" />
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Capa</Th>
                  <Th>Título</Th>
                  <Th>ISBN</Th>
                  <Th>Código de Barras</Th>
                  <Th>Número de Inventário</Th>
                  <Th>Autor</Th>
                  <Th>Categoria</Th>
                  <Th>Disponível</Th>
                  <Th>Total</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {books.map((book) => (
                  <Tr key={book.id}>
                    <Td>
                      {book.photo ? (
                        <Box
                          cursor="pointer"
                          onClick={() => {
                            setSelectedCover(book.photo || null);
                            setSelectedBookTitle(book.title);
                            onCoverModalOpen();
                          }}
                          _hover={{ opacity: 0.8, transform: 'scale(1.05)' }}
                          transition="all 0.2s"
                          display="inline-block"
                        >
                          <Image
                            src={book.photo}
                            alt={book.title}
                            w="60px"
                            h="90px"
                            objectFit="cover"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                          />
                        </Box>
                      ) : (
                        <Box
                          w="60px"
                          h="90px"
                          bg="gray.200"
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          border="1px solid"
                          borderColor="gray.300"
                        >
                          <Box fontSize="xl">📚</Box>
                        </Box>
                      )}
                    </Td>
                    <Td>{book.title}</Td>
                    <Td>{book.isbn || '-'}</Td>
                    <Td>{book.barcode || '-'}</Td>
                    <Td>{book.inventory_number || '-'}</Td>
                    <Td>{book.author_name}</Td>
                    <Td>{book.category_name}</Td>
                    <Td>{book.available_quantity}</Td>
                    <Td>{book.total_quantity}</Td>
                    <Td>
                      <HStack>
                        <Tooltip label="Ver histórico" placement="top">
                          <IconButton
                            aria-label="Ver histórico"
                            icon={<ViewIcon />}
                            size="sm"
                            onClick={() => handleViewHistory(book.id)}
                          />
                        </Tooltip>
                        <Tooltip label="Editar livro" placement="top">
                          <IconButton
                            aria-label="Editar"
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => handleEdit(book)}
                          />
                        </Tooltip>
                        {isAdmin && (
                          <Tooltip label="Excluir livro" placement="top">
                            <IconButton
                              aria-label="Excluir"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDelete(book.id)}
                            />
                          </Tooltip>
                        )}
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
            onItemsPerPageChange={(newLimit: number) => {
              setItemsPerPage(newLimit);
              setPage(1);
            }}
          />
        )}

        <Modal
          isOpen={isFormOpen}
          onClose={onFormClose}
          title={editingBook ? 'Editar Livro' : 'Novo Livro'}
          showFooter={false}
          size="4xl"
        >
          <BookForm
            book={editingBook}
            onClose={onFormClose}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['books'] });
              onFormClose();
            }}
          />
        </Modal>

        <Modal
          isOpen={isHistoryOpen}
          onClose={onHistoryClose}
          title="Histórico de Empréstimos"
          showFooter={false}
        >
          {selectedBook && <BookHistory bookId={selectedBook} />}
        </Modal>

        <ChakraModal isOpen={isCoverModalOpen} onClose={onCoverModalClose} size="md" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalBody p={6}>
              <VStack spacing={4}>
                <Heading size="md">{selectedBookTitle}</Heading>
                {selectedCover && (
                  <Image
                    src={selectedCover}
                    alt={selectedBookTitle}
                    maxW="300px"
                    maxH="450px"
                    objectFit="contain"
                    borderRadius="md"
                  />
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </ChakraModal>

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={onConfirmClose}
          onConfirm={handleConfirmDelete}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este livro?"
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          isLoading={deleteMutation.isPending}
        />
      </VStack>
    </Box>
  );
};

