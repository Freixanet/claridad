import {
  deleteDocument,
  getDocument,
  listDocuments,
  processDocument,
  updateDocument,
} from '@/services/documentStore';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseApiPath(url: string): { path: string; searchParams: URLSearchParams } | null {
  try {
    const parsed = new URL(url, 'http://localhost');
    if (!parsed.pathname.startsWith('/api/documents')) return null;
    return { path: parsed.pathname, searchParams: parsed.searchParams };
  } catch {
    return null;
  }
}

async function readJsonFetchBody(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ body: Record<string, unknown>; rawBody: string | null; bodySource: string }> {
  if (init?.body) {
    const rawBody =
      typeof init.body === 'string'
        ? init.body
        : init.body instanceof URLSearchParams
          ? init.body.toString()
          : String(init.body);
    return {
      body: JSON.parse(rawBody) as Record<string, unknown>,
      rawBody,
      bodySource: 'init.body',
    };
  }

  if (typeof input !== 'string' && !(input instanceof URL)) {
    const request = input as Request;
    if (request.body) {
      const rawBody = await request.clone().text();
      if (rawBody) {
        return {
          body: JSON.parse(rawBody) as Record<string, unknown>,
          rawBody,
          bodySource: 'request.body',
        };
      }
    }
  }

  return { body: {}, rawBody: null, bodySource: 'none' };
}

function isInAppDocumentsRequest(url: string): boolean {
  // Only mock relative in-app routes (same origin as the Expo app).
  // Absolute URLs (e.g. http://192.168.1.16:3000/...) must reach the real dev/prod API.
  return url.startsWith('/api/documents');
}

async function handleMockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response | null> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (!isInAppDocumentsRequest(url)) return null;

  const api = parseApiPath(url);
  if (!api) return null;

  const method = init?.method?.toUpperCase() ?? (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET');

  if (api.path === '/api/documents' && method === 'GET') {
    const search = api.searchParams.get('search')?.trim() || undefined;
    const pinned = api.searchParams.get('pinned') === 'true';
    const documents = listDocuments({ search, pinned }).map(
      ({ id, title, source_image_url, topic_count, word_count, status, pinned: isPinned, created_at, updated_at }) => ({
        id,
        title,
        source_image_url,
        topic_count,
        word_count,
        status,
        pinned: isPinned,
        created_at,
        updated_at,
      })
    );
    return jsonResponse({ documents });
  }

  if (api.path === '/api/documents/process' && method === 'POST') {
    let body: Record<string, unknown> = {};
    try {
      body = (await readJsonFetchBody(input, init)).body;
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }
    const imageUrl = typeof body.image_url === 'string' ? body.image_url.trim() : '';
    if (!imageUrl) return jsonResponse({ error: 'image_url is required' }, 400);

    try {
      const document = await processDocument(imageUrl);
      return jsonResponse({ document });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Processing failed';
      return jsonResponse({ error: message }, 502);
    }
  }

  const idMatch = api.path.match(/^\/api\/documents\/(\d+)$/);
  if (idMatch) {
    const docId = parseInt(idMatch[1], 10);

    if (method === 'GET') {
      const document = getDocument(docId);
      if (!document) return jsonResponse({ error: 'Not found' }, 404);
      return jsonResponse({ document });
    }

    if (method === 'PATCH') {
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      const document = updateDocument(docId, body);
      if (!document) return jsonResponse({ error: 'Not found' }, 404);
      return jsonResponse({ document });
    }

    if (method === 'DELETE') {
      const ok = deleteDocument(docId);
      if (!ok) return jsonResponse({ error: 'Not found' }, 404);
      return jsonResponse({ ok: true });
    }
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

export function setupMockApi(): void {
  const originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const mock = await handleMockFetch(input, init);
    if (mock) return mock;
    return originalFetch(input, init);
  };
}
