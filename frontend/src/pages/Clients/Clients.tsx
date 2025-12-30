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
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { clientService } from '../../services/clientService';
import { useDebounce } from '../../hooks/useDebounce';
import { Modal } from '../../components/Modal/Modal';
import { ClientForm } from './ClientForm';
import { Avatar } from '../../components/Avatar/Avatar';
import { FaPlus } from 'react-icons/fa';
import { Pagination } from '../../components/Pagination/Pagination';
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { Loading } from '../../components/Loading/Loading';

export const Clients = () => {
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
  const { isOpen: isPhotoModalOpen, onOpen: onPhotoModalOpen, onClose: onPhotoModalClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const [editingClient, setEditingClient] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients', debouncedSearch, page, itemsPerPage],
    queryFn: () => clientService.findAll(debouncedSearch || undefined, page, itemsPerPage),
  });

  const clients = clientsData?.data || [];
  const totalItems = clientsData?.total || 0;
  const totalPages = clientsData?.totalPages || 1;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Cliente excluído',
        description: 'O cliente foi excluído com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o cliente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleCreate = () => {
    setEditingClient(null);
    onFormOpen();
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    onFormOpen();
  };

  const handleDelete = (id: string) => {
    setClientToDelete(id);
    onConfirmOpen();
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      deleteMutation.mutate(clientToDelete);
      setClientToDelete(null);
    }
  };

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Heading>Clientes</Heading>
          <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={handleCreate}>
            Novo Cliente
          </Button>
        </HStack>

        <Input
          placeholder="Buscar por nome ou CPF..."
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
                  <Th>Foto</Th>
                  <Th>Nome</Th>
                  <Th>CPF</Th>
                  <Th>Email</Th>
                  <Th>Telefone</Th>
                  <Th>Endereço</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {clients.map((client) => (
                  <Tr key={client.id}>
                    <Td>
                      <Box
                        cursor={client.photo ? 'pointer' : 'default'}
                        onClick={() => {
                          if (client.photo) {
                            setSelectedPhoto(client.photo);
                            setSelectedClientName(client.name);
                            onPhotoModalOpen();
                          }
                        }}
                        _hover={client.photo ? { opacity: 0.8, transform: 'scale(1.05)' } : {}}
                        transition="all 0.2s"
                        display="inline-block"
                      >
                        <Avatar name={client.name} photo={client.photo} size={50} />
                      </Box>
                    </Td>
                    <Td>{client.name}</Td>
                    <Td>{client.cpf}</Td>
                    <Td>{client.email || '-'}</Td>
                    <Td>{client.phone}</Td>
                    <Td>
                      {client.street || client.address ? (
                        <Box>
                          {client.street && (
                            <>
                              {client.street}
                              {client.number && `, ${client.number}`}
                              {client.neighborhood && ` - ${client.neighborhood}`}
                              {client.city && `, ${client.city}`}
                              {client.state && `/${client.state}`}
                              {client.zip_code && (
                                <Box as="span" color="gray.500" fontSize="sm" ml={1}>
                                  CEP: {client.zip_code.replace(/(\d{5})(\d{3})/, '$1-$2')}
                                </Box>
                              )}
                            </>
                          )}
                          {!client.street && client.address && client.address}
                        </Box>
                      ) : (
                        '-'
                      )}
                    </Td>
                    <Td>
                      <HStack>
                        <Tooltip label="Editar cliente" placement="top">
                          <IconButton
                            aria-label="Editar"
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => handleEdit(client)}
                          />
                        </Tooltip>
                        <Tooltip label="Excluir cliente" placement="top">
                          <IconButton
                            aria-label="Excluir"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDelete(client.id)}
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
          title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
          showFooter={false}
          size="4xl"
        >
          <ClientForm
            client={editingClient}
            onClose={onFormClose}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['clients'] });
              onFormClose();
            }}
          />
        </Modal>

        <ChakraModal isOpen={isPhotoModalOpen} onClose={onPhotoModalClose} size="xl" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalBody p={6}>
              <VStack spacing={4}>
                <Heading size="md">{selectedClientName}</Heading>
                {selectedPhoto && (
                  <Image
                    src={selectedPhoto}
                    alt={selectedClientName}
                    maxW="100%"
                    maxH="70vh"
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
          message="Tem certeza que deseja excluir este cliente?"
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          isLoading={deleteMutation.isPending}
        />
      </VStack>
    </Box>
  );
};

