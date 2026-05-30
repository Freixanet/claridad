import { jsPDF } from 'jspdf';

import { getCustomTopics } from '@/storage/customTopics';
import { buildTopicCatalog, getTopicMeta } from '@/utils/topicCatalog';

export type ExportSection = {
  title: string;
  category: string;
  content: string;
  items: string[];
};

export type ExportDocument = {
  title: string;
  sections: ExportSection[];
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const TITLE_SIZE = 22;
const SUBTITLE_SIZE = 11;
const SECTION_TITLE_SIZE = 18;
const BODY_SIZE = 11;
const META_SIZE = 11;
const LINE_HEIGHT = 16;
const SECTION_GAP = 24;
const CATEGORY_TITLE_GAP = 10;
const TITLE_BODY_GAP = 6;
const ITEM_GAP = 4;
const DOC_TITLE_SUBTITLE_GAP = 6;
const DOC_SUBTITLE_SECTIONS_GAP = 20;

function lineHeightForFontSize(size: number): number {
  return Math.ceil(size * 1.25);
}

export type PdfExportResult =
  | 'shared'
  | 'downloaded'
  | 'opened'
  | 'saved'
  | 'saved_and_opened'
  | 'cancelled'
  | 'failed';

export type PdfDeliveryResult = Exclude<PdfExportResult, 'saved'>;

export function sanitizeExportFilename(title: string): string {
  const cleaned = title.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 60);
  return cleaned || 'claridad-document';
}

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace('#', ''), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

type LayoutState = {
  pdf: jsPDF;
  y: number;
  lastContentPage: number;
};

function markContentPage(state: LayoutState) {
  state.lastContentPage = state.pdf.getNumberOfPages();
}

function trimTrailingBlankPages(state: LayoutState) {
  while (state.pdf.getNumberOfPages() > state.lastContentPage) {
    state.pdf.deletePage(state.pdf.getNumberOfPages());
  }
}

function pageBottom(): number {
  return PAGE_HEIGHT - MARGIN;
}

function fullPageContentHeight(): number {
  return PAGE_HEIGHT - MARGIN * 2;
}

function ensureSpace(state: LayoutState, height: number) {
  if (state.y + height > pageBottom()) {
    state.pdf.addPage();
    state.y = MARGIN;
  }
}

function ensureWholeSectionOnPage(state: LayoutState, sectionHeight: number) {
  if (state.y + sectionHeight <= pageBottom()) return;

  if (sectionHeight <= fullPageContentHeight()) {
    state.pdf.addPage();
    state.y = MARGIN;
  }
}

type SectionLayout = {
  titleLines: string[];
  contentLines: string[];
  itemBlocks: string[][];
  height: number;
  headerHeight: number;
};

function measureSectionLayout(pdf: jsPDF, section: ExportSection, isLast: boolean): SectionLayout {
  const titleLines = pdf.splitTextToSize(section.title, CONTENT_WIDTH);
  const contentLines = section.content.trim()
    ? pdf.splitTextToSize(section.content.trim(), CONTENT_WIDTH)
    : [];
  const itemBlocks = section.items.map((item) => pdf.splitTextToSize(item, CONTENT_WIDTH - 14));

  const metaLineHeight = lineHeightForFontSize(META_SIZE);
  const sectionTitleLineHeight = lineHeightForFontSize(SECTION_TITLE_SIZE);
  const bodyLineHeight = lineHeightForFontSize(BODY_SIZE);

  let height = metaLineHeight + CATEGORY_TITLE_GAP;
  height += titleLines.length * sectionTitleLineHeight + TITLE_BODY_GAP;

  if (contentLines.length > 0) {
    height += contentLines.length * bodyLineHeight + ITEM_GAP;
  }

  for (const lines of itemBlocks) {
    height += lines.length * bodyLineHeight + ITEM_GAP;
  }

  if (!isLast) {
    height += SECTION_GAP;
  }

  const headerHeight = metaLineHeight + CATEGORY_TITLE_GAP + titleLines.length * sectionTitleLineHeight + TITLE_BODY_GAP;

  return { titleLines, contentLines, itemBlocks, height, headerHeight };
}

