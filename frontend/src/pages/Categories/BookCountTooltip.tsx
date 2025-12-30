import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Text, VStack, Spinner } from '@chakra-ui/react';
import { Tooltip } from '@chakra-ui/react';
import { loanService } from '../../services/loanService';

interface BookCountTooltipProps {
  categoryId: string;
  bookCount: number;
}

export const BookCountTooltip = ({ categoryId, bookCount }: BookCountTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: topBooks, isLoading } = useQuery({
    queryKey: ['top-books-category', categoryId],
    queryFn: () => loanService.getTopBooksByCategory(categoryId, 5),
    enabled: isOpen && bookCount > 0, // Só carrega quando tooltip estiver aberto e houver livros
  });

  const tooltipContent = isLoading ? (
    <Box p={2}>
      <Spinner size="sm" />
    </Box>
  ) : topBooks && topBooks.length > 0 ? (
    <VStack align="start" spacing={1} maxH="200px" overflowY="auto">
      <Text fontWeight="bold" fontSize="sm" mb={1}>
        Top 5 mais emprestados:
      </Text>
      {topBooks.map((book, index) => (
        <Text key={book.id} fontSize="xs">
          {index + 1}. {book.title} ({book.loan_count} empréstimo{book.loan_count !== 1 ? 's' : ''})
        </Text>
      ))}
    </VStack>
  ) : bookCount > 0 ? (
    <Text fontSize="sm">Nenhum empréstimo registrado</Text>
  ) : (
    <Text fontSize="sm">Sem livros cadastrados</Text>
  );

  return (
    <Tooltip
      label={tooltipContent}
      placement="right"
      hasArrow
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    >
      <Box cursor="help" display="inline-block">
        <Text fontWeight="medium" color={bookCount > 0 ? 'blue.600' : 'gray.500'}>
          {bookCount} livro{bookCount !== 1 ? 's' : ''}
        </Text>
      </Box>
    </Tooltip>
  );
};

