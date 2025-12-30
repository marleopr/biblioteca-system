export const compressImage = (base64: string, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.6, portrait: boolean = false): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Para formato retrato, garantir que altura seja maior que largura
      if (portrait && width > height) {
        // Se a imagem está deitada, rotacionar ou ajustar
        const temp = width;
        width = height;
        height = temp;
      }

      // Calcular novas dimensões mantendo proporção
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      // Para formato retrato, garantir proporção final
      if (portrait && width > height) {
        const temp = width;
        width = height;
        height = temp;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Melhorar qualidade da renderização
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      } else {
        resolve(base64);
      }
    };
    img.onerror = () => {
      resolve(base64);
    };
    img.src = base64;
  });
};