function drawCategoryRow(
  state: LayoutState,
  label: string,
  dot: string,
  x: number,
  options?: { allowPageBreak?: boolean }
) {
  if (options?.allowPageBreak !== false) {
    ensureSpace(state, lineHeightForFontSize(META_SIZE));
  }
  const [dr, dg, db] = hexToRgb(dot);
  const dotRadius = 2.5;
  const dotGap = 8;

  state.pdf.setFont('helvetica', 'normal');
  state.pdf.setFontSize(META_SIZE);
  state.pdf.setTextColor(17, 24, 39);

  const textBaselineY = state.y;
  const dotCenterY = textBaselineY - META_SIZE * 0.34;

  state.pdf.setFillColor(dr, dg, db);
  state.pdf.circle(x + dotRadius, dotCenterY, dotRadius, 'F');

  state.pdf.text(label, x + dotRadius * 2 + dotGap, textBaselineY);

  state.y += lineHeightForFontSize(META_SIZE);
  markContentPage(state);
}

function drawTextBlock(
  state: LayoutState,
  lines: string | string[],
  x: number,
  width: number,
  size: number,
  options?: { bold?: boolean; color?: [number, number, number]; allowPageBreak?: boolean }
) {
  const lineArray = Array.isArray(lines) ? lines : [lines];
  const allowPageBreak = options?.allowPageBreak !== false;
  const lineHeight = lineHeightForFontSize(size);
  state.pdf.setFont('helvetica', options?.bold ? 'bold' : 'normal');
  state.pdf.setFontSize(size);
  if (options?.color) {
    state.pdf.setTextColor(...options.color);
  }

  for (const line of lineArray) {
    if (allowPageBreak) {
      ensureSpace(state, lineHeight);
    }
    state.pdf.text(line, x, state.y, { maxWidth: width });
    state.y += lineHeight;
    markContentPage(state);
  }
}

function drawSection(
  state: LayoutState,
  section: ExportSection,
  isLast: boolean,
  catalog: Record<string, { label: string; dot: string }>
) {
  const meta = getTopicMeta(section.category, catalog);
  const layout = measureSectionLayout(state.pdf, section, isLast);

  ensureWholeSectionOnPage(state, layout.height);

  const allowPageBreak = layout.height > fullPageContentHeight();
  if (allowPageBreak && state.y + layout.headerHeight > pageBottom()) {
    state.pdf.addPage();
    state.y = MARGIN;
  }

  drawCategoryRow(state, meta.label, meta.dot, MARGIN, { allowPageBreak });
  state.y += CATEGORY_TITLE_GAP;

  drawTextBlock(state, layout.titleLines, MARGIN, CONTENT_WIDTH, SECTION_TITLE_SIZE, {
    bold: true,
    color: [17, 24, 39],
    allowPageBreak,
  });
  state.y += TITLE_BODY_GAP;

  if (layout.contentLines.length > 0) {
    drawTextBlock(state, layout.contentLines, MARGIN, CONTENT_WIDTH, BODY_SIZE, {
      color: [55, 65, 81],
      allowPageBreak,
    });
    state.y += ITEM_GAP;
  }

  for (const itemLines of layout.itemBlocks) {
    const bodyLineHeight = lineHeightForFontSize(BODY_SIZE);

    if (allowPageBreak) {
      ensureSpace(state, itemLines.length * bodyLineHeight);
    }

    itemLines.forEach((line: string, lineIndex: number) => {
      if (allowPageBreak) {
        ensureSpace(state, bodyLineHeight);
      }

      if (lineIndex === 0) {
        state.pdf.setFont('helvetica', 'normal');
        state.pdf.setFontSize(BODY_SIZE);
        state.pdf.setTextColor(107, 114, 128);
        state.pdf.text('•', MARGIN, state.y);
      }

      state.pdf.setTextColor(55, 65, 81);
      state.pdf.text(line, MARGIN + 14, state.y, { maxWidth: CONTENT_WIDTH - 14 });
      state.y += bodyLineHeight;
      markContentPage(state);
    });

    state.y += ITEM_GAP;
  }

  if (!isLast) {
    state.y += SECTION_GAP;
  }
}

