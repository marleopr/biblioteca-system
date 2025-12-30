import { Box, VStack, Link, Text, Image, Tooltip } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { settingService } from '../../services/settingService';
import { useSidebar } from '../../contexts/SidebarContext';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/loans', label: 'Empréstimos', icon: '📚' },
  { path: '/books', label: 'Livros', icon: '📖' },
  { path: '/authors', label: 'Autores', icon: '✍️' },
  { path: '/categories', label: 'Categorias', icon: '🏷️' },
  { path: '/clients', label: 'Clientes', icon: '👥' },
  { path: '/settings', label: 'Configurações', icon: '⚙️', adminOnly: true },
];

export const Sidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { isOpen, toggle, open } = useSidebar();
  
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingService.find(),
  });

  const libraryName = settings?.library_name || 'Biblioteca';
  const libraryLogo = settings?.library_logo;
  const sidebarColor = settings?.sidebar_color || 'gray.800';

  const sidebarWidth = isOpen ? '250px' : '70px';

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOpen) {
      open();
    } else {
      // Se sidebar está aberta, fecha (com ou sem logo)
      toggle();
    }
  };

  return (
    <Box
      w={sidebarWidth}
      h="100vh"
      bg={sidebarColor}
      color="white"
      p={isOpen ? 4 : 2}
      position="fixed"
      left={0}
      top={0}
      transition="width 0.3s ease"
      zIndex={1000}
    >
      <VStack align="stretch" spacing={2}>
        {/* Logo */}
        <VStack spacing={2} mb={4} align="center">
          <Tooltip label={isOpen ? 'Fechar Menu' : 'Abrir Menu'} placement="right">
            {isOpen && libraryLogo ? (
              // Logo com sidebar aberta - fecha a sidebar
              <Box
                onClick={handleLogoClick}
                _hover={{ opacity: 0.8 }}
                cursor="pointer"
                display="flex"
                alignItems="center"
                justifyContent="center"
                w="220px"
                h="120px"
                transition="all 0.3s ease"
              >
                <Image
                  src={libraryLogo}
                  alt="Logo da biblioteca"
                  maxW="220px"
                  maxH="120px"
                  w="auto"
                  h="auto"
                  objectFit="contain"
                  borderRadius="md"
                  cursor="pointer"
                  transition="opacity 0.2s"
                  _hover={{ opacity: 0.8 }}
                />
              </Box>
            ) : isOpen && !libraryLogo ? (
              // Ícone padrão com sidebar aberta - clica para fechar
              <Box
                onClick={handleLogoClick}
                _hover={{ opacity: 0.8 }}
                cursor="pointer"
                w="120px"
                h="120px"
                bg="gray.700"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="all 0.3s ease"
              >
                <Box fontSize="4xl">📚</Box>
              </Box>
            ) : (
              // Sidebar fechada - clica para abrir
              <Box
                onClick={handleLogoClick}
                _hover={{ opacity: 0.8 }}
                cursor="pointer"
                display="flex"
                alignItems="center"
                justifyContent="center"
                w="50px"
                h="50px"
                transition="all 0.3s ease"
              >
                {libraryLogo ? (
                  <Image
                    src={libraryLogo}
                    alt="Logo da biblioteca"
                    maxW="50px"
                    maxH="50px"
                    w="auto"
                    h="auto"
                    objectFit="contain"
                    borderRadius="md"
                    cursor="pointer"
                    transition="opacity 0.2s"
                    _hover={{ opacity: 0.8 }}
                  />
                ) : (
                  <Box
                    w="50px"
                    h="50px"
                    bg="gray.700"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    transition="opacity 0.2s"
                    _hover={{ opacity: 0.8 }}
                  >
                    <Box fontSize="2xl">📚</Box>
                  </Box>
                )}
              </Box>
            )}
          </Tooltip>
          {isOpen && (
            <Link
              as={RouterLink}
              to="/"
              _hover={{ textDecoration: 'none', opacity: 0.8 }}
              cursor="pointer"
            >
              <Text fontSize="xl" fontWeight="bold" textAlign="center" w="100%" _hover={{ opacity: 0.8 }}>
                {libraryName}
              </Text>
            </Link>
          )}
        </VStack>
        {menuItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => (
            <Tooltip key={item.path} label={item.label} placement="right" isDisabled={isOpen}>
              <Link
                as={RouterLink}
                to={item.path}
                p={isOpen ? 3 : 2}
                borderRadius="md"
                bg={location.pathname === item.path ? 'blue.600' : 'transparent'}
                _hover={{ bg: 'gray.700' }}
                display="flex"
                alignItems="center"
                justifyContent={isOpen ? 'flex-start' : 'center'}
                gap={isOpen ? 2 : 0}
                w="100%"
              >
                <Text fontSize={isOpen ? 'md' : 'xl'}>{item.icon}</Text>
                {isOpen && <Text>{item.label}</Text>}
              </Link>
            </Tooltip>
          ))}
      </VStack>
    </Box>
  );
};

