import * as Sharing from 'expo-sharing';

import {
  buildDocumentPdf,
  sanitizeExportFilename,
  writePdfToExports,
  type ExportDocument,
  type PdfExportResult,
} from '@/utils/buildDocumentPdf';

export type { PdfExportResult };

async function openPdfPreview(uri: string): Promise<'preview' | 'shared' | 'none'> {
  try {
    const ExpoQuickLook = (await import('@magrinj/expo-quick-look')).default;
    if (await ExpoQuickLook.canPreview(uri)) {
      await ExpoQuickLook.previewFile({
        uri,
        editingMode: 'disabled',
        chooserTitle: 'Open PDF',
      });
      return 'preview';
    }
  } catch {
    // Native module unavailable (e.g. Expo Go) — fall back to the share sheet.
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
    });
    return 'shared';
  }

  return 'none';
}

export async function exportDocumentPdf(doc: ExportDocument): Promise<PdfExportResult> {
  const filename = `${sanitizeExportFilename(doc.title)}.pdf`;

  try {
    const bytes = await buildDocumentPdf(doc);
    const uri = await writePdfToExports(filename, bytes);
    const previewResult = await openPdfPreview(uri);

    if (previewResult === 'preview') return 'saved_and_opened';
    if (previewResult === 'shared') return 'shared';
    return 'saved';
  } catch {
    return 'failed';
  }
}
