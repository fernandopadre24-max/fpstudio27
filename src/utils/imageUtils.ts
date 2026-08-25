/**
 * Utility to compress image files client-side before storing or uploading.
 * Converts large smartphone or camera photos (3MB - 12MB) into lightweight,
 * high-quality JPEGs (~80KB - 200KB) that fit smoothly into LocalStorage and server payloads.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image, try to read as standard data URL
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calculate scaled dimensions keeping aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to simple FileReader
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
        return;
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Output as optimized JPEG data URL
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads compressed image directly to the backend /api/upload endpoint
 * to get a persistent, lightweight server static URL (/uploads/service-xxx.jpg)
 */
export async function uploadImageToServer(
  dataUrlOrFile: string | File,
  category = 'service'
): Promise<string> {
  try {
    let base64Data = '';
    if (typeof dataUrlOrFile === 'string') {
      if (!dataUrlOrFile.startsWith('data:')) {
        return dataUrlOrFile;
      }
      base64Data = dataUrlOrFile;
    } else {
      base64Data = await compressImageFile(dataUrlOrFile, 1200, 1200, 0.82);
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl: base64Data, category }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
    return base64Data;
  } catch (err) {
    console.warn('[imageUtils] Falha ao enviar imagem ao servidor, mantendo fallback local:', err);
    if (typeof dataUrlOrFile === 'string') return dataUrlOrFile;
    return compressImageFile(dataUrlOrFile, 1000, 1000, 0.75);
  }
}
