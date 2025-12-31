import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Image,
} from '@chakra-ui/react';
import { Button } from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { formatCPF } from '../../utils/validation';

export const Login = () => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite digitar com ou sem formatação, mas formata visualmente
    const cleanCPF = value.replace(/\D/g, '');
    if (cleanCPF.length <= 11) {
      // Formata apenas se tiver pelo menos 3 dígitos
      if (cleanCPF.length >= 3) {
        setCpf(formatCPF(cleanCPF));
      } else {
        setCpf(cleanCPF);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Remove formatação antes de enviar ao backend
      const cleanCpf = cpf.replace(/\D/g, '');
      const response = await authService.login(cleanCpf, password);
      login(response.token, response.user);
      navigate('/');
    } catch (err) {
      setError('Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" centerContent>
      <Box w="100%" mt={20}>
        <VStack spacing={6}>
          <Image
            src="/favicon.ico"
            alt="Logo da Biblioteca"
            w="80px"
            h="80px"
            objectFit="contain"
            mb={2}
          />
          <Heading>Sistema de Gestão de Bibliotecas</Heading>
          <Box w="100%" as="form" onSubmit={handleSubmit}>
            <VStack spacing={4}>
              {error && (
                <Alert status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              <FormControl>
                <FormLabel>CPF</FormLabel>
                <Input
                  type="text"
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </FormControl>
              <FormControl>
                <FormLabel>Senha</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormControl>
              <Button type="submit" colorScheme="blue" w="100%" isLoading={loading}>
                Entrar
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
};

