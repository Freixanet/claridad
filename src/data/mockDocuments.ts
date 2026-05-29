import type { ClaridadDocument, ProcessingStep } from '@/types';

export const trustCopy = {
  noInvent: 'No inventamos contenido.',
  onlyReorganize: 'Solo reorganizamos lo que escribiste.',
  reviewBeforeExport: 'Revisa cada fragmento antes de exportar.',
  markDoubtful: 'Marcamos lo dudoso.',
} as const;

export const processingSteps: ProcessingStep[] = [
  { id: 'detect', label: 'Detectando escritura', completed: false },
  { id: 'identify', label: 'Identificando fragmentos', completed: false },
  { id: 'group', label: 'Agrupando por temas', completed: false },
  { id: 'structure', label: 'Generando estructura', completed: false },
];

/** Raw lines as Claridad "reads" them from the page — before organizing. */
export const originalPageLines: string[] = [
  'reunión diseño → martes 10:00',
  'leche sin lactosa / café / pan',
  'enviar wireframes al equipo!!',
  'flujo onboarding – acortar?',
  'tomates cherry (semana)',
  'comparar referencia editorial',
  'papel A5 premium',
  'presupuesto Q3 pendiente',
  'ver integración calendario',
  'onboarding más simple',
];

export const mockDocuments: ClaridadDocument[] = [
  {
    id: 'doc-ideas-proyecto',
    title: 'Ideas del proyecto',
    preview: 'Wireframes, reunión con diseño, presupuesto Q3…',
    updatedAt: '2026-05-28T14:30:00.000Z',
    topicCount: 3,
    fragmentCount: 9,
    topics: [
      {
        id: 'topic-work',
        kind: 'work',
        title: 'Trabajo',
        fragments: [
          { id: 'f1', text: 'Reunión con Ana — viernes 11am', confidence: 'high', order: 1 },
          { id: 'f2', text: 'Enviar propuesta a cliente', confidence: 'high', order: 2 },
          { id: 'f3', text: 'Revisar presupuesto Q2', confidence: 'high', order: 3 },
        ],
      },
      {
        id: 'topic-shopping',
        kind: 'shopping',
        title: 'Compras',
        fragments: [
          { id: 'f4', text: 'Leche', confidence: 'high', order: 4 },
          { id: 'f5', text: 'Huevos', confidence: 'high', order: 5 },
          { id: 'f6', text: 'Pan integral', confidence: 'high', order: 6 },
          { id: 'f7', text: 'Comida del perro', confidence: 'doubt', order: 7 },
        ],
      },
      {
        id: 'topic-project',
        kind: 'project',
        title: 'Ideas de proyecto',
        fragments: [
          { id: 'f8', text: 'App de organización', confidence: 'high', order: 8 },
          { id: 'f9', text: 'Integración con Calendario', confidence: 'high', order: 9 },
          { id: 'f10', text: 'Onboarding más simple', confidence: 'doubt', order: 10 },
        ],
      },
    ],
  },
  {
    id: 'doc-lista-compras',
    title: 'Lista de compras',
    preview: 'Leche, café, pan integral, tomates…',
    updatedAt: '2026-05-27T09:15:00.000Z',
    topicCount: 1,
    fragmentCount: 6,
    topics: [
      {
        id: 'topic-shopping-2',
        kind: 'shopping',
        title: 'Compras',
        fragments: [
          { id: 's1', text: 'Leche sin lactosa', confidence: 'high', order: 1 },
          { id: 's2', text: 'Café molido', confidence: 'high', order: 2 },
          { id: 's3', text: 'Pan integral', confidence: 'high', order: 3 },
          { id: 's4', text: 'Tomates cherry', confidence: 'doubt', order: 4 },
          { id: 's5', text: 'Aceite de oliva', confidence: 'high', order: 5 },
          { id: 's6', text: 'Yogur natural', confidence: 'high', order: 6 },
        ],
      },
    ],
  },
  {
    id: 'doc-notas-reunion',
    title: 'Notas de reunión',
    preview: 'Decisiones, pendientes, próximos pasos…',
    updatedAt: '2026-05-25T18:00:00.000Z',
    topicCount: 2,
    fragmentCount: 5,
    topics: [
      {
        id: 'topic-work-2',
        kind: 'work',
        title: 'Trabajo',
        fragments: [
          { id: 'r1', text: 'Aprobar mockups antes del viernes', confidence: 'high', order: 1 },
          { id: 'r2', text: 'Llamar a Laura sobre el contrato', confidence: 'high', order: 2 },
          { id: 'r3', text: 'Revisar métricas del último sprint', confidence: 'doubt', order: 3 },
        ],
      },
      {
        id: 'topic-ideas',
        kind: 'ideas',
        title: 'Ideas',
        fragments: [
          { id: 'r4', text: 'Probar captura con luz natural', confidence: 'high', order: 4 },
          { id: 'r5', text: 'Nueva sección de estadísticas', confidence: 'doubt', order: 5 },
        ],
      },
    ],
  },
  {
    id: 'doc-plan-personal',
    title: 'Plan personal',
    preview: 'Rutina, ejercicio, lecturas pendientes…',
    updatedAt: '2026-05-23T20:00:00.000Z',
    topicCount: 2,
    fragmentCount: 4,
    topics: [
      {
        id: 'topic-ideas-2',
        kind: 'ideas',
        title: 'Personal',
        fragments: [
          { id: 'p1', text: 'Correr martes y jueves 7am', confidence: 'high', order: 1 },
          { id: 'p2', text: 'Leer 30 minutos antes de dormir', confidence: 'high', order: 2 },
        ],
      },
      {
        id: 'topic-pending',
        kind: 'work',
        title: 'Pendientes',
        fragments: [
          { id: 'p3', text: 'Renovar seguro antes del 1 de junio', confidence: 'high', order: 3 },
          { id: 'p4', text: 'Llamar al médico', confidence: 'doubt', order: 4 },
        ],
      },
    ],
  },
];

export const featuredDocument = mockDocuments[0];
