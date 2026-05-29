export type Section = {
  id: string;
  title: string;
  category: string;
  content: string;
  items: string[];
  source_excerpt: string;
};

export type DocumentRow = {
  id: number;
  title: string;
  source_image_url: string;
  raw_transcription: string;
  sections: Section[];
  topic_count: number;
  word_count: number;
  status: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

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
    created_at: '2026-05-25T18:00:00.000Z',
    updated_at: '2026-05-25T18:00:00.000Z',
  },
];

seedDocuments.forEach((doc) => {
  doc.word_count = countWords(doc.sections);
});

let documents = [...seedDocuments];
let nextId = 4;

export function listDocuments(params: { search?: string; pinned?: boolean }): DocumentRow[] {
  let result = [...documents];

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

export function updateDocument(id: number, patch: Partial<Pick<DocumentRow, 'title' | 'pinned' | 'sections'>>): DocumentRow | undefined {
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
  return updated;
}

export function deleteDocument(id: number): boolean {
  const before = documents.length;
  documents = documents.filter((d) => d.id !== id);
  return documents.length < before;
}

export function processDocument(imageUrl: string): DocumentRow {
  const sections: Section[] = [
    {
      id: 'captured-1',
      title: 'Captured notes',
      category: 'notes',
      content: 'Your handwritten page has been read and organized into this section.',
      items: [],
      source_excerpt: 'From your photograph',
    },
    {
      id: 'captured-2',
      title: 'Action items',
      category: 'tasks',
      content: '',
      items: ['Review the organized sections', 'Verify fidelity in Review mode'],
      source_excerpt: 'Detected from page',
    },
  ];

  const doc: DocumentRow = {
    id: nextId++,
    title: 'New organized page',
    source_image_url: imageUrl,
    raw_transcription: 'Handwritten content from your captured page.',
    sections,
    topic_count: sections.length,
    word_count: countWords(sections),
    status: 'ready',
    pinned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  documents = [doc, ...documents];
  return doc;
}
