import {
  buildDocumentPdf,
  deliverPdfOnWeb,
  sanitizeExportFilename,
  type ExportDocument,
  type PdfExportResult,
} from '@/utils/buildDocumentPdf';

export type { PdfExportResult };

export async function exportDocumentPdf(doc: ExportDocument): Promise<PdfExportResult> {
  const filename = `${sanitizeExportFilename(doc.title)}.pdf`;

  try {
    const bytes = await buildDocumentPdf(doc);
    return await deliverPdfOnWeb(bytes, filename);
  } catch (error) {
    console.error('PDF export failed:', error);
    return 'failed';
  }
}
