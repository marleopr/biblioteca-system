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
  Image,
} from '@chakra-ui/react';
import { Book } from '../../types';
import { bookService } from '../../services/bookService';
import { useDebounce } from '../../hooks/useDebounce';

interface BookSearchProps {
  value: string;
  onChange: (bookId: string) => void;
  onlyAvailable?: boolean; // Se true, mostra apenas livros disponíveis
}

export const BookSearch = ({ value, onChange, onlyAvailable = false }: BookSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  });

  // Buscar livros com debounce
  const { data: booksData, isLoading } = useQuery({
    queryKey: ['books-search', debouncedSearch, onlyAvailable],
    queryFn: () => bookService.findAll(debouncedSearch.trim() || undefined, undefined, undefined, undefined, 1, 20), // Limite de 20 itens
    enabled: isOpen && searchTerm.trim().length > 0, // Habilita quando há texto digitado (usa searchTerm para habilitar imediatamente)
  });

  let books = booksData?.data || [];
  
  // Filtrar apenas disponíveis se necessário
  if (onlyAvailable) {
    books = books.filter((book) => book.available_quantity > 0);
  }

  // Buscar livro selecionado se houver value
  const { data: selectedBookData } = useQuery({
    queryKey: ['book', value],
    queryFn: () => bookService.findById(value),
    enabled: !!value,
  });

  useEffect(() => {
    if (value && selectedBookData) {
      setSearchTerm(selectedBookData.title);
    } else if (!value) {
      setSearchTerm('');
    }
  }, [value, selectedBookData]);

  const handleSelectBook = (book: Book) => {
    setSearchTerm(book.title);
    onChange(book.id);
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

  // Filtrar livros para excluir o selecionado
  const filteredBooks = books.filter((book) => book.id !== value);

  return (
    <Box ref={containerRef} position="relative" w="100%">
      <Input
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => {
          // Não abrir dropdown automaticamente ao focar, só quando houver texto
        }}
        placeholder="Digite para buscar livro por título, ISBN, cód. barras ou nº inventário..."
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
            ) : filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <Box
                  key={book.id}
                  p={3}
                  cursor="pointer"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => handleSelectBook(book)}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  <HStack spacing={3}>
                    {book.photo ? (
                      <Image
                        src={book.photo}
                        alt={book.title}
                        w="40px"
                        h="60px"
                        objectFit="cover"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.200"
                      />
                    ) : (
                      <Box
                        w="40px"
                        h="60px"
                        bg="gray.100"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xl"
                      >
                        📚
                      </Box>
                    )}
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontWeight="medium">{book.title}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {book.author_name} • {book.category_name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Disponível: {book.available_quantity} / Total: {book.total_quantity}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))
            ) : (
              <Box p={3} textAlign="center" color="gray.500">
                {searchTerm.trim() 
                  ? (onlyAvailable ? 'Nenhum livro disponível encontrado' : 'Nenhum livro encontrado')
                  : 'Digite para buscar...'}
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