export async function buildDocumentPdf(doc: ExportDocument): Promise<Uint8Array> {
  const catalog = buildTopicCatalog(await getCustomTopics());
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const state: LayoutState = { pdf, y: MARGIN, lastContentPage: 1 };

  const titleLines = pdf.splitTextToSize(doc.title, CONTENT_WIDTH);
  drawTextBlock(state, titleLines, MARGIN, CONTENT_WIDTH, TITLE_SIZE, {
    bold: true,
    color: [17, 24, 39],
  });
  state.y += DOC_TITLE_SUBTITLE_GAP;

  drawTextBlock(state, 'Exported from Claridad', MARGIN, CONTENT_WIDTH, SUBTITLE_SIZE, {
    color: [107, 114, 128],
  });
  state.y += DOC_SUBTITLE_SECTIONS_GAP;

  doc.sections.forEach((section, index) => {
    drawSection(state, section, index === doc.sections.length - 1, catalog);
  });

  trimTrailingBlankPages(state);

  const buffer = pdf.output('arraybuffer');
  return new Uint8Array(buffer);
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

export async function writePdfToExports(filename: string, bytes: Uint8Array): Promise<string> {
  const { documentDirectory, writeAsStringAsync, makeDirectoryAsync, EncodingType } = await import(
    'expo-file-system/legacy'
  );

  if (!documentDirectory) {
    throw new Error('Document directory is unavailable');
  }

  const exportsDir = `${documentDirectory}exports/`;
  await makeDirectoryAsync(exportsDir, { intermediates: true });

  const uri = `${exportsDir}${filename}`;
  await writeAsStringAsync(uri, uint8ToBase64(bytes), { encoding: EncodingType.Base64 });
  return uri;
}

/** @deprecated Use writePdfToExports */
export async function writePdfToCache(filename: string, bytes: Uint8Array): Promise<string> {
  return writePdfToExports(filename, bytes);
}

function isMobileIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function triggerBrowserDownload(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function deliverPdfOnWeb(
  bytes: Uint8Array,
  filename: string
): Promise<PdfDeliveryResult> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 'failed';

  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
  const file = new File([blob], filename, { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const cleanup = () => window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
  const isIOS = isMobileIOS();

  if (isIOS) {
    const preview = window.open(url, '_blank', 'noopener,noreferrer');
    if (preview) {
      cleanup();
      return 'opened';
    }

    if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function') {
      try {
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: filename });
          cleanup();
          return 'shared';
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          cleanup();
          return 'cancelled';
        }
      }
    }

    triggerBrowserDownload(url, filename);
    cleanup();
    return 'downloaded';
  }

  const pickerWindow = window as Window & {
    showSaveFilePicker?: (options: {
      suggestedName?: string;
      types?: Array<{ description: string; accept: Record<string, string[]> }>;
    }) => Promise<{
      createWritable: () => Promise<{
        write: (data: Blob) => Promise<void>;
        close: () => Promise<void>;
      }>;
    }>;
  };

  if (typeof pickerWindow.showSaveFilePicker === 'function') {
    try {
      const handle = await pickerWindow.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'PDF document', accept: { 'application/pdf': ['.pdf'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      window.open(url, '_blank', 'noopener,noreferrer');
      cleanup();
      return 'downloaded';
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        cleanup();
        return 'cancelled';
      }
    }
  }

  triggerBrowserDownload(url, filename);
  window.open(url, '_blank', 'noopener,noreferrer');
  cleanup();
  return 'downloaded';
}
