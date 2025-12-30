import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { AppRoutes } from './routes';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Topbar } from './components/Topbar/Topbar';
import { theme } from './theme';
import { Loading } from './components/Loading/Loading';

const queryClient = new QueryClient();

const getPageTitle = (pathname: string): string => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/books': 'Livros',
    '/authors': 'Autores',
    '/categories': 'Categorias',
    '/clients': 'Clientes',
    '/loans': 'Empréstimos',
    '/settings': 'Configurações',
    '/profile': 'Editar Perfil',
  };
  return titles[pathname] || 'Biblioteca';
};

const AppContent = () => {
  const location = useLocation();
  const { isLoading } = useAuth();
  const { isOpen } = useSidebar();
  const pageTitle = getPageTitle(location.pathname);

  const sidebarWidth = isOpen ? '250px' : '70px';

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh">
        <Loading />
      </Box>
    );
  }

  if (location.pathname === '/login') {
    return <AppRoutes />;
  }

  return (
    <>
      <Sidebar />
      <Topbar pageTitle={pageTitle} />
      <Box ml={sidebarWidth} mt="60px" p={6} transition="margin-left 0.3s ease">
        <AppRoutes />
      </Box>
    </>
  );
};

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <SidebarProvider>
              <AppContent />
            </SidebarProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ChakraProvider>
  );
};

