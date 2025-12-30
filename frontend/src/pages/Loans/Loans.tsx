import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  HStack,
  Select,
  Badge,
  Image,
  Input,
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useToast,
} from '@chakra-ui/react';
import { Button } from '../../components/Button/Button';
import { loanService } from '../../services/loanService';
import { Modal } from '../../components/Modal/Modal';
import { LoanForm } from './LoanForm';
import { ReturnLoanForm } from './ReturnLoanForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaPlus } from 'react-icons/fa';
import { Pagination } from '../../components/Pagination/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { Loading } from '../../components/Loading/Loading';

export const Loans = () => {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<'active' | 'returned' | 'overdue' | undefined>();
  const [bookSearch, setBookSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const debouncedBookSearch = useDebounce(bookSearch);
  const debouncedClientSearch = useDebounce(clientSearch);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedBookSearch, debouncedClientSearch, statusFilter]);

  const { isOpen: isLoanOpen, onOpen: onLoanOpen, onClose: onLoanClose } = useDisclosure();
  const { isOpen: isReturnOpen, onOpen: onReturnOpen, onClose: onReturnClose } = useDisclosure();
  const { isOpen: isCoverModalOpen, onOpen: onCoverModalOpen, onClose: onCoverModalClose } = useDisclosure();
  const [selectedCover, setSelectedCover] = useState<string | null>(null);
  const [selectedBookTitle, setSelectedBookTitle] = useState<string>('');

  const { data: loansData, isLoading } = useQuery({
    queryKey: ['loans', statusFilter, debouncedBookSearch, debouncedClientSearch, page, itemsPerPage],
    queryFn: () => loanService.findAll(statusFilter, page, itemsPerPage, debouncedBookSearch || undefined, debouncedClientSearch || undefined),
  });

  const loans = loansData?.data || [];
  const totalItems = loansData?.total || 0;
  const totalPages = loansData?.totalPages || 1;

  const returnMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => loanService.returnLoan(id, data),
    onSuccess: () => {
      toast({
        title: 'Livro devolvido',
        description: 'O livro foi devolvido com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      onReturnClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Não foi possível devolver o livro.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleReturn = (loanId: string) => {
    setSelectedLoan(loanId);
    onReturnOpen();
  };

  const handleReturnSubmit = (data: any) => {
    if (selectedLoan) {
      returnMutation.mutate({ id: selectedLoan, data });
    }
  };

  const isOverdue = (dueDate: string, returnDate: string | null) => {
    if (returnDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Heading>Empréstimos</Heading>
          <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={onLoanOpen}>
            Novo Empréstimo
          </Button>
        </HStack>

        <HStack spacing={4}>
          <Input
            placeholder="Buscar por livro..."
            value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value)}
            maxW="300px"
          />
          <Input
            placeholder="Buscar por cliente..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            maxW="300px"
          />
          <Select
            placeholder="Filtrar por status"
            value={statusFilter || ''}
            onChange={(e) =>
              setStatusFilter(
                e.target.value ? (e.target.value as 'active' | 'returned' | 'overdue') : undefined
              )
            }
            maxW="200px"
          >
            <option value="active">Emprestados</option>
            <option value="returned">Devolvidos</option>
            <option value="overdue">Atrasados</option>
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
                  <Th>Livro</Th>
                  <Th>Cliente</Th>
                  <Th>Data do Empréstimo</Th>
                  <Th>Vencimento</Th>
                  <Th>Devolução</Th>
                  <Th>Status</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loans.map((loan) => (
                  <Tr key={loan.id}>
                    <Td>
                      {loan.book_photo ? (
                        <Box
                          cursor="pointer"
                          onClick={() => {
                            setSelectedCover(loan.book_photo || null);
                            setSelectedBookTitle(loan.book_title || '');
                            onCoverModalOpen();
                          }}
                          _hover={{ opacity: 0.8, transform: 'scale(1.05)' }}
                          transition="all 0.2s"
                          display="inline-block"
                        >
                          <Image
                            src={loan.book_photo}
                            alt={loan.book_title}
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
                    <Td>{loan.book_title}</Td>
                    <Td>{loan.client_name}</Td>
                    <Td>
                      {format(new Date(loan.loan_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </Td>
                    <Td>
                      {format(new Date(loan.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </Td>
                    <Td>
                      {loan.return_date
                        ? format(new Date(loan.return_date), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </Td>
                    <Td>
                      {loan.return_date ? (
                        <Badge colorScheme="green">Devolvido</Badge>
                      ) : isOverdue(loan.due_date, loan.return_date) ? (
                        <Badge colorScheme="red">Atrasado</Badge>
                      ) : (
                        <Badge colorScheme="blue">Emprestado</Badge>
                      )}
                    </Td>
                    <Td>
                      {!loan.return_date && (
                        <Button size="sm" colorScheme="green" onClick={() => handleReturn(loan.id)}>
                          Devolver
                        </Button>
                      )}
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
          isOpen={isLoanOpen}
          onClose={onLoanClose}
          title="Novo Empréstimo"
          showFooter={false}
        >
          <LoanForm
            onClose={onLoanClose}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['loans'] });
              onLoanClose();
            }}
          />
        </Modal>

        <Modal
          isOpen={isReturnOpen}
          onClose={onReturnClose}
          title="Devolver Livro"
          showFooter={false}
        >
          <ReturnLoanForm onSubmit={handleReturnSubmit} onClose={onReturnClose} />
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
      </VStack>
    </Box>
  );
};

