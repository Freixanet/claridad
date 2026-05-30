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
    // Web export may prefix routes with experiments.baseUrl (e.g. /claridad).
    const path = parsed.pathname.replace(/^\/claridad(?=\/|$)/, '') || '/';
    if (!path.startsWith('/api/documents')) return null;
    return { path, searchParams: parsed.searchParams };
  } catch {
    return null;
  }
}

async function handleMockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response | null> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
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
    const body = init?.body ? JSON.parse(String(init.body)) : {};
    const imageUrl = body.image_url as string | undefined;
    if (!imageUrl) return jsonResponse({ error: 'image_url is required' }, 400);

    await new Promise((r) => setTimeout(r, 1200));
    const document = processDocument(imageUrl);
    return jsonResponse({ document });
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
