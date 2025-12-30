import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Input,
  VStack,
  Text,
  useOutsideClick,
} from '@chakra-ui/react';
import { Category } from '../../types';

interface CategorySearchProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  onNewCategory?: () => void;
  isLoading?: boolean;
}

export const CategorySearch = ({ categories, value, onChange, onNewCategory: _onNewCategory, isLoading: _isLoading }: CategorySearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  });

  useEffect(() => {
    if (value) {
      const category = categories.find((c) => c.id === value);
      if (category) {
        setSearchTerm(category.name);
      }
    } else {
      setSearchTerm('');
    }
  }, [value, categories]);

  const filteredCategories = searchTerm
    ? categories.filter((category) => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        category.id !== value // Exclui a categoria selecionada da lista
      )
    : categories.filter((category) => category.id !== value); // Exclui a categoria selecionada quando não há busca

  const handleSelectCategory = (category: Category) => {
    setSearchTerm(category.name);
    onChange(category.id);
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
        placeholder="Digite para buscar categoria..."
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
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <Box
                  key={category.id}
                  p={3}
                  cursor="pointer"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => handleSelectCategory(category)}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  <Text fontWeight="medium">{category.name}</Text>
                </Box>
              ))
            ) : (
              <Box p={3} textAlign="center" color="gray.500">
                Nenhuma categoria encontrada
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

