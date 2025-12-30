import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Box,
  Image,
  IconButton,
  useDisclosure,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import { Button } from '../../components/Button/Button';
import { AddIcon } from '@chakra-ui/icons';
import { bookService } from '../../services/bookService';
import { authorService } from '../../services/authorService';
import { categoryService } from '../../services/categoryService';
import { Book } from '../../types';
import { AuthorSearch } from '../../components/AuthorSearch/AuthorSearch';
import { CategorySearch } from '../../components/CategorySearch/CategorySearch';
import { Modal } from '../../components/Modal/Modal';
import { AuthorForm } from '../Authors/AuthorForm';
import { CategoryForm } from '../Categories/CategoryForm';
import { CameraCapture } from '../../components/CameraCapture/CameraCapture';
import { compressImage } from '../../utils/imageCompression';
import { FaCamera, FaUpload } from 'react-icons/fa';

interface BookFormProps {
  book?: Book | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookForm = ({ book, onClose, onSuccess }: BookFormProps) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [origin, setOrigin] = useState('');
  const [cover, setCover] = useState<string | null>(null);
  const [acquisitionType, setAcquisitionType] = useState<'DONATION' | 'PURCHASE'>('DONATION');
  const [totalQuantity, setTotalQuantity] = useState(1);
  const [barcode, setBarcode] = useState('');
  const [inventoryNumber, setInventoryNumber] = useState('');
  const [edition, setEdition] = useState('');
  const [coverType, setCoverType] = useState<'SOFTCOVER' | 'HARDCOVER' | ''>('');
  const [isbn, setIsbn] = useState('');
  const { isOpen: isAuthorFormOpen, onOpen: onAuthorFormOpen, onClose: onAuthorFormClose } = useDisclosure();
  const { isOpen: isCategoryFormOpen, onOpen: onCategoryFormOpen, onClose: onCategoryFormClose } = useDisclosure();
  const { isOpen: isCameraOpen, onOpen: onCameraOpen, onClose: onCameraClose } = useDisclosure();

