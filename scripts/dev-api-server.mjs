/**
 * Local Gemini proxy — no Vercel login required.
 * Usage: node scripts/dev-api-server.mjs
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { GoogleGenAI, Type } from '@google/genai';

const PORT = Number(process.env.PORT ?? 3000);
const MODEL = 'gemini-3-flash-preview';
const MAX_BODY_BYTES = 4 * 1024 * 1024;

const ALLOWED_ORIGINS = [
  'https://freixanet.github.io',
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
  /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/,
];

function debugServerLog(message, data, hypothesisId) {
  try {
    appendFileSync(
      join(process.cwd(), '.cursor/debug-d740a4.log'),
      `${JSON.stringify({ sessionId: 'd740a4', location: 'dev-api-server.mjs', message, data, hypothesisId, timestamp: Date.now(), runId: 'pre-fix' })}\n`
    );
  } catch {
    // ignore
  }
}

function loadEnvLocal() {
  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((allowed) =>
    typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
  );
}

function buildPrompt(highFidelity, autoTitle, customTopics = []) {
  const structureHint = highFidelity
    ? 'Divide el contenido en tantas secciones temáticas como sean necesarias (3–8 si aplica). Sé exhaustivo pero fiel al original.'
    : 'Agrupa en 2–4 secciones temáticas claras. Prioriza simplicidad.';
  const titleHint = autoTitle
    ? 'Genera títulos editoriales claros para el documento y cada sección.'
    : 'Usa títulos descriptivos y concisos basados en el contenido visible.';
  const customTopicsHint =
    customTopics.length > 0
      ? `\n- Topics personalizados del usuario (usa EXACTAMENTE estas claves en category cuando encaje el contenido): ${customTopics
          .map((topic) => `${topic.key} (${topic.label})`)
          .join(', ')}.`
      : '';

  return `Eres Claridad, un asistente que reorganiza notas manuscritas en documentos editoriales.

REGLAS ESTRICTAS:
- Lee la imagen y transcribe TODO el texto manuscrito legible en raw_transcription (líneas separadas por \\n).
- Reorganiza por temas en sections SIN inventar contenido nuevo.
- No añadas ideas, tareas ni datos que no aparezcan en la página.
- Cada section debe incluir source_excerpt: un fragmento literal o casi literal del manuscrito que respalda esa sección.
- category debe ser una etiqueta corta en inglés slug (tasks, errands, ideas, notes, meeting, shopping, etc.).${customTopicsHint}
- items es una lista de viñetas cuando corresponda; content es texto corrido cuando corresponda. Pueden estar vacíos pero deben existir.
- id de cada section: slug corto en minúsculas con guiones (ej. "work-tasks").
- Responde en el mismo idioma predominante del manuscrito (español si la nota está en español).
- ${structureHint}
- ${titleHint}`;
}

function normalizeSections(sections) {
  return sections.map((section, index) => ({
    id: section.id?.trim() || `section-${index + 1}`,
    title: section.title?.trim() || `Sección ${index + 1}`,
    category: section.category?.trim() || 'notes',
    content: section.content?.trim() ?? '',
    items: Array.isArray(section.items)
      ? section.items.map((item) => String(item).trim()).filter(Boolean)
      : [],
    source_excerpt: section.source_excerpt?.trim() || '',
  }));
}

async function processImage(body) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured in .env.local');

  const imageBase64 = body.image_base64?.trim();
  const mimeType = body.mime_type?.trim() || 'image/jpeg';
  if (!imageBase64) throw new Error('image_base64 is required');

  if (Buffer.byteLength(imageBase64, 'utf8') > MAX_BODY_BYTES) {
    throw new Error('Image payload is too large (max 4 MB).');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      { inlineData: { mimeType, data: imageBase64 } },
      buildPrompt(Boolean(body.high_fidelity), body.auto_title !== false, body.custom_topics ?? []),
    ],
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          raw_transcription: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                content: { type: Type.STRING },
                items: { type: Type.ARRAY, items: { type: Type.STRING } },
                source_excerpt: { type: Type.STRING },
              },
              required: ['id', 'title', 'category', 'content', 'items', 'source_excerpt'],
            },
          },
        },
        required: ['title', 'raw_transcription', 'sections'],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error('Gemini returned an empty response.');

  const parsed = JSON.parse(text);
  if (!parsed.sections?.length) throw new Error('Gemini did not return any sections.');

  return {
    title: parsed.title?.trim() || 'Página organizada',
    raw_transcription: parsed.raw_transcription?.trim() || '',
    sections: normalizeSections(parsed.sections),
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, payload, origin) {
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = status;
  res.end(JSON.stringify(payload));
}

loadEnvLocal();

const server = createServer(async (req, res) => {
  const origin = req.headers.origin;
  const url = req.url ?? '/';

  if (req.method === 'OPTIONS' && (url.startsWith('/api/documents/process') || url.startsWith('/api/debug-log'))) {
    sendJson(res, 204, {}, origin);
    return;
  }

  if (req.method === 'POST' && url.startsWith('/api/debug-log')) {
    if (!isAllowedOrigin(origin)) {
      sendJson(res, 403, { error: 'Origin not allowed' }, origin);
      return;
    }
    try {
      const body = await readJsonBody(req);
      debugServerLog(body.message ?? 'client debug', body.data ?? body, body.hypothesisId ?? 'Z');
      sendJson(res, 200, { ok: true }, origin);
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON' }, origin);
    }
    return;
  }

  if (req.method === 'POST' && url.startsWith('/api/documents/process')) {
    const originAllowed = isAllowedOrigin(origin);
    debugServerLog('POST /api/documents/process incoming', { origin, originAllowed }, originAllowed ? 'E' : 'A');
    if (!originAllowed) {
      sendJson(res, 403, { error: 'Origin not allowed' }, origin);
      return;
    }

    try {
      const body = await readJsonBody(req);
      const base64Bytes = Buffer.byteLength(body.image_base64 ?? '', 'utf8');
      console.log(`POST /api/documents/process (${base64Bytes} bytes)`);
      debugServerLog('POST body parsed', { base64Bytes, mimeType: body.mime_type ?? null }, 'B');
      const result = await processImage(body);
      debugServerLog('POST success', { sectionCount: result.sections?.length ?? 0 }, 'E');
      sendJson(res, 200, result, origin);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('Processing error:', error);
      debugServerLog('POST failed', { errMsg: errMsg.slice(0, 200) }, 'E');
      sendJson(
        res,
        502,
        { error: error instanceof Error ? error.message : 'Processing failed' },
        origin
      );
    }
    return;
  }

  sendJson(res, 404, { error: 'Not found' }, origin);
});

server.listen(PORT, () => {
  console.log(`Claridad dev API running at http://localhost:${PORT}`);
  console.log('POST /api/documents/process');
  if (!process.env.GEMINI_API_KEY) {
    console.warn('Warning: GEMINI_API_KEY missing — add it to .env.local');
  }
});
