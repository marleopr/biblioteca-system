import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  HStack,
  useToast,
  Image,
  useDisclosure,
} from '@chakra-ui/react';
import { Button } from '../../components/Button/Button';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../../components/Loading/Loading';
import { userService } from '../../services/userService';
import { validateCPF, formatCPF, validateEmail, validatePhone, formatPhone } from '../../utils/validation';
import { FormErrorMessage } from '@chakra-ui/react';
import { CameraCapture } from '../../components/CameraCapture/CameraCapture';
import { compressImage } from '../../utils/imageCompression';
import { FaCamera, FaUpload } from 'react-icons/fa';

export const Profile = () => {
  const { user, login, isAdmin } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cpfError, setCpfError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const { isOpen: isCameraOpen, onOpen: onCameraOpen, onClose: onCameraClose } = useDisclosure();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userService.getProfile(),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setCpf(userData.cpf);
      setPhone(formatPhone(userData.phone || ''));
      setAddress(userData.address);
      setEmail(userData.email || '');
      setPhoto(userData.photo || null);
    }
  }, [userData]);

  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; cpf?: string; phone?: string; address?: string; email?: string | null; password?: string; photo?: string | null }) =>
      userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Atualizar o contexto de autenticação com os novos dados
      if (user) {
        login(localStorage.getItem('token') || '', {
          id: updatedUser.id,
          name: updatedUser.name,
          cpf: updatedUser.cpf,
          role: updatedUser.role,
          photo: updatedUser.photo || null,
        });
      }
      toast({
        title: 'Perfil atualizado',
        description: 'Seus dados foram atualizados com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setPassword('');
      setConfirmPassword('');
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleCpfChange = (value: string) => {
    const cleanCPF = value.replace(/\D/g, '');
    setCpf(cleanCPF);
    
    if (cleanCPF.length === 11) {
      if (!validateCPF(cleanCPF)) {
        setCpfError('CPF inválido');
      } else {
        setCpfError('');
      }
    } else if (cleanCPF.length > 0) {
      setCpfError('CPF deve ter 11 dígitos');
    } else {
      setCpfError('');
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Email inválido');
    } else {
      setEmailError('');
    }
  };

  const handlePhoneChange = (value: string) => {
    const cleanPhone = value.replace(/\D/g, '');
    const formatted = formatPhone(cleanPhone);
    setPhone(formatted);
    
    if (cleanPhone.length === 11) {
      if (!validatePhone(cleanPhone)) {
        setPhoneError('Telefone inválido');
      } else {
        setPhoneError('');
      }
    } else if (cleanPhone.length > 0 && cleanPhone.length < 11) {
      setPhoneError('Telefone deve ter 11 dígitos (DDD + número)');
    } else {
      setPhoneError('');
    }
  };

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
        setPhoto(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async (imageData: string) => {
    const compressed = await compressImage(imageData, 800, 800, 0.6);
    setPhoto(compressed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isAdmin && cpf && !validateCPF(cpf)) {
      setCpfError('CPF inválido');
      toast({
        title: 'Erro',
        description: 'CPF inválido.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password && password !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (email && !validateEmail(email)) {
      setEmailError('Email inválido');
      toast({
        title: 'Erro',
        description: 'Email inválido.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 11) {
      setPhoneError('Telefone inválido');
      toast({
        title: 'Erro',
        description: 'Telefone deve ter 11 dígitos (DDD + número com 9 dígitos).',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!validatePhone(cleanPhone)) {
      setPhoneError('Telefone inválido');
      toast({
        title: 'Erro',
        description: 'Telefone inválido. Use o formato (XX) XXXXX-XXXX.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const updateData: { name?: string; cpf?: string; phone?: string; address?: string; email?: string | null; photo?: string | null; password?: string } = {
      name,
      phone: cleanPhone,
      address,
      email: email || null,
      photo: photo || null,
    };

    if (isAdmin && cpf) {
      updateData.cpf = cpf.replace(/\D/g, '');
    }

    if (password) {
      updateData.password = password;
    }

    updateMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <Box p={6}>
        <Loading />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <Heading>Editar Perfil</Heading>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch" maxW="600px">
            <FormControl isRequired isInvalid={!!cpfError}>
              <FormLabel>CPF</FormLabel>
              <Input
                value={formatCPF(cpf)}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                isDisabled={!isAdmin}
              />
              {cpfError && <FormErrorMessage>{cpfError}</FormErrorMessage>}
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Nome</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>

            <FormControl isRequired isInvalid={!!phoneError}>
              <FormLabel>Telefone</FormLabel>
              <Input
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(XX) XXXXX-XXXX"
                maxLength={15}
              />
              {phoneError && <FormErrorMessage>{phoneError}</FormErrorMessage>}
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Endereço</FormLabel>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </FormControl>

            <FormControl isInvalid={!!emailError}>
              <FormLabel>Email (opcional)</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="exemplo@email.com"
              />
              {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel>Foto (opcional)</FormLabel>
              <VStack spacing={3} align="stretch">
                {photo ? (
                  <Box position="relative" w="150px" h="150px">
                    <Image
                      src={photo}
                      alt="Foto do usuário"
                      w="150px"
                      h="150px"
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
                      onClick={() => setPhoto(null)}
                    >
                      Remover
                    </Button>
                  </Box>
                ) : (
                  <Box
                    w="150px"
                    h="150px"
                    border="2px dashed"
                    borderColor="gray.300"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="gray.50"
                  >
                    <VStack spacing={2}>
                      <Box fontSize="3xl">📷</Box>
                      <Box fontSize="xs" color="gray.500" textAlign="center">
                        Sem foto
                      </Box>
                    </VStack>
                  </Box>
                )}
                <HStack>
                  <Button leftIcon={<FaCamera />} size="sm" onClick={onCameraOpen}>
                    Tirar Foto
                  </Button>
                  <Button leftIcon={<FaUpload />} size="sm" as="label" htmlFor="photo-upload-profile" cursor="pointer">
                    Upload
                    <Input
                      type="file"
                      id="photo-upload-profile"
                      accept="image/*"
                      onChange={handleFileUpload}
                      display="none"
                    />
                  </Button>
                </HStack>
              </VStack>
            </FormControl>

            <CameraCapture
              isOpen={isCameraOpen}
              onClose={onCameraClose}
              onCapture={handleCameraCapture}
            />

            <FormControl>
              <FormLabel>Nova Senha (deixe em branco para não alterar)</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                  <IconButton
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    h="1.75rem"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {password && (
              <FormControl>
                <FormLabel>Confirmar Nova Senha</FormLabel>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <InputRightElement width="4.5rem">
                    <IconButton
                      aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      variant="ghost"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            )}

            <HStack>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={updateMutation.isPending}
              >
                Salvar Alterações
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

