import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  HStack,
  useDisclosure,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  Text,
  Button as ChakraButton,
  Tooltip,
} from '@chakra-ui/react';
import { Button } from '../../components/Button/Button';
import { Avatar } from '../../components/Avatar/Avatar';
import { EditIcon, DeleteIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { settingService } from '../../services/settingService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../../components/Modal/Modal';
import { UserForm } from './UserForm';
import { User } from '../../types';
import { CameraCapture } from '../../components/CameraCapture/CameraCapture';
import { compressImage } from '../../utils/imageCompression';
import { sidebarColorOptions } from '../../theme/colors';
import { FaCamera, FaPlus, FaUpload } from 'react-icons/fa';
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { Loading } from '../../components/Loading/Loading';
import { backupService, Backup } from '../../services/backupService';
import { FaDownload, FaTrash, FaHistory } from 'react-icons/fa';

export const Settings = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [maxLoans, setMaxLoans] = useState(5);
  const [loanDuration, setLoanDuration] = useState(14);
  const [libraryName, setLibraryName] = useState('Biblioteca');
  const [libraryLogo, setLibraryLogo] = useState<string | null>(null);
  const [sidebarColor, setSidebarColor] = useState('gray.800');
  const queryClient = useQueryClient();
  const { isOpen: isUserFormOpen, onOpen: onUserFormOpen, onClose: onUserFormClose } = useDisclosure();
  const { isOpen: isCameraOpen, onOpen: onCameraOpen, onClose: onCameraClose } = useDisclosure();
  const { isOpen: isActivateConfirmOpen, onOpen: onActivateConfirmOpen, onClose: onActivateConfirmClose } = useDisclosure();
  const { isOpen: isDeactivateConfirmOpen, onOpen: onDeactivateConfirmOpen, onClose: onDeactivateConfirmClose } = useDisclosure();
  const { isOpen: isDeleteConfirmOpen, onOpen: onDeleteConfirmOpen, onClose: onDeleteConfirmClose } = useDisclosure();
  const { isOpen: isRestoreConfirmOpen, onOpen: onRestoreConfirmOpen, onClose: onRestoreConfirmClose } = useDisclosure();
  const { isOpen: isDeleteBackupConfirmOpen, onOpen: onDeleteBackupConfirmOpen, onClose: onDeleteBackupConfirmClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToAction, setUserToAction] = useState<User | null>(null);
  const [backupToAction, setBackupToAction] = useState<Backup | null>(null);

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.findAll(),
    enabled: isAdmin,
  });

  const { data: backups, isLoading: isLoadingBackups, refetch: refetchBackups } = useQuery({
    queryKey: ['backups'],
    queryFn: () => backupService.list(),
    enabled: isAdmin,
  });

  const activateUserMutation = useMutation({
    mutationFn: (id: string) => userService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Usuário reativado',
        description: 'O usuário foi reativado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível reativar o usuário.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: (id: string) => userService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Usuário inativado',
        description: 'O usuário foi inativado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível inativar o usuário.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Usuário excluído',
        description: 'O usuário foi excluído permanentemente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o usuário.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingService.find(),
  });

  useEffect(() => {
    if (settings) {
      setMaxLoans(settings.max_loans_per_client);
      setLoanDuration(settings.loan_duration_days);
      setLibraryName(settings.library_name || 'Biblioteca');
      setLibraryLogo(settings.library_logo || null);
      setSidebarColor(settings.sidebar_color || 'gray.800');
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: { max_loans_per_client?: number; loan_duration_days?: number; library_name?: string; library_logo?: string | null; sidebar_color?: string }) =>
      settingService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({
        title: 'Configurações atualizadas',
        description: 'As configurações foram atualizadas com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Não foi possível atualizar as configurações.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Erro',
          description: 'A imagem é muito grande. Por favor, escolha uma imagem menor que 10MB.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const compressed = await compressImage(base64, 800, 800, 0.6);
        setLibraryLogo(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async (imageData: string) => {
    const compressed = await compressImage(imageData, 800, 800, 0.6);
    setLibraryLogo(compressed);
  };

  const removeLogo = () => {
    setLibraryLogo(null);
  };

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (updateMutation.isPending) {
      return;
    }
    
    if (!isAdmin) {
      return;
    }
    
    const updateData: { library_name?: string; library_logo?: string | null; sidebar_color?: string } = {
      library_name: libraryName,
      library_logo: libraryLogo,
      sidebar_color: sidebarColor,
    };
    
    updateMutation.mutate(updateData);
  };

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (updateMutation.isPending) {
      return;
    }
    
    const updateData: { max_loans_per_client: number; loan_duration_days: number } = {
      max_loans_per_client: maxLoans,
      loan_duration_days: loanDuration,
    };
    
    updateMutation.mutate(updateData);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    onUserFormOpen();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    onUserFormOpen();
  };

  const handleActivateUser = (user: User) => {
    setUserToAction(user);
    onActivateConfirmOpen();
  };

  const handleDeactivateUser = (user: User) => {
    setUserToAction(user);
    onDeactivateConfirmOpen();
  };

  const handleDeleteUser = (user: User) => {
    setUserToAction(user);
    onDeleteConfirmOpen();
  };

  const handleConfirmActivate = () => {
    if (userToAction) {
      activateUserMutation.mutate(userToAction.id);
      setUserToAction(null);
    }
  };

  const handleConfirmDeactivate = () => {
    if (userToAction) {
      deactivateUserMutation.mutate(userToAction.id);
      setUserToAction(null);
    }
  };

  const handleConfirmDelete = () => {
    if (userToAction) {
      deleteUserMutation.mutate(userToAction.id);
      setUserToAction(null);
    }
  };

  const handleUserFormClose = () => {
    setEditingUser(null);
    onUserFormClose();
  };

  const createBackupMutation = useMutation({
    mutationFn: () => backupService.create(),
    onSuccess: () => {
      refetchBackups();
      toast({
        title: 'Backup criado',
        description: 'O backup foi criado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o backup.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const restoreBackupMutation = useMutation({
    mutationFn: (filename: string) => backupService.restore(filename),
    onSuccess: () => {
      refetchBackups();
      onRestoreConfirmClose();
      toast({
        title: 'Backup restaurado',
        description: 'O backup foi restaurado com sucesso. A página será recarregada.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível restaurar o backup.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const deleteBackupMutation = useMutation({
    mutationFn: (filename: string) => backupService.delete(filename),
    onSuccess: () => {
      refetchBackups();
      onDeleteBackupConfirmClose();
      setBackupToAction(null);
      toast({
        title: 'Backup excluído',
        description: 'O backup foi excluído com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o backup.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleCreateBackup = () => {
    createBackupMutation.mutate();
  };

  const handleRestoreBackup = (backup: Backup) => {
    setBackupToAction(backup);
    onRestoreConfirmOpen();
  };

  const handleDeleteBackup = (backup: Backup) => {
    setBackupToAction(backup);
    onDeleteBackupConfirmOpen();
  };

  const handleConfirmRestore = () => {
    if (backupToAction) {
      restoreBackupMutation.mutate(backupToAction.filename);
    }
  };

  const handleConfirmDeleteBackup = () => {
    if (backupToAction) {
      deleteBackupMutation.mutate(backupToAction.filename);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <Heading>Configurações</Heading>

        {isAdmin && (
          <>
            <Box>
              <HStack justify="space-between" mb={4}>
                <Heading size="md">Gerenciar Usuários</Heading>
                <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={handleCreateUser}>
                  Criar Novo Usuário
                </Button>
              </HStack>

              {isLoadingUsers ? (
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
                        <Th>Função</Th>
                        <Th>Status</Th>
                        <Th>Ações</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users?.map((user) => (
                        <Tr key={user.id}>
                          <Td>
                            <Avatar name={user.name} photo={user.photo} size={50} />
                          </Td>
                          <Td>{user.name}</Td>
                          <Td>{user.cpf}</Td>
                          <Td>{user.email || '-'}</Td>
                          <Td>{user.phone}</Td>
                          <Td>
                            <Badge colorScheme={user.role === 'ADMIN' ? 'purple' : 'blue'}>
                              {user.role}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme={user.active ? 'green' : 'red'}>
                              {user.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack>
                              <Tooltip label="Editar usuário" placement="top">
                                <IconButton
                                  aria-label="Editar usuário"
                                  icon={<EditIcon />}
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                />
                              </Tooltip>
                              <Menu placement="bottom-end" strategy="fixed" offset={[0, 8]}>
                                <MenuButton
                                  as={ChakraButton}
                                  rightIcon={<ChevronDownIcon />}
                                  size="sm"
                                  colorScheme="red"
                                  isLoading={
                                    activateUserMutation.isPending ||
                                    deactivateUserMutation.isPending ||
                                    deleteUserMutation.isPending
                                  }
                                >
                                  Ações
                                </MenuButton>
                                <MenuList>
                                  {user.active ? (
                                    <MenuItem
                                      icon={<DeleteIcon />}
                                      onClick={() => handleDeactivateUser(user)}
                                    >
                                      Inativar
                                    </MenuItem>
                                  ) : (
                                    <MenuItem
                                      onClick={() => handleActivateUser(user)}
                                    >
                                      Reativar
                                    </MenuItem>
                                  )}
                                  <MenuItem
                                    icon={<DeleteIcon />}
                                    color="red.500"
                                    onClick={() => handleDeleteUser(user)}
                                  >
                                    Excluir Permanentemente
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </Box>
            <Divider />
          </>
        )}

        {isAdmin && (
          <>
            <Box>
              <Heading size="md" mb={4}>
                Configurações Gerais
              </Heading>
              <Box as="form" onSubmit={handleGeneralSubmit}>
                <VStack spacing={4} align="stretch" maxW="500px">
                  <FormControl>
                    <FormLabel>Logo da Biblioteca (opcional)</FormLabel>
                    <VStack spacing={3} align="stretch">
                      {libraryLogo ? (
                        <Box position="relative" w="200px" h="200px">
                          <Image
                            src={libraryLogo}
                            alt="Logo da biblioteca"
                            w="200px"
                            h="200px"
                            objectFit="cover"
                            borderRadius="md"
                            border="2px solid"
                            borderColor="gray.200"
                          />
                          <Button
                            size="xs"
                            colorScheme="red"
                            position="absolute"
                            top={2}
                            right={2}
                            onClick={removeLogo}
                          >
                            Remover
                          </Button>
                        </Box>
                      ) : (
                        <Box
                          w="200px"
                          h="200px"
                          border="2px dashed"
                          borderColor="gray.300"
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          bg="gray.50"
                        >
                          <VStack spacing={2}>
                            <Box fontSize="3xl">📚</Box>
                            <Box fontSize="xs" color="gray.500" textAlign="center">
                              Sem logo
                            </Box>
                          </VStack>
                        </Box>
                      )}
                      <HStack>
                        <Button leftIcon={<FaCamera />} size="sm" onClick={onCameraOpen}>
                          Tirar Foto
                        </Button>
                        <Button leftIcon={<FaUpload />} size="sm" as="label" htmlFor="logo-upload" cursor="pointer">
                          Upload
                          <Input
                            type="file"
                            id="logo-upload"
                            accept="image/*"
                            onChange={handleFileUpload}
                            display="none"
                          />
                        </Button>
                      </HStack>
                    </VStack>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Nome da Biblioteca</FormLabel>
                    <Input
                      type="text"
                      value={libraryName}
                      onChange={(e) => setLibraryName(e.target.value)}
                      placeholder="Biblioteca"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Cor da Sidebar</FormLabel>
                    <HStack spacing={3} flexWrap="wrap">
                      {sidebarColorOptions.map((option) => (
                        <VStack
                          key={option.value}
                          spacing={1}
                          cursor="pointer"
                          onClick={() => setSidebarColor(option.value)}
                          opacity={sidebarColor === option.value ? 1 : 0.6}
                          _hover={{ opacity: 1, transform: 'scale(1.1)' }}
                          transition="all 0.2s"
                        >
                          <Box
                            w="40px"
                            h="40px"
                            borderRadius="full"
                            bg={option.color}
                            border="3px solid"
                            borderColor={sidebarColor === option.value ? 'blue.500' : 'transparent'}
                            boxShadow={sidebarColor === option.value ? 'lg' : 'md'}
                            transition="all 0.2s"
                          />
                          <Text fontSize="xs" textAlign="center" fontWeight={sidebarColor === option.value ? 'bold' : 'normal'}>
                            {option.label}
                          </Text>
                        </VStack>
                      ))}
                    </HStack>
                  </FormControl>

                  <HStack>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      isLoading={updateMutation.isPending}
                    >
                      Salvar Configurações Gerais
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </Box>
            <Divider />
          </>
        )}

        <Box>
          <Heading size="md" mb={4}>
            Configurações de Empréstimos
          </Heading>
          <Box as="form" onSubmit={handleLoanSubmit}>
            <VStack spacing={4} align="stretch" maxW="500px">
              <FormControl>
                <FormLabel>Máximo de Empréstimos por Cliente</FormLabel>
                <Input
                  type="number"
                  value={maxLoans}
                  onChange={(e) => setMaxLoans(Number(e.target.value))}
                  min={1}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Prazo de Empréstimo (dias)</FormLabel>
                <Input
                  type="number"
                  value={loanDuration}
                  onChange={(e) => setLoanDuration(Number(e.target.value))}
                  min={1}
                />
              </FormControl>

              <HStack>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={updateMutation.isPending}
                >
                  Salvar Configurações de Empréstimos
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>

        {isAdmin && (
          <>
            <Divider />
            <Box>
              <HStack justify="space-between" mb={4}>
                <Heading size="md">Backup e Restauração</Heading>
                <Button
                  leftIcon={<FaDownload />}
                  colorScheme="green"
                  onClick={handleCreateBackup}
                  isLoading={createBackupMutation.isPending}
                >
                  Criar Backup
                </Button>
              </HStack>

              <Box mb={4}>
                <Text color="gray.600" fontSize="sm">
                  Um backup automático é criado ao iniciar o servidor (uma vez por dia). Os backups antigos (mais de 30 dias) são removidos automaticamente.
                </Text>
              </Box>

              {isLoadingBackups ? (
                <Loading size="small" />
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Data de Criação</Th>
                        <Th>Nome do Arquivo</Th>
                        <Th>Tamanho</Th>
                        <Th>Ações</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {backups && backups.length > 0 ? (
                        backups.map((backup) => (
                          <Tr key={backup.filename}>
                            <Td>{formatDate(backup.created_at)}</Td>
                            <Td>
                              <Text fontFamily="mono" fontSize="sm">
                                {backup.filename}
                              </Text>
                            </Td>
                            <Td>{formatFileSize(backup.size)}</Td>
                            <Td>
                              <HStack spacing={2}>
                                <Tooltip label="Restaurar backup">
                                  <IconButton
                                    aria-label="Restaurar backup"
                                    icon={<FaHistory />}
                                    colorScheme="blue"
                                    size="sm"
                                    onClick={() => handleRestoreBackup(backup)}
                                  />
                                </Tooltip>
                                <Tooltip label="Excluir backup">
                                  <IconButton
                                    aria-label="Excluir backup"
                                    icon={<FaTrash />}
                                    colorScheme="red"
                                    size="sm"
                                    onClick={() => handleDeleteBackup(backup)}
                                  />
                                </Tooltip>
                              </HStack>
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={4} textAlign="center" color="gray.500">
                            Nenhum backup encontrado
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </Box>
          </>
        )}

        <Modal
          isOpen={isUserFormOpen}
          onClose={handleUserFormClose}
          title={editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
          showFooter={false}
        >
          <UserForm
            user={editingUser}
            onClose={handleUserFormClose}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['users'] });
              handleUserFormClose();
            }}
          />
        </Modal>

        <CameraCapture
          isOpen={isCameraOpen}
          onClose={onCameraClose}
          onCapture={handleCameraCapture}
        />

        <ConfirmModal
          isOpen={isActivateConfirmOpen}
          onClose={onActivateConfirmClose}
          onConfirm={handleConfirmActivate}
          title="Reativar Usuário"
          message={userToAction ? `Deseja reativar o usuário ${userToAction.name}?` : ''}
          confirmLabel="Reativar"
          cancelLabel="Cancelar"
          isLoading={activateUserMutation.isPending}
        />

        <ConfirmModal
          isOpen={isDeactivateConfirmOpen}
          onClose={onDeactivateConfirmClose}
          onConfirm={handleConfirmDeactivate}
          title="Inativar Usuário"
          message={userToAction ? `Deseja inativar o usuário ${userToAction.name}?` : ''}
          confirmLabel="Inativar"
          cancelLabel="Cancelar"
          isLoading={deactivateUserMutation.isPending}
        />

        <ConfirmModal
          isOpen={isDeleteConfirmOpen}
          onClose={onDeleteConfirmClose}
          onConfirm={handleConfirmDelete}
          title="Excluir Usuário Permanentemente"
          message={userToAction ? `ATENÇÃO: Esta ação é permanente e não pode ser desfeita!\n\nTem certeza que deseja excluir permanentemente o usuário ${userToAction.name}?` : ''}
          confirmLabel="Excluir Permanentemente"
          cancelLabel="Cancelar"
          isLoading={deleteUserMutation.isPending}
        />

        <ConfirmModal
          isOpen={isRestoreConfirmOpen}
          onClose={onRestoreConfirmClose}
          onConfirm={handleConfirmRestore}
          title="Restaurar Backup"
          message={backupToAction ? `ATENÇÃO: Esta ação irá substituir o banco de dados atual pelo backup selecionado.\n\nUm backup do estado atual será criado antes da restauração.\n\nTem certeza que deseja restaurar o backup ${backupToAction.filename}?` : ''}
          confirmLabel="Restaurar"
          cancelLabel="Cancelar"
          isLoading={restoreBackupMutation.isPending}
        />

        <ConfirmModal
          isOpen={isDeleteBackupConfirmOpen}
          onClose={onDeleteBackupConfirmClose}
          onConfirm={handleConfirmDeleteBackup}
          title="Excluir Backup"
          message={backupToAction ? `Tem certeza que deseja excluir o backup ${backupToAction.filename}?\n\nEsta ação não pode ser desfeita.` : ''}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          isLoading={deleteBackupMutation.isPending}
        />

        {/* Rodapé */}
        <Box mt={8} pt={4} borderTop="1px solid" borderColor="gray.200">
          <Text fontSize="xs" color="gray.500" textAlign="center">
            Por{' '}
            <Text
              as="a"
              href="https://marleo-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              color="gray.600"
              _hover={{ color: 'blue.500', textDecoration: 'underline' }}
              cursor="pointer"
            >
              Márleo Piber da Rosa
            </Text>
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

