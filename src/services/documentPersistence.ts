import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  copyAsync,
  documentDirectory,
  EncodingType,
  getInfoAsync,
  makeDirectoryAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import { imageUriToBase64 } from '@/services/imageToBase64';
import {
  compressDataUriForStorage,
  getWebImageFromMemory,
  storeWebImageInMemory,
} from '@/services/webImageCache';
import { loadWebImageData, storeWebImageData } from '@/services/webImageStorage';

const IMAGES_DIR = `${documentDirectory ?? ''}claridad-images/`;

function webImageStorageKey(ref: string): string {
  return `@claridad/web-image:v1:${ref}`;
}

export function isWebImageRef(uri: string): boolean {
  return uri.startsWith('web-image-ref:');
}

export async function resolveImageUri(uri: string | undefined | null): Promise<string> {
  if (!uri) return '';
  if (!isWebImageRef(uri)) return uri;

  const cached = getWebImageFromMemory(uri);
  if (cached) return cached;

  const stored = await loadWebImageData(uri);
  if (stored) {
    storeWebImageInMemory(uri, stored);
    return stored;
  }

  // Legacy single-key storage fallback.
  try {
    const legacy = await AsyncStorage.getItem(webImageStorageKey(uri));
    if (legacy) {
      storeWebImageInMemory(uri, legacy);
      return legacy;
    }
  } catch {
    // Ignore read failures.
  }

  return '';
}

async function ensureImagesDir(): Promise<void> {
  if (Platform.OS === 'web' || !documentDirectory) return;
  const info = await getInfoAsync(IMAGES_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
  }
}

async function writeBase64ImageToDocumentsDir(base64: string, mimeType: string): Promise<string> {
  if (!documentDirectory) {
    throw new Error('Document directory is unavailable');
  }

  await ensureImagesDir();
  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const destination = `${IMAGES_DIR}capture-${Date.now()}.${ext}`;
  await writeAsStringAsync(destination, base64, { encoding: EncodingType.Base64 });
  return destination;
}

async function persistDataUriToDocumentsDir(dataUri: string): Promise<string> {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid data URI');
  return writeBase64ImageToDocumentsDir(match[2], match[1]);
}

async function persistNativeImageToDocumentsDir(uri: string): Promise<string> {
  await ensureImagesDir();

  const filename = `capture-${Date.now()}.${uri.toLowerCase().endsWith('.png') ? 'png' : 'jpg'}`;
  const destination = `${IMAGES_DIR}${filename}`;

  try {
    await copyAsync({ from: uri, to: destination });
    const info = await getInfoAsync(destination);
    if (!info.exists) throw new Error('Copied image missing');
    return destination;
  } catch {
    const { base64, mimeType } = await imageUriToBase64(uri);
    return writeBase64ImageToDocumentsDir(base64, mimeType);
  }
}

async function toWebDataUri(uri: string): Promise<string> {
  if (uri.startsWith('data:')) return uri;
  const { base64, mimeType } = await imageUriToBase64(uri);
  return `data:${mimeType};base64,${base64}`;
}

export async function persistImage(uri: string): Promise<string> {
  if (!uri) return '';

  if (isWebImageRef(uri)) return uri;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;

  if (Platform.OS === 'web') {
    const dataUri = await compressDataUriForStorage(await toWebDataUri(uri));
    const ref = `web-image-ref:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const stored = await storeWebImageData(ref, dataUri);
    if (!stored) {
      throw new Error('No se pudo guardar la imagen en el navegador.');
    }
    storeWebImageInMemory(ref, dataUri);
    return ref;
  }

  if (uri.startsWith('data:')) {
    return persistDataUriToDocumentsDir(uri);
  }

  return persistNativeImageToDocumentsDir(uri);
}
