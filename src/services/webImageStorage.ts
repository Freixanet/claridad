import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const WEB_IMAGE_PREFIX = '@claridad/web-image:v1:';
const ASYNC_STORAGE_MAX_CHARS = 280_000;
const IDB_NAME = 'claridad-web-images';
const IDB_STORE = 'images';
const IDB_VERSION = 1;

function webImageStorageKey(ref: string): string {
  return `${WEB_IMAGE_PREFIX}${ref}`;
}

function openImageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }

    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
  });
}

async function putWebImageInIndexedDB(ref: string, dataUri: string): Promise<void> {
  const db = await openImageDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error('IndexedDB write failed'));
    };
    tx.objectStore(IDB_STORE).put(dataUri, ref);
  });
}

async function getWebImageFromIndexedDB(ref: string): Promise<string | null> {
  if (typeof indexedDB === 'undefined') return null;

  try {
    const db = await openImageDb();
    return await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      tx.oncomplete = () => db.close();
      tx.onerror = () => {
        db.close();
        reject(tx.error ?? new Error('IndexedDB read failed'));
      };
      const request = tx.objectStore(IDB_STORE).get(ref);
      request.onsuccess = () => resolve(typeof request.result === 'string' ? request.result : null);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB get failed'));
    });
  } catch {
    return null;
  }
}

export async function storeWebImageData(ref: string, dataUri: string): Promise<boolean> {
  if (Platform.OS !== 'web') return false;

  try {
    if (dataUri.length <= ASYNC_STORAGE_MAX_CHARS) {
      await AsyncStorage.setItem(webImageStorageKey(ref), dataUri);
      return true;
    }
  } catch {
    // Fall through to IndexedDB for large images.
  }

  try {
    await putWebImageInIndexedDB(ref, dataUri);
    return true;
  } catch {
    return false;
  }
}

export async function loadWebImageData(ref: string): Promise<string | null> {
  if (Platform.OS !== 'web') return null;

  try {
    const fromAsync = await AsyncStorage.getItem(webImageStorageKey(ref));
    if (fromAsync) return fromAsync;
  } catch {
    // Ignore and try IndexedDB.
  }

  return getWebImageFromIndexedDB(ref);
}

export async function deleteWebImageData(ref: string): Promise<void> {
  if (Platform.OS !== 'web') return;

  try {
    await AsyncStorage.removeItem(webImageStorageKey(ref));
  } catch {
    // Ignore cleanup failures.
  }

  try {
    const db = await openImageDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error ?? new Error('IndexedDB delete failed'));
      };
      tx.objectStore(IDB_STORE).delete(ref);
    });
  } catch {
    // Ignore cleanup failures.
  }
}
