import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  useOutsideClick,
  Spinner,
} from '@chakra-ui/react';
import { Client } from '../../types';
import { Avatar } from '../Avatar/Avatar';
import { clientService } from '../../services/clientService';
import { useDebounce } from '../../hooks/useDebounce';

interface ClientSearchProps {
  value: string;
  onChange: (clientId: string) => void;
  onNewClient: () => void;
}

export const ClientSearch = ({ value, onChange }: ClientSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  });

  // Buscar clientes com debounce
  const { data: clientsData, isLoading } = useQuery({
    queryKey: ['clients-search', debouncedSearch],
    queryFn: () => clientService.findAll(debouncedSearch || undefined, 1, 20), // Limite de 20 itens
    enabled: isOpen && searchTerm.trim().length > 0, // Busca quando dropdown está aberto E há texto digitado
  });

  const clients = clientsData?.data || [];

  // Buscar cliente selecionado se houver value
  const { data: selectedClientData } = useQuery({
    queryKey: ['client', value],
    queryFn: () => clientService.findById(value),
    enabled: !!value,
  });

  useEffect(() => {
    if (value && selectedClientData) {
      setSearchTerm(selectedClientData.name);
    } else if (!value) {
      setSearchTerm('');
    }
  }, [value, selectedClientData]);

  const handleSelectClient = (client: Client) => {
    setSearchTerm(client.name);
    onChange(client.id);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    // Abrir dropdown apenas quando há texto digitado
    if (newValue.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      onChange('');
    }
  };

  // Filtrar clientes para excluir o selecionado
  const filteredClients = clients.filter((client) => client.id !== value);

  return (
    <Box ref={containerRef} position="relative" w="100%">
      <Input
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => {
          // Não abrir dropdown automaticamente ao focar, só quando houver texto
        }}
        placeholder="Digite para buscar cliente por nome ou CPF..."
      />
      {isOpen && searchTerm.trim().length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={1000}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="lg"
          maxH="300px"
          overflowY="auto"
          mt={1}
        >
          <VStack align="stretch" spacing={0}>
            {isLoading ? (
              <Box p={3} textAlign="center">
                <Spinner size="sm" />
              </Box>
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <Box
                  key={client.id}
                  p={3}
                  cursor="pointer"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => handleSelectClient(client)}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  <HStack spacing={3}>
                    <Avatar name={client.name} photo={client.photo} size={40} />
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontWeight="medium">{client.name}</Text>
                      <Text fontSize="sm" color="gray.600">
                        CPF: {client.cpf}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))
            ) : (
              <Box p={3} textAlign="center" color="gray.500">
                Nenhum cliente encontrado
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};
