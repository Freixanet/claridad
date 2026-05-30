import type { Section } from '@/services/documentStore';
import { imageUriToBase64 } from '@/services/imageToBase64';
import { compressForGeminiApi } from '@/services/webImageCache';
import { getCustomTopics } from '@/storage/customTopics';
import { getApiBaseUrl } from '@/utils/apiBaseUrl';
import { debugClientLog } from '@/utils/debugClientLog';
import { Platform } from 'react-native';

export type ProcessImageOptions = {
  highFidelity?: boolean;
  autoTitle?: boolean;
};

type CustomTopicPayload = { key: string; label: string };

export type GeminiProcessResult = {
  title: string;
  raw_transcription: string;
  sections: Section[];
};

function normalizeGeminiError(message: string, status: number): string {
  if (status === 403) {
    return 'El proxy rechazó la petición (CORS). Reinicia npm run dev:api.';
  }
  if (message.includes('INVALID_ARGUMENT') || message.includes('Unable to process input image')) {
    return 'Gemini no pudo leer la imagen. Prueba con otra foto o menos zoom.';
  }
  if (message.includes('Failed to fetch') || message.includes('Network request failed')) {
    return 'No se pudo conectar al proxy. Comprueba npm run dev:api y la misma Wi‑Fi.';
  }
  return message || `Error del servidor (${status})`;
}

export async function processImageWithGemini(
  imageUrl: string,
  options: ProcessImageOptions = {}
): Promise<GeminiProcessResult> {
  let sourceUrl = imageUrl;
  if (Platform.OS === 'web') {
    const input =
      imageUrl.startsWith('data:') ? imageUrl : await (async () => {
        const { base64, mimeType } = await imageUriToBase64(imageUrl);
        return `data:${mimeType};base64,${base64}`;
      })();
    sourceUrl = await compressForGeminiApi(input);
  }

  await debugClientLog(
    'geminiProcess.ts:pre-base64',
    'image prepared for gemini',
    {
      imageUrlLen: imageUrl.length,
      sourceUrlLen: sourceUrl.length,
      sourcePrefix: sourceUrl.slice(0, 32),
    },
    'B'
  );

  const { base64, mimeType } = await imageUriToBase64(sourceUrl);
  if (!base64) {
    await debugClientLog('geminiProcess.ts:empty-base64', 'base64 empty after read', {}, 'B');
    throw new Error('No se pudo leer la imagen. Vuelve a capturar la foto.');
  }

  const apiBaseUrl = getApiBaseUrl();
  const resolvedMimeType = sourceUrl.startsWith('data:image/jpeg') ? 'image/jpeg' : mimeType;
  const customTopics = await getCustomTopics();
  const customTopicsPayload: CustomTopicPayload[] = customTopics.map((topic) => ({
    key: topic.key,
    label: topic.label,
  }));

  await debugClientLog(
    'geminiProcess.ts:pre-fetch',
    'calling gemini proxy',
    {
      apiBaseUrl,
      mimeType: resolvedMimeType,
      base64Len: base64.length,
      pageHost: typeof window !== 'undefined' ? window.location.hostname : null,
    },
    'C'
  );

  let response: Response;
  let requestBody: string;
  try {
    requestBody = JSON.stringify({
      image_base64: base64,
      mime_type: resolvedMimeType,
      high_fidelity: options.highFidelity ?? false,
      auto_title: options.autoTitle ?? true,
      custom_topics: customTopicsPayload,
    });
  } catch {
    await debugClientLog('geminiProcess.ts:stringify-fail', 'JSON.stringify body failed', { base64Len: base64.length }, 'G');
    throw new Error('La imagen es demasiado grande para enviar. Prueba con otra foto.');
  }

  try {
    response = await fetch(`${apiBaseUrl}/api/documents/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    });
  } catch (error) {
    await debugClientLog(
      'geminiProcess.ts:fetch-error',
      'fetch to proxy failed',
      {
        apiBaseUrl,
        errorName: error instanceof Error ? error.name : 'unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      'D'
    );
    throw new Error(
      normalizeGeminiError(
        error instanceof Error ? error.message : String(error),
        0
      )
    );
  }

  const payload = await response.json().catch(() => ({}));
  await debugClientLog(
    'geminiProcess.ts:response',
    'proxy response received',
    {
      status: response.status,
      ok: response.ok,
      errorPreview: typeof payload.error === 'string' ? payload.error.slice(0, 120) : null,
      sectionCount: Array.isArray(payload.sections) ? payload.sections.length : 0,
    },
    response.status === 403 ? 'A' : 'E'
  );

  if (!response.ok) {
    const serverMessage = typeof payload.error === 'string' ? payload.error : '';
    throw new Error(normalizeGeminiError(serverMessage, response.status));
  }

  if (!payload.sections?.length) {
    throw new Error('Gemini no devolvió secciones organizadas.');
  }

  return {
    title: payload.title ?? 'Página organizada',
    raw_transcription: payload.raw_transcription ?? '',
    sections: payload.sections,
  };
}
