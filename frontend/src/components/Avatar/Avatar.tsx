import { Box } from '@chakra-ui/react';
import { avatarColors } from '../../theme/colors';

interface AvatarProps {
  name: string;
  photo?: string | null;
  size?: number;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColorFromName = (name: string): string => {
  // Gerar índice baseado no nome
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index].bg;
};

export const Avatar = ({ name, photo, size = 50 }: AvatarProps) => {
  if (photo) {
    return (
      <Box
        as="img"
        src={photo}
        alt={name}
        w={`${size}px`}
        h={`${size}px`}
        borderRadius="50%"
        objectFit="cover"
        border="2px solid"
        borderColor="gray.200"
      />
    );
  }

  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <Box
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="50%"
      bg={bgColor}
      color="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize={`${size * 0.4}px`}
      fontWeight="500"
      border="2px solid"
      borderColor="gray.200"
      flexShrink={0}
    >
      {initials}
    </Box>
  );
};

