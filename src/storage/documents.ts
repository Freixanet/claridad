import AsyncStorage from '@react-native-async-storage/async-storage';

export type StoredSection = {
  id: string;
  title: string;
  category: string;
  content: string;
  items: string[];
  source_excerpt: string;
};

export type StoredDocument = {
  id: number;
  title: string;
  source_image_url: string;
  raw_transcription: string;
  sections: StoredSection[];
  topic_count: number;
  word_count: number;
  status: string;
  pinned: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

const DOCUMENTS_KEY = 'claridad:documents';
const NEXT_ID_KEY = 'claridad:documents:next-id';
const LEGACY_DOCUMENTS_KEY = '@claridad/documents:v1';
const LEGACY_NEXT_ID_KEY = '@claridad/next-id:v1';

function isInlineImageData(uri: string): boolean {
  return uri.startsWith('data:');
}

function sanitizeForStorage(doc: StoredDocument): StoredDocument {
  return {
    ...doc,
    source_image_url: isInlineImageData(doc.source_image_url) ? '' : doc.source_image_url,
  };
}

async function migrateLegacyStorageIfNeeded(): Promise<void> {
  const current = await AsyncStorage.getItem(DOCUMENTS_KEY);
  if (current) return;

  const legacy = await AsyncStorage.getItem(LEGACY_DOCUMENTS_KEY);
  if (!legacy) return;

  await AsyncStorage.setItem(DOCUMENTS_KEY, legacy);

  const legacyNextId = await AsyncStorage.getItem(LEGACY_NEXT_ID_KEY);
  if (legacyNextId) {
    await AsyncStorage.setItem(NEXT_ID_KEY, legacyNextId);
  }
}

async function readDocuments(): Promise<StoredDocument[]> {
  await migrateLegacyStorageIfNeeded();

  try {
    const raw = await AsyncStorage.getItem(DOCUMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredDocument[]) : [];
  } catch {
    return [];
  }
}

async function writeDocuments(documents: StoredDocument[]): Promise<void> {
  const payload = documents.map(sanitizeForStorage);

  try {
    await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes('quota')) {
      throw new Error(
        'No hay espacio en el navegador para guardar el documento. Prueba con otra foto.'
      );
    }
    throw error;
  }
}

export async function getDocuments(): Promise<StoredDocument[]> {
  return readDocuments();
}

export async function saveDocument(doc: StoredDocument): Promise<void> {
  const documents = await readDocuments();
  const sanitized = sanitizeForStorage(doc);
  const index = documents.findIndex((entry) => entry.id === doc.id);

  if (index === -1) {
    documents.push(sanitized);
  } else {
    documents[index] = sanitized;
  }

  await writeDocuments(documents);
}

export async function deleteDocument(id: number): Promise<void> {
  const documents = await readDocuments();
  await writeDocuments(documents.filter((doc) => doc.id !== id));
}

export async function replaceDocuments(documents: StoredDocument[]): Promise<void> {
  await writeDocuments(documents);
}

export async function loadNextDocumentId(): Promise<number | null> {
  await migrateLegacyStorageIfNeeded();

  try {
    const raw = await AsyncStorage.getItem(NEXT_ID_KEY);
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveNextDocumentId(nextId: number): Promise<void> {
  await AsyncStorage.setItem(NEXT_ID_KEY, String(nextId));
}