  const { data: authorsData } = useQuery({
    queryKey: ['authors'],
    queryFn: () => authorService.findAll(),
  });
  const authors = authorsData?.data || [];

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.findAll(),
  });
  const categories = categoriesData?.data || [];

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthorId(book.author_id);
      setCategoryId(book.category_id);
      setOrigin(book.origin);
      setCover(book.photo || null);
      setAcquisitionType(book.acquisition_type);
      setTotalQuantity(book.total_quantity);
      setBarcode(book.barcode || '');
      setInventoryNumber(book.inventory_number || '');
      setEdition(book.edition || '');
      setCoverType(book.cover_type || '');
      setIsbn(book.isbn || '');
    } else {
      setTitle('');
      setAuthorId('');
      setCategoryId('');
      setOrigin('');
      setCover(null);
      setAcquisitionType('DONATION');
      setTotalQuantity(1);
      setBarcode('');
      setInventoryNumber('');
      setEdition('');
      setCoverType('');
      setIsbn('');
    }
  }, [book]);

  const createMutation = useMutation({
    mutationFn: (data: any) => bookService.create(data),
    onSuccess: () => {
      toast({
        title: 'Livro criado',
        description: 'O livro foi criado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Não foi possível criar o livro.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => bookService.update(id, data),
    onSuccess: () => {
      toast({
        title: 'Livro atualizado',
        description: 'O livro foi atualizado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.response?.data?.error || 'Não foi possível atualizar o livro.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleAuthorFormSuccess = async (newAuthorId?: string) => {
    if (newAuthorId) {
      // Buscar o autor criado para atualizar o cache
      const newAuthor = await authorService.findById(newAuthorId);
      
      // Atualizar o cache imediatamente
      queryClient.setQueryData(['authors'], (oldData: any) => {
        if (!oldData) return oldData;
        const existingData = oldData.data || [];
        // Verificar se o autor já existe no cache para evitar duplicatas
        const authorExists = existingData.some((a: any) => a.id === newAuthor.id);
        if (authorExists) {
          return oldData;
        }
        return {
          ...oldData,
          data: [...existingData, newAuthor],
        };
      });
      
      // Invalidar e refazer a query para garantir sincronização
      await queryClient.refetchQueries({ queryKey: ['authors'] });
      
      // Agora define o authorId após a query estar atualizada
      setAuthorId(newAuthorId);
    }
    onAuthorFormClose();
  };

  const handleCategoryFormSuccess = async (newCategoryId?: string) => {
    if (newCategoryId) {
      // Buscar a categoria criada para atualizar o cache
      const newCategory = await categoryService.findById(newCategoryId);
      
      // Atualizar o cache imediatamente
      queryClient.setQueryData(['categories'], (oldData: any) => {
        if (!oldData) return oldData;
        const existingData = oldData.data || [];
        // Verificar se a categoria já existe no cache para evitar duplicatas
        const categoryExists = existingData.some((c: any) => c.id === newCategory.id);
        if (categoryExists) {
          return oldData;
        }
        return {
          ...oldData,
          data: [...existingData, newCategory],
        };
      });
      
      // Invalidar e refazer a query para garantir sincronização
      await queryClient.refetchQueries({ queryKey: ['categories'] });
      
      // Agora define o categoryId após a query estar atualizada
      setCategoryId(newCategoryId);
    }
    onCategoryFormClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('A imagem é muito grande. Por favor, escolha uma imagem menor que 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        // Comprimir imagem para formato retrato (altura maior que largura)
        const compressed = await compressImage(base64, 600, 800, 0.6, true);
        setCover(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async (imageData: string) => {
    // Comprimir imagem para formato retrato
    const compressed = await compressImage(imageData, 600, 800, 0.6, true);
    setCover(compressed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título é obrigatório.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!authorId) {
      toast({
        title: 'Erro',
        description: 'O autor é obrigatório.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!categoryId) {
      toast({
        title: 'Erro',
        description: 'A categoria é obrigatória.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!origin.trim()) {
      toast({
        title: 'Erro',
        description: 'A origem é obrigatória.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const data = {
      title,
      author_id: authorId,
      category_id: categoryId,
      origin,
      photo: cover || null,
      acquisition_type: acquisitionType,
      total_quantity: totalQuantity,
      barcode: barcode.trim() || null,
      inventory_number: inventoryNumber.trim() || null,
      edition: edition.trim() || null,
      cover_type: coverType || null,
      isbn: isbn.trim() || null,
    };

    if (book) {
      updateMutation.mutate({ id: book.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
        {/* Capa - ocupa toda a largura */}
        <FormControl w="100%">
          <FormLabel>Capa (opcional)</FormLabel>
          <VStack spacing={3} align="flex-start">
            {cover ? (
              <Box position="relative" w="120px" h="180px">
                <Image
                  src={cover}
                  alt="Capa do livro"
                  w="120px"
                  h="180px"
                  objectFit="cover"
                  borderRadius="md"
                  border="2px solid"
                  borderColor="gray.200"
                />
                <Button
                  size="xs"
                  colorScheme="red"
                  position="absolute"
                  top={2}
                  right={2}
                  onClick={() => setCover(null)}
                >
                  Remover
                </Button>
              </Box>
            ) : (
              <Box
                w="120px"
                h="180px"
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="gray.50"
              >
                <VStack spacing={2}>
                  <Box fontSize="3xl">📚</Box>
                  <Box fontSize="xs" color="gray.500" textAlign="center">
                    Sem capa
                  </Box>
                </VStack>
              </Box>
            )}
            <HStack>
              <Button leftIcon={<FaCamera />} size="sm" onClick={onCameraOpen}>
                Tirar Foto
              </Button>
              <Button leftIcon={<FaUpload />} size="sm" as="label" htmlFor="cover-upload-book" cursor="pointer">
                Upload
                <Input
                  type="file"
                  id="cover-upload-book"
                  accept="image/*"
                  onChange={handleFileUpload}
                  display="none"
                />
              </Button>
            </HStack>
          </VStack>
        </FormControl>

        <CameraCapture
          isOpen={isCameraOpen}
          onClose={onCameraClose}
          onCapture={handleCameraCapture}
        />

        {/* Campos em duas colunas */}
        <SimpleGrid columns={2} spacing={4} w="100%">
          {/* Coluna 1 */}
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Título</FormLabel>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Autor</FormLabel>
              <HStack spacing={2}>
                <Box flex={1}>
                  <AuthorSearch
                    authors={authors || []}
                    value={authorId}
                    onChange={setAuthorId}
                    onNewAuthor={onAuthorFormOpen}
                    isLoading={false}
                  />
                </Box>
                <IconButton
                  aria-label="Novo autor"
                  icon={<AddIcon />}
                  colorScheme="green"
                  size="md"
                  onClick={onAuthorFormOpen}
                />
              </HStack>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Categoria</FormLabel>
              <HStack spacing={2}>
                <Box flex={1}>
                  <CategorySearch
                    categories={categories || []}
                    value={categoryId}
                    onChange={setCategoryId}
                    onNewCategory={onCategoryFormOpen}
                    isLoading={false}
                  />
                </Box>
                <IconButton
                  aria-label="Nova categoria"
                  icon={<AddIcon />}
                  colorScheme="green"
                  size="md"
                  onClick={onCategoryFormOpen}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel>Edição</FormLabel>
              <Input 
                value={edition} 
                onChange={(e) => setEdition(e.target.value)} 
                placeholder="Ex: 1ª edição, 2ª edição revisada"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Origem</FormLabel>
              <Input value={origin} onChange={(e) => setOrigin(e.target.value)} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Tipo de Aquisição</FormLabel>
              <Select
                value={acquisitionType}
                onChange={(e) => setAcquisitionType(e.target.value as 'DONATION' | 'PURCHASE')}
              >
                <option value="DONATION">Doação</option>
                <option value="PURCHASE">Compra</option>
              </Select>
            </FormControl>
          </VStack>

          {/* Coluna 2 */}
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>ISBN</FormLabel>
              <Input 
                value={isbn} 
                onChange={(e) => setIsbn(e.target.value.replace(/[^0-9-]/g, ''))} 
                placeholder="Ex: 978-85-123-4567-8"
                maxLength={17}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Código de Barras</FormLabel>
              <Input 
                value={barcode} 
                onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ''))} 
                placeholder="Apenas números"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Número de Inventário</FormLabel>
              <Input 
                value={inventoryNumber} 
                onChange={(e) => setInventoryNumber(e.target.value)} 
                placeholder="Ex: INV-001"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Tipo de Capa</FormLabel>
              <Select
                value={coverType}
                onChange={(e) => setCoverType(e.target.value as 'SOFTCOVER' | 'HARDCOVER' | '')}
              >
                <option value="">Selecione...</option>
                <option value="SOFTCOVER">Capa Comum</option>
                <option value="HARDCOVER">Capa Dura</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Quantidade Total</FormLabel>
              <Input
                type="number"
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(Number(e.target.value))}
                min={1}
              />
            </FormControl>
          </VStack>
        </SimpleGrid>

        {/* Botões - ocupa toda a largura */}
        <HStack w="100%" justify="flex-end" pt={2}>
          <Button type="button" onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {book ? 'Atualizar' : 'Criar'}
          </Button>
        </HStack>
      </VStack>
    </form>

    <Modal
      isOpen={isAuthorFormOpen}
      onClose={onAuthorFormClose}
      title="Novo Autor"
      showFooter={false}
    >
      <AuthorForm
        author={null}
        onClose={onAuthorFormClose}
        onSuccess={handleAuthorFormSuccess}
      />
    </Modal>

    <Modal
      isOpen={isCategoryFormOpen}
      onClose={onCategoryFormClose}
      title="Nova Categoria"
      showFooter={false}
    >
      <CategoryForm
        category={null}
        onClose={onCategoryFormClose}
        onSuccess={handleCategoryFormSuccess}
      />
    </Modal>
    </>
  );
};

