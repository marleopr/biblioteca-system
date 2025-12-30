import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CameraCapture = ({ onCapture, isOpen, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      alert('Erro ao acessar a câmera. Tente novamente.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert('Aguarde a câmera carregar completamente antes de capturar.');
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      alert('Erro ao inicializar o canvas. Tente novamente.');
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
    } catch (error) {
      console.error('Error capturing photo:', error);
      alert('Erro ao capturar foto. Tente novamente.');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const usePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Tirar Foto</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {!capturedImage ? (
              <>
                <Box
                  w="100%"
                  h="400px"
                  bg="black"
                  borderRadius="md"
                  overflow="hidden"
                  position="relative"
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </Box>
                <Button colorScheme="blue" onClick={capturePhoto} w="100%">
                  Capturar Foto
                </Button>
              </>
            ) : (
              <>
                <Image src={capturedImage} alt="Captured" maxH="400px" borderRadius="md" />
                <HStack w="100%">
                  <Button flex={1} onClick={retakePhoto}>
                    Tirar Novamente
                  </Button>
                  <Button flex={1} colorScheme="green" onClick={usePhoto}>
                    Usar Esta Foto
                  </Button>
                </HStack>
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

