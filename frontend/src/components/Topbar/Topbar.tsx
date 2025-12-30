import {
  Box,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button as ChakraButton,
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../Avatar/Avatar';

interface TopbarProps {
  pageTitle: string;
}

export const Topbar = ({ pageTitle }: TopbarProps) => {
  const { user, logout } = useAuth();
  const { isOpen } = useSidebar();
  const navigate = useNavigate();

  const sidebarWidth = isOpen ? '250px' : '70px';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      h="60px"
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      position="fixed"
      top={0}
      left={sidebarWidth}
      right={0}
      px={6}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      zIndex={999}
      transition="left 0.3s ease"
    >
      <Text fontSize="xl" fontWeight="bold">
        {pageTitle}
      </Text>
      <Flex alignItems="center" gap={4}>
        <Menu placement="bottom-end" strategy="fixed" offset={[0, 8]}>
          <MenuButton
            as={ChakraButton}
            variant="ghost"
            rightIcon={
              <Avatar name={user?.name || ''} photo={user?.photo} size={32} />
            }
          >
            {user?.name}
          </MenuButton>
          <MenuList minW="200px">
            <MenuItem onClick={() => navigate('/profile')}>Editar Perfil</MenuItem>
            <MenuItem onClick={handleLogout}>Sair</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
};

