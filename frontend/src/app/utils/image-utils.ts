/**
 * Utility to compress an image from a Data URL (base64)
 * @param dataUrl The base64 data URL of the image
 * @param maxWidth The maximum width of the output image
 * @param maxHeight The maximum height of the output image
 * @param quality Compression quality (0 to 1)
 * @returns A promise that resolves with the compressed base64 data URL
 */
export async function compressImage(dataUrl: string, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with compression
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = (error) => reject(error);
  });
}
