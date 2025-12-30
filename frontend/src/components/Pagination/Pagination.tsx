import { HStack, Select, Text, Button, Box } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={4}
      mt={4}
    >
      <HStack spacing={2}>
        <Text fontSize="sm" color="gray.600">
          Itens por página:
        </Text>
        <Select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          size="sm"
          w="100px"
        >
          <option value={30}>30</option>
          <option value={60}>60</option>
          <option value={90}>90</option>
          <option value={120}>120</option>
        </Select>
      </HStack>

      <Text fontSize="sm" color="gray.600">
        {startItem}-{endItem} de {totalItems}
      </Text>

      <HStack spacing={2}>
        <Button
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
          leftIcon={<ChevronLeftIcon />}
        >
          Anterior
        </Button>
        <Text fontSize="sm" color="gray.600">
          Página {currentPage} de {totalPages || 1}
        </Text>
        <Button
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
          rightIcon={<ChevronRightIcon />}
        >
          Próxima
        </Button>
      </HStack>
    </Box>
  );
};

