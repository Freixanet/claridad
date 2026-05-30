import { processImageWithGemini } from '@/services/geminiProcess';
import { persistImage } from '@/services/documentPersistence';
import { getProcessingPreferences } from '@/services/processingPreferences';
import {
  getDocuments,
  loadNextDocumentId,
  replaceDocuments,
  saveDocument,
  saveNextDocumentId,
  type StoredDocument,
  type StoredSection,
} from '@/storage/documents';

export type Section = StoredSection;
export type DocumentRow = StoredDocument;

function countWords(sections: Section[]): number {
  return sections.reduce((acc, s) => {
    const fromContent = s.content ? s.content.split(/\s+/).filter(Boolean).length : 0;
    const fromItems = s.items ? s.items.join(' ').split(/\s+/).filter(Boolean).length : 0;
    return acc + fromContent + fromItems;
  }, 0);
}

const seedDocuments: DocumentRow[] = [
  {
    id: 1,
    title: 'Ideas del proyecto',
    source_image_url: '',
    raw_transcription:
      'reunión diseño → martes 10:00\nleche sin lactosa / café / pan\nenviar wireframes al equipo!!\nflujo onboarding – acortar?\ntomates cherry (semana)',
    sections: [
      {
        id: 'work',
        title: 'Trabajo y diseño',
        category: 'tasks',
        content: 'Reunión con Ana el viernes a las 11am. Enviar propuesta a cliente. Revisar presupuesto Q2.',
        items: ['Enviar wireframes al equipo', 'Aprobar mockups antes del viernes'],
        source_excerpt: 'reunión diseño → martes 10:00',
      },
      {
        id: 'shopping',
        title: 'Compras',
        category: 'errands',
        content: '',
        items: ['Leche sin lactosa', 'Café', 'Pan integral', 'Tomates cherry'],
        source_excerpt: 'leche sin lactosa / café / pan',
      },
      {
        id: 'project',
        title: 'Ideas de producto',
        category: 'ideas',
        content: 'App de organización con integración de calendario. Onboarding más simple.',
        items: ['Flujo onboarding — acortar', 'Comparar referencia editorial'],
        source_excerpt: 'flujo onboarding – acortar?',
      },
    ],
    topic_count: 3,
    word_count: 0,
    status: 'ready',
    pinned: true,
    archived: false,
    created_at: '2026-05-28T14:30:00.000Z',
    updated_at: '2026-05-28T14:30:00.000Z',
  },
  {
    id: 2,
    title: 'Lista de compras',
    source_image_url: '',
    raw_transcription: 'leche sin lactosa\ncafé molido\npan integral\ntomates cherry',
    sections: [
      {
        id: 'shopping',
        title: 'Supermercado',
        category: 'errands',
        content: '',
        items: ['Leche sin lactosa', 'Café molido', 'Pan integral', 'Tomates cherry', 'Aceite de oliva'],
        source_excerpt: 'leche sin lactosa',
      },
    ],
    topic_count: 1,
    word_count: 0,
    status: 'ready',
    pinned: false,
    archived: false,
    created_at: '2026-05-27T09:15:00.000Z',
    updated_at: '2026-05-27T09:15:00.000Z',
  },
  {
    id: 3,
    title: 'Notas de reunión',
    source_image_url: '',
    raw_transcription: 'aprobar mockups\nllamar a laura\nrevisar métricas sprint',
    sections: [
      {
        id: 'decisions',
        title: 'Decisiones',
        category: 'tasks',
        content: 'Aprobar mockups antes del viernes. Llamar a Laura sobre el contrato.',
        items: ['Revisar métricas del último sprint'],
        source_excerpt: 'aprobar mockups',
      },
      {
        id: 'ideas',
        title: 'Ideas',
        category: 'ideas',
        content: '',
        items: ['Probar captura con luz natural', 'Nueva sección de estadísticas'],
        source_excerpt: 'probar captura',
      },
    ],
    topic_count: 2,
    word_count: 0,
    status: 'ready',
    pinned: false,
    archived: false,
    created_at: '2026-05-25T18:00:00.000Z',
    updated_at: '2026-05-25T18:00:00.000Z',
  },
];

seedDocuments.forEach((doc) => {
  doc.word_count = countWords(doc.sections);
});

let documents = [...seedDocuments];
let nextId = 4;
let hydrated = false;

async function persistDocuments(): Promise<void> {
  await replaceDocuments(documents);
  await saveNextDocumentId(nextId);
}

export async function hydrateDocumentStore(): Promise<void> {
  if (hydrated) return;

  const persisted = await getDocuments();
  const persistedNextId = await loadNextDocumentId();

  if (persisted.length > 0) {
    documents = persisted.map((doc) => ({
      ...doc,
      archived: doc.archived ?? false,
    }));
    nextId = persistedNextId ?? documents.length + 1;
  } else {
    await persistDocuments();
  }

  hydrated = true;
}

export function listDocuments(params: { search?: string; pinned?: boolean }): DocumentRow[] {
  let result = documents.filter((d) => !d.archived);

  if (params.pinned) {
    result = result.filter((d) => d.pinned);
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.raw_transcription.toLowerCase().includes(q) ||
        d.sections.some(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.content.toLowerCase().includes(q) ||
            s.items.some((i) => i.toLowerCase().includes(q))
        )
    );
  }

  return result.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function getDocument(id: number): DocumentRow | undefined {
  return documents.find((d) => d.id === id);
}

export function updateDocument(
  id: number,
  patch: Partial<Pick<DocumentRow, 'title' | 'pinned' | 'archived' | 'sections'>>
): DocumentRow | undefined {
  const idx = documents.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;

  const current = documents[idx];
  const sections = patch.sections ?? current.sections;
  const updated: DocumentRow = {
    ...current,
    ...patch,
    sections,
    topic_count: sections.length,
    word_count: countWords(sections),
    updated_at: new Date().toISOString(),
  };
  documents[idx] = updated;
  void persistDocuments();
  return updated;
}

export function deleteDocument(id: number): boolean {
  const before = documents.length;
  documents = documents.filter((d) => d.id !== id);
  if (documents.length < before) {
    void persistDocuments();
    return true;
  }
  return false;
}

export async function processDocument(imageUrl: string): Promise<DocumentRow> {
  const prefs = await getProcessingPreferences();
  const persistentImageUrl = await persistImage(imageUrl);
  const geminiResult = await processImageWithGemini(imageUrl, {
    highFidelity: prefs.highFidelity,
    autoTitle: prefs.autoTitle,
  });

  const doc: DocumentRow = {
    id: nextId++,
    title: geminiResult.title,
    source_image_url: persistentImageUrl,
    raw_transcription: geminiResult.raw_transcription,
    sections: geminiResult.sections,
    topic_count: geminiResult.sections.length,
    word_count: countWords(geminiResult.sections),
    status: 'ready',
    pinned: false,
    archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  documents = [doc, ...documents];
  await persistDocuments();
  await saveNextDocumentId(nextId);
  return doc;
}
