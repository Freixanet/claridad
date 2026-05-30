import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const PENDING_CAPTURE_KEY = '@claridad/pending-capture:v1';
const PENDING_CAPTURE_MEMORY_MARKER = '__claridad_memory__';

/** Holds large data URIs for the current session (web / in-memory handoff). */
let pendingCaptureMemory: string | null = null;

function shouldStoreInMemory(uri: string): boolean {
  return Platform.OS === 'web' || uri.startsWith('data:') || uri.length > 8_192;
}

export async function setPendingCaptureUri(uri: string): Promise<void> {
  if (shouldStoreInMemory(uri)) {
    pendingCaptureMemory = uri;
    try {
      await AsyncStorage.setItem(PENDING_CAPTURE_KEY, PENDING_CAPTURE_MEMORY_MARKER);
    } catch {
      // Marker write failed — processing can still read pendingCaptureMemory this session.
    }
    return;
  }

  pendingCaptureMemory = null;
  await AsyncStorage.setItem(PENDING_CAPTURE_KEY, uri);
}

export async function getPendingCaptureUri(): Promise<string | null> {
  try {
    const stored = await AsyncStorage.getItem(PENDING_CAPTURE_KEY);
    if (stored === PENDING_CAPTURE_MEMORY_MARKER) {
      return pendingCaptureMemory;
    }
    return stored;
  } catch {
    return pendingCaptureMemory;
  }
}

export async function clearPendingCaptureUri(): Promise<void> {
  pendingCaptureMemory = null;
  try {
    await AsyncStorage.removeItem(PENDING_CAPTURE_KEY);
  } catch {
    // Ignore cleanup failures.
  }
}

export async function consumePendingCaptureUri(): Promise<string | null> {
  return getPendingCaptureUri();
}
