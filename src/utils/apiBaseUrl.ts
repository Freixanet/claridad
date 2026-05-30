import { Platform } from 'react-native';

function resolveDevApiHost(configured: string): string {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return configured;
  }

  try {
    const apiUrl = new URL(configured);
    const pageHost = window.location.hostname;
    const isLocalApiHost =
      apiUrl.hostname === 'localhost' || apiUrl.hostname === '127.0.0.1';
    const isRemotePageHost =
      pageHost !== 'localhost' && pageHost !== '127.0.0.1' && pageHost.length > 0;

    if (isLocalApiHost && isRemotePageHost) {
      apiUrl.hostname = pageHost;
      return apiUrl.origin;
    }
  } catch {
    // Keep configured URL when parsing fails.
  }

  return configured;
}

export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');
  if (configured) return resolveDevApiHost(configured);

  if (__DEV__) {
    return resolveDevApiHost('http://localhost:3000');
  }

  throw new Error(
    'API no configurada. Define EXPO_PUBLIC_API_URL con la URL de tu proxy en Vercel.'
  );
}
