import { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Select,
  Textarea,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { Button } from '../../components/Button/Button';

interface ReturnLoanFormProps {
  onSubmit: (data: { condition_on_return: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED'; notes?: string }) => void;
  onClose: () => void;
}

export const ReturnLoanForm = ({ onSubmit, onClose }: ReturnLoanFormProps) => {
  const [condition, setCondition] = useState<'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED'>('GOOD');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      condition_on_return: condition,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Estado do Livro na Devolução</FormLabel>
          <Select
            value={condition}
            onChange={(e) => setCondition(e.target.value as 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED')}
          >
            <option value="NEW">Novo</option>
            <option value="GOOD">Bom</option>
            <option value="FAIR">Regular</option>
            <option value="DAMAGED">Danificado</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Observações</FormLabel>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormControl>

        <HStack w="100%" justify="flex-end">
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" colorScheme="green">
            Confirmar Devolução
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

