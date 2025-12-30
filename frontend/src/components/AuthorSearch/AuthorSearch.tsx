import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Input,
  VStack,
  Text,
  useOutsideClick,
} from '@chakra-ui/react';
import { Author } from '../../types';

interface AuthorSearchProps {
  authors: Author[];
  value: string;
  onChange: (authorId: string) => void;
  onNewAuthor: () => void;
  isLoading?: boolean;
}

export const AuthorSearch = ({ authors, value, onChange }: AuthorSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  });

  useEffect(() => {
    if (value) {
      const author = authors.find((a) => a.id === value);
      if (author) {
        setSearchTerm(author.name);
      }
    } else {
      setSearchTerm('');
    }
  }, [value, authors]);

  const filteredAuthors = searchTerm
    ? authors.filter((author) => 
        author.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        author.id !== value // Exclui o autor selecionado da lista
      )
    : authors.filter((author) => author.id !== value); // Exclui o autor selecionado quando não há busca

  const handleSelectAuthor = (author: Author) => {
    setSearchTerm(author.name);
    onChange(author.id);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    if (!newValue) {
      onChange('');
    }
  };

  return (
    <Box ref={containerRef} position="relative" w="100%">
      <Input
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder="Digite para buscar autor..."
      />
      {isOpen && (
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
            {filteredAuthors.length > 0 ? (
              filteredAuthors.map((author) => (
                <Box
                  key={author.id}
                  p={3}
                  cursor="pointer"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => handleSelectAuthor(author)}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  <Text fontWeight="medium">{author.name}</Text>
                </Box>
              ))
            ) : (
              <Box p={3} textAlign="center" color="gray.500">
                Nenhum autor encontrado
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

