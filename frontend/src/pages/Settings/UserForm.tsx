import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { Button } from '../../components/Button/Button';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { userService } from '../../services/userService';
import { UserRole } from '../../types';
import { validateCPF, formatCPF, validateEmail, validatePhone, formatPhone } from '../../utils/validation';
import { FormErrorMessage, Box, Image, useDisclosure, useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { User } from '../../types';
import { CameraCapture } from '../../components/CameraCapture/CameraCapture';
import { compressImage } from '../../utils/imageCompression';
import { FaCamera, FaUpload } from 'react-icons/fa';

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserForm = ({ user, onClose, onSuccess }: UserFormProps) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('USER');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cpfError, setCpfError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const { isOpen: isCameraOpen, onOpen: onCameraOpen, onClose: onCameraClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCpf(user.cpf);
      setPhone(formatPhone(user.phone || ''));
      setAddress(user.address);
      setEmail(user.email || '');
      setPhoto(user.photo || null);
      setRole(user.role);
      setPassword('');
      setConfirmPassword('');
      setCpfError('');
      setEmailError('');
    } else {
      setName('');
      setCpf('');
      setPhone('');
      setAddress('');
      setEmail('');
      setPhoto(null);
      setRole('USER');
      setPassword('');
      setConfirmPassword('');
      setCpfError('');
      setEmailError('');
    }
  }, [user]);

  const createMutation = useMutation({
    mutationFn: (data: Omit<User, 'id' | 'created_at' | 'active'> & { password: string }) => userService.create(data),
    onSuccess: () => {
      toast({
        title: 'Usuário criado',
        description: 'O usuário foi criado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Não foi possível criar o usuário.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> & { password?: string } }) =>
      userService.update(id, data),
    onSuccess: () => {
      toast({
        title: 'Usuário atualizado',
        description: 'O usuário foi atualizado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Não foi possível atualizar o usuário.',
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
        alert('A imagem é muito grande. Por favor, escolha uma imagem menor que 10MB.');
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

    // Validar CPF apenas na criação
    if (!user && !validateCPF(cpf)) {
      setCpfError('CPF inválido');
      return;
    }

    if (email && !validateEmail(email)) {
      setEmailError('Email inválido');
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

    if (user) {
      // Edição
      if (password && password !== confirmPassword) {
        alert('As senhas não coincidem');
        return;
      }

      const updateData: Partial<User> & { password?: string } = {
        name,
        phone: cleanPhone,
        address,
        email: email || null,
        photo: photo || null,
        role,
      };

      if (password) {
        if (password.length < 6) {
          alert('A senha deve ter no mínimo 6 caracteres');
          return;
        }
        updateData.password = password;
      }

      updateMutation.mutate({ id: user.id, data: updateData });
    } else {
      // Criação
      if (password !== confirmPassword) {
        alert('As senhas não coincidem');
        return;
      }

      if (password.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres');
        return;
      }

      createMutation.mutate({
        name,
        cpf: cpf.replace(/\D/g, ''),
        phone: cleanPhone,
        address,
        email: email || null,
        photo: photo || null,
        role,
        password,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Nome</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormControl>

        <FormControl isRequired isInvalid={!!cpfError}>
          <FormLabel>CPF</FormLabel>
          <Input
            value={formatCPF(cpf)}
            onChange={(e) => handleCpfChange(e.target.value)}
            placeholder="000.000.000-00"
            maxLength={14}
          />
          {cpfError && <FormErrorMessage>{cpfError}</FormErrorMessage>}
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
              <Button leftIcon={<FaUpload />} size="sm" as="label" htmlFor="photo-upload-user" cursor="pointer">
                Upload
                <Input
                  type="file"
                  id="photo-upload-user"
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

        <FormControl isRequired>
          <FormLabel>Função</FormLabel>
          <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="USER">Funcionário (USER)</option>
            <option value="ADMIN">Administrador (ADMIN)</option>
          </Select>
        </FormControl>

        <FormControl isRequired={!user}>
          <FormLabel>{user ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha'}</FormLabel>
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

        {(!user || password) && (
          <FormControl isRequired={!user}>
            <FormLabel>{user ? 'Confirmar Nova Senha' : 'Confirmar Senha'}</FormLabel>
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

        <HStack w="100%" justify="flex-end">
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {user ? 'Atualizar Usuário' : 'Criar Usuário'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

