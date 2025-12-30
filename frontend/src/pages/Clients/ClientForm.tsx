import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Box,
  Image,
  useDisclosure,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import { Button } from '../../components/Button/Button';
import { clientService } from '../../services/clientService';
import { Client } from '../../types';
import { validateCPF, formatCPF, validateEmail, validatePhone, formatPhone } from '../../utils/validation';
import { FormErrorMessage } from '@chakra-ui/react';
import { CameraCapture } from '../../components/CameraCapture/CameraCapture';
import { compressImage } from '../../utils/imageCompression';
import { FaCamera, FaUpload } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

interface ClientFormProps {
  client?: Client | null;
  onClose: () => void;
  onSuccess: (createdClientId?: string) => void;
}

export const ClientForm = ({ client, onClose, onSuccess }: ClientFormProps) => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [cpfError, setCpfError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const { isOpen: isCameraOpen, onOpen: onCameraOpen, onClose: onCameraClose } = useDisclosure();

  useEffect(() => {
    if (client) {
      setName(client.name);
      setCpf(client.cpf);
      setPhone(formatPhone(client.phone || ''));
      setStreet(client.street || '');
      setNumber(client.number || '');
      setNeighborhood(client.neighborhood || '');
      setCity(client.city || '');
      setState(client.state || '');
      setZipCode(client.zip_code || '');
      setEmail(client.email || '');
      setPhoto(client.photo || null);
      setCpfError('');
      setEmailError('');
      setPhoneError('');
    } else {
      setName('');
      setCpf('');
      setPhone('');
      setStreet('');
      setNumber('');
      setNeighborhood('');
      setCity('');
      setState('');
      setZipCode('');
      setEmail('');
      setPhoto(null);
      setCpfError('');
      setEmailError('');
    }
  }, [client]);

  const createMutation = useMutation({
    mutationFn: (data: any) => clientService.create(data),
    onSuccess: (createdClient) => {
      toast({
        title: 'Cliente criado',
        description: 'O cliente foi criado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess(createdClient.id);
    },
    onError: (error: any) => {
      let errorMessage = 'Não foi possível criar o cliente.';
      
      // Tentar parsear erro de validação do Zod
      try {
        const errorData = error.response?.data?.error;
        if (typeof errorData === 'string' && errorData.startsWith('[')) {
          const validationErrors = JSON.parse(errorData);
          if (Array.isArray(validationErrors) && validationErrors.length > 0) {
            errorMessage = validationErrors.map((err: any) => err.message || err.path).join(', ');
          }
        } else if (errorData) {
          errorMessage = errorData;
        }
      } catch (e) {
        // Se não conseguir parsear, usa a mensagem padrão ou a mensagem do erro
        errorMessage = error.response?.data?.error || errorMessage;
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => clientService.update(id, data),
    onSuccess: () => {
      toast({
        title: 'Cliente atualizado',
        description: 'O cliente foi atualizado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Não foi possível atualizar o cliente.',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!client && !validateCPF(cpf)) {
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

    const data = {
      name,
      cpf: cpf.replace(/\D/g, ''),
      phone: cleanPhone,
      street: street.trim() || null,
      number: number.trim() || null,
      neighborhood: neighborhood.trim() || null,
      city: city.trim() || null,
      state: state.trim() || null,
      zip_code: zipCode.replace(/\D/g, '') || null,
      email: email || null,
      photo: photo || null,
    };

    if (client) {
      updateMutation.mutate({ id: client.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar tamanho do arquivo (máximo 10MB antes da compressão)
      if (file.size > 10 * 1024 * 1024) {
        alert('A imagem é muito grande. Por favor, escolha uma imagem menor que 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        // Comprimir imagem automaticamente (máximo 800x800, qualidade 60%)
        // Isso reduzirá o tamanho do arquivo significativamente
        const compressed = await compressImage(base64, 800, 800, 0.6);
        setPhoto(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async (imageData: string) => {
    // Comprimir imagem capturada automaticamente (máximo 800x800, qualidade 60%)
    const compressed = await compressImage(imageData, 800, 800, 0.6);
    setPhoto(compressed);
  };

  const removePhoto = () => {
    setPhoto(null);
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
            isDisabled={!!client && !isAdmin}
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

        <Box w="100%">
          <FormLabel mb={2}>Endereço (opcional)</FormLabel>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Rua</FormLabel>
              <Input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Nome da rua"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Número</FormLabel>
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Número"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Bairro</FormLabel>
              <Input
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Nome do bairro"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Cidade</FormLabel>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Nome da cidade"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Estado</FormLabel>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                placeholder="UF"
                maxLength={2}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">CEP</FormLabel>
              <Input
                value={zipCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const formatted = value.length <= 8 
                    ? value.replace(/(\d{5})(\d{3})/, '$1-$2')
                    : value.substring(0, 8).replace(/(\d{5})(\d{3})/, '$1-$2');
                  setZipCode(formatted);
                }}
                placeholder="00000-000"
                maxLength={9}
              />
            </FormControl>
          </SimpleGrid>
        </Box>

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
                  alt="Foto do cliente"
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
                  onClick={removePhoto}
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
              <Button leftIcon={<FaUpload />} size="sm" as="label" htmlFor="photo-upload" cursor="pointer">
                Upload
                <Input
                  type="file"
                  id="photo-upload"
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

        <HStack w="100%" justify="flex-end">
          <Button type="button" onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {client ? 'Atualizar' : 'Criar'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

