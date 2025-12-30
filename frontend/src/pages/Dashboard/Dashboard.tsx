import { useQuery } from '@tanstack/react-query';
import { Box, VStack, Heading, SimpleGrid, Card, CardBody, Text, Badge, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { loanService } from '../../services/loanService';
import { settingService } from '../../services/settingService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Dashboard = () => {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingService.find(),
  });

  const loanDurationDays = settings?.loan_duration_days || 14;

  const { data: upcomingLoans } = useQuery({
    queryKey: ['loans', 'upcoming', loanDurationDays],
    queryFn: () => loanService.getUpcomingDue(loanDurationDays, 10),
  });

  const { data: overdueLoans } = useQuery({
    queryKey: ['loans', 'overdue'],
    queryFn: () => loanService.getOverdue(),
  });

  const { data: topBooks } = useQuery({
    queryKey: ['loans', 'top', 'books'],
    queryFn: () => loanService.getTopBooks(10),
  });

  const { data: topAuthors } = useQuery({
    queryKey: ['loans', 'top', 'authors'],
    queryFn: () => loanService.getTopAuthors(10),
  });

  const { data: topCategories } = useQuery({
    queryKey: ['loans', 'top', 'categories'],
    queryFn: () => loanService.getTopCategories(10),
  });

  const { data: topClients } = useQuery({
    queryKey: ['loans', 'top', 'clients'],
    queryFn: () => loanService.getTopClients(10),
  });

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <Heading>Dashboard</Heading>

        <SimpleGrid columns={2} spacing={4}>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.600">
                Empréstimos Próximos do Vencimento ({loanDurationDays} dias)
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {upcomingLoans?.length || 0}
              </Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.600">
                Empréstimos Atrasados
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                {overdueLoans?.length || 0}
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {overdueLoans && overdueLoans.length > 0 && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Empréstimos Atrasados
              </Heading>
              <VStack align="stretch" spacing={2}>
                {overdueLoans.map((loan) => (
                  <Box
                    key={loan.id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor="red.200"
                  >
                    <Text fontWeight="bold">{loan.book_title}</Text>
                    <Text fontSize="sm">Cliente: {loan.client_name}</Text>
                    <Text fontSize="sm">
                      Vencimento:{' '}
                      {format(new Date(loan.due_date), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </Text>
                    <Badge colorScheme="red" mt={2}>
                      Atrasado
                    </Badge>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}

        {upcomingLoans && upcomingLoans.length > 0 && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Próximos Vencimentos ({loanDurationDays} dias) - Top 10
              </Heading>
              <VStack align="stretch" spacing={2}>
                {upcomingLoans.map((loan) => (
                  <Box
                    key={loan.id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor="yellow.200"
                  >
                    <Text fontWeight="bold">{loan.book_title}</Text>
                    <Text fontSize="sm">Cliente: {loan.client_name}</Text>
                    <Text fontSize="sm">
                      Vencimento:{' '}
                      {format(new Date(loan.due_date), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </Text>
                    <Badge colorScheme="yellow" mt={2}>
                      Próximo do Vencimento
                    </Badge>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}

        <SimpleGrid columns={2} spacing={4}>
          {topBooks && topBooks.length > 0 && (
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>
                  Top 10 Livros Mais Emprestados
                </Heading>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>#</Th>
                        <Th>Livro</Th>
                        <Th isNumeric>Empréstimos</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {topBooks.map((book, index) => (
                        <Tr key={book.id}>
                          <Td>{index + 1}</Td>
                          <Td>{book.title}</Td>
                          <Td isNumeric>{book.loan_count}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          )}

          {topAuthors && topAuthors.length > 0 && (
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>
                  Top 10 Autores Mais Emprestados
                </Heading>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>#</Th>
                        <Th>Autor</Th>
                        <Th isNumeric>Empréstimos</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {topAuthors.map((author, index) => (
                        <Tr key={author.id}>
                          <Td>{index + 1}</Td>
                          <Td>{author.name}</Td>
                          <Td isNumeric>{author.loan_count}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          )}

          {topCategories && topCategories.length > 0 && (
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>
                  Top 10 Categorias Mais Emprestadas
                </Heading>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>#</Th>
                        <Th>Categoria</Th>
                        <Th isNumeric>Empréstimos</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {topCategories.map((category, index) => (
                        <Tr key={category.id}>
                          <Td>{index + 1}</Td>
                          <Td>{category.name}</Td>
                          <Td isNumeric>{category.loan_count}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          )}

          {topClients && topClients.length > 0 && (
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>
                  Top 10 Clientes que Mais Pegam Livros
                </Heading>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>#</Th>
                        <Th>Cliente</Th>
                        <Th isNumeric>Empréstimos</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {topClients.map((client, index) => (
                        <Tr key={client.id}>
                          <Td>{index + 1}</Td>
                          <Td>{client.name}</Td>
                          <Td isNumeric>{client.loan_count}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          )}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};
