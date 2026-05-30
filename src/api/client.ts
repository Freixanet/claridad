/**
 * Resolves API paths for fetch. The mock interceptor in setupMockApi matches on
 * pathname; using a leading slash keeps behavior consistent on web and native.
 */
export function apiPath(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path.startsWith('/') ? path : `/${path}`;
}

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiPath(path), init);
}
