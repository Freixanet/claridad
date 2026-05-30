import { GoogleGenAI, Type } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

import { isAllowedOrigin } from '../../src/utils/corsOrigins';

const MODEL = 'gemini-3-flash-preview';
const MAX_BODY_BYTES = 4 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

type ProcessRequestBody = {
  image_base64?: string;
  mime_type?: string;
  high_fidelity?: boolean;
  auto_title?: boolean;
  custom_topics?: { key: string; label: string }[];
};

type SectionResult = {
  id: string;
  title: string;
  category: string;
  content: string;
  items: string[];
  source_excerpt: string;
};

type ProcessResult = {
  title: string;
  raw_transcription: string;
  sections: SectionResult[];
};

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function setCorsHeaders(res: VercelResponse, origin: string | undefined): void {
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    rateLimitBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false;
  bucket.count += 1;
  return true;
}

function buildPrompt(
  highFidelity: boolean,
  autoTitle: boolean,
  customTopics: { key: string; label: string }[] = []
): string {
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

function normalizeSections(sections: SectionResult[]): SectionResult[] {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  const clientIp =
    (typeof req.headers['x-forwarded-for'] === 'string'
      ? req.headers['x-forwarded-for'].split(',')[0]?.trim()
      : req.socket.remoteAddress) ?? 'unknown';

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const body = (req.body ?? {}) as ProcessRequestBody;
  const imageBase64 = body.image_base64?.trim();
  const mimeType = body.mime_type?.trim() || 'image/jpeg';

  if (!imageBase64) {
    return res.status(400).json({ error: 'image_base64 is required' });
  }

  const payloadBytes = Buffer.byteLength(imageBase64, 'utf8');
  if (payloadBytes > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'Image payload is too large (max 4 MB).' });
  }

  const highFidelity = Boolean(body.high_fidelity);
  const autoTitle = body.auto_title !== false;
  const customTopics = Array.isArray(body.custom_topics)
    ? body.custom_topics.filter(
        (topic): topic is { key: string; label: string } =>
          typeof topic?.key === 'string' && typeof topic?.label === 'string'
      )
    : [];

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          inlineData: {
            mimeType,
            data: imageBase64,
          },
        },
        buildPrompt(highFidelity, autoTitle, customTopics),
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
                  items: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
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
    if (!text) {
      return res.status(502).json({ error: 'Gemini returned an empty response.' });
    }

    const parsed = JSON.parse(text) as ProcessResult;
    if (!parsed.sections?.length) {
      return res.status(502).json({ error: 'Gemini did not return any sections.' });
    }

    const result: ProcessResult = {
      title: parsed.title?.trim() || 'Página organizada',
      raw_transcription: parsed.raw_transcription?.trim() || '',
      sections: normalizeSections(parsed.sections),
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Gemini processing error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to process image with Gemini.';
    return res.status(502).json({ error: message });
  }
}
