import { EncodingType, readAsStringAsync } from 'expo-file-system/legacy';
import { Platform } from 'react-native';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Could not read image data'));
        return;
      }
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Could not read image data'));
    reader.readAsDataURL(blob);
  });
}

export async function imageUriToBase64(uri: string): Promise<{ base64: string; mimeType: string }> {
  if (uri.startsWith('data:')) {
    const match = uri.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error('Invalid data URI');
    return { mimeType: match[1], base64: match[2] };
  }

  if (Platform.OS === 'web') {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error('No se pudo leer la imagen seleccionada');
      }
      const blob = await response.blob();
      const mimeType = blob.type || 'image/jpeg';
      const base64 = await blobToBase64(blob);
      return { base64, mimeType };
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('No se pudo leer la imagen. Vuelve a capturar la foto.');
      }
      throw error;
    }
  }

  const mimeType = uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const base64 = await readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });
  return { base64, mimeType };
}

export async function ensureStableImageUri(uri: string): Promise<string> {
  if (!uri || uri.startsWith('data:') || Platform.OS !== 'web') {
    return uri;
  }

  const { base64, mimeType } = await imageUriToBase64(uri);
  return `data:${mimeType};base64,${base64}`;
}
