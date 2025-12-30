import { useQuery } from '@tanstack/react-query';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Text } from '@chakra-ui/react';
import { bookService } from '../../services/bookService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loading } from '../../components/Loading/Loading';

interface BookHistoryProps {
  bookId: string;
}

const conditionTranslations: Record<string, string> = {
  NEW: 'Novo',
  GOOD: 'Bom',
  FAIR: 'Regular',
  DAMAGED: 'Danificado',
};

const translateCondition = (condition: string | null | undefined): string => {
  if (!condition) return '-';
  return conditionTranslations[condition] || condition;
};

export const BookHistory = ({ bookId }: BookHistoryProps) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['book-history', bookId],
    queryFn: () => bookService.getLoanHistory(bookId),
  });

  if (isLoading) {
    return <Loading size="small" />;
  }

  if (!history || history.length === 0) {
    return <Text>Nenhum empréstimo registrado para este livro.</Text>;
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Cliente</Th>
            <Th>Data do Empréstimo</Th>
            <Th>Data de Vencimento</Th>
            <Th>Data de Devolução</Th>
            <Th>Estado no Empréstimo</Th>
            <Th>Estado na Devolução</Th>
          </Tr>
        </Thead>
        <Tbody>
          {history.map((loan) => (
            <Tr key={loan.id}>
              <Td>{loan.client_name}</Td>
              <Td>
                {format(new Date(loan.loan_date), 'dd/MM/yyyy', { locale: ptBR })}
              </Td>
              <Td>
                {format(new Date(loan.due_date), 'dd/MM/yyyy', { locale: ptBR })}
              </Td>
              <Td>
                {loan.return_date
                  ? format(new Date(loan.return_date), 'dd/MM/yyyy', { locale: ptBR })
                  : 'Não devolvido'}
              </Td>
              <Td>{translateCondition(loan.condition_on_loan)}</Td>
              <Td>{translateCondition(loan.condition_on_return)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

