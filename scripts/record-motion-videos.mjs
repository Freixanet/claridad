/**
 * Fase 5 — grabaciones cortas de motion premium (Expo Web + Puppeteer CDP screencast).
 * Uso: node scripts/record-motion-videos.mjs
 */
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import puppeteer from 'puppeteer';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs/videos/phase5-motion');
const BASE = 'http://localhost:8081';

const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2 };

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForApp(page, hint) {
  await page.waitForFunction(
    () => {
      const root = document.getElementById('root');
      const text = document.body?.innerText ?? '';
      return (
        root &&
        root.children.length > 0 &&
        text.trim().length > 10 &&
        !text.includes('Bundling') &&
        !text.includes('Downloading')
      );
    },
    { timeout: 90000, polling: 500 },
  );
  if (hint) {
    await page.waitForFunction(
      (needle) => document.body.innerText.includes(needle),
      { timeout: 30000 },
      hint,
    );
  }
}

async function warmBundle(page) {
  await page.goto(`${BASE}/home`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await waitForApp(page, 'Hola');
  await sleep(1500);
}

async function goto(page, routePath, hint) {
  await page.goto(`${BASE}${routePath}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await waitForApp(page, hint);
}

/** Click the first visible element whose text includes `needle`. */
async function clickText(page, needle) {
  const clicked = await page.evaluate((text) => {
    const candidates = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let node = walker.currentNode;
    while (node) {
      const el = /** @type {HTMLElement} */ (node);
      const t = el.innerText?.trim() ?? '';
      if (t && t.includes(text) && el.offsetParent !== null) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          candidates.push({ el, area: rect.width * rect.height, len: t.length });
        }
      }
      node = walker.nextNode();
    }
    candidates.sort((a, b) => a.area - b.area || a.len - b.len);
    const target = candidates[0]?.el;
    if (!target) return false;
    target.click();
    return true;
  }, needle);
  if (!clicked) throw new Error(`No clickable element for text: ${needle}`);
}

async function waitForText(page, needle) {
  await page.waitForFunction(
    (n) => document.body.innerText.toUpperCase().includes(n.toUpperCase()),
    { timeout: 20000 },
    needle,
  );
}

async function clickShutter(page) {
  try {
    await clickAria(page, 'Capturar foto');
    return;
  } catch {
    // Fallback: tap center of bottom shutter zone (RN Web may omit aria on AnimatedPressable).
    await page.mouse.click(VIEWPORT.width / 2, VIEWPORT.height - 72);
  }
}

async function clickAria(page, label) {
  const sel = `[aria-label="${label}"]`;
  await page.waitForSelector(sel, { timeout: 15000 });
  await page.click(sel);
}

/** Short press to show Reanimated press-scale without always navigating away. */
async function pressElement(page, needle) {
  const box = await page.evaluate((text) => {
    const candidates = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let node = walker.currentNode;
    while (node) {
      const el = /** @type {HTMLElement} */ (node);
      const t = el.innerText?.trim() ?? '';
      if (t && t.includes(text) && el.offsetParent !== null) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          candidates.push({ rect, area: rect.width * rect.height, len: t.length });
        }
      }
      node = walker.nextNode();
    }
    candidates.sort((a, b) => a.area - b.area || a.len - b.len);
    const r = candidates[0]?.rect;
    if (!r) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, needle);
  if (!box) throw new Error(`No element to press for: ${needle}`);
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  await sleep(180);
  await page.mouse.up();
}

class ScreencastRecorder {
  /** @param {import('puppeteer').Page} page */
  constructor(page) {
    this.page = page;
    /** @type {import('puppeteer').CDPSession | null} */
    this.client = null;
    /** @type {Buffer[]} */
    this.frames = [];
    this.recording = false;
    this.startedAt = 0;
  }

  async start() {
    this.frames = [];
    this.client = await this.page.createCDPSession();
    await this.client.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 82,
      maxWidth: VIEWPORT.width * VIEWPORT.deviceScaleFactor,
      maxHeight: VIEWPORT.height * VIEWPORT.deviceScaleFactor,
      everyNthFrame: 1,
    });
    this.recording = true;
    this.startedAt = Date.now();
    this.client.on('Page.screencastFrame', async (event) => {
      if (this.recording) {
        this.frames.push(Buffer.from(event.data, 'base64'));
      }
      await this.client.send('Page.screencastFrameAck', { sessionId: event.sessionId });
    });
    // Let screencast warm up.
    await sleep(300);
  }

  async stop() {
    this.recording = false;
    if (this.client) {
      await this.client.send('Page.stopScreencast');
    }
    const durationSec = Math.max(0.5, (Date.now() - this.startedAt) / 1000);
    return { frameCount: this.frames.length, durationSec };
  }

  async encode(outputPath, durationSec) {
    if (this.frames.length === 0) {
      throw new Error('No frames captured');
    }
    const tmp = await mkdtemp(path.join(tmpdir(), 'claridad-vid-'));
    try {
      await Promise.all(
        this.frames.map((buf, i) =>
          writeFile(path.join(tmp, `f${String(i).padStart(6, '0')}.jpg`), buf),
        ),
      );
      const fps = Math.min(30, Math.max(12, this.frames.length / durationSec));
      await execFileAsync('ffmpeg', [
        '-y',
        '-framerate',
        String(fps.toFixed(2)),
        '-i',
        path.join(tmp, 'f%06d.jpg'),
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
        outputPath,
      ]);
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  }
}

async function record(page, outputFile, action) {
  const outPath = path.join(OUT_DIR, outputFile);
  const recorder = new ScreencastRecorder(page);
  await recorder.start();
  try {
    await action();
  } finally {
    const { durationSec } = await recorder.stop();
    await recorder.encode(outPath, durationSec);
    console.log(`OK  ${outputFile} (${recorder.frames.length} frames, ${durationSec.toFixed(1)}s)`);
  }
  return outPath;
}

async function recordOnboardingFlow(page) {
  return record(page, 'onboarding-flow.mp4', async () => {
    await goto(page, '/chaos-to-order', 'Del caos');
    await sleep(2200); // FlowConnector nudge + hero fade-in

    await clickText(page, 'Comenzar');
    await waitForApp(page, 'Tomas la foto');
    await sleep(1800);

    await clickText(page, 'Siguiente');
    await waitForApp(page, 'Detecta cada');
    await sleep(3800); // ScanBand sweep + staggered chips

    await clickText(page, 'Siguiente');
    await waitForApp(page, 'Agrupado');
    await sleep(2400); // Topic cards stagger

    await clickText(page, 'Siguiente');
    await waitForApp(page, 'Tus ideas');
    await sleep(2800); // Emblem rings + trust badges
  });
}

async function recordCaptureToProcessing(page) {
  return record(page, 'capture-to-processing.mp4', async () => {
    await goto(page, '/capture', 'Encuadra');
    await sleep(2000); // FocusFrame breathe

    await clickShutter(page);
    await sleep(400); // Shutter press scale
    await sleep(400); // Flash overlay peak + fade

    await waitForText(page, 'leyendo');
    await sleep(1500);
  });
}

async function recordProcessingSequence(page) {
  return record(page, 'processing-sequence.mp4', async () => {
    await goto(page, '/processing', undefined);
    await sleep(5500); // Full 4-step sequence + success haptic window
  });
}

async function recordResultReviewExport(page) {
  return record(page, 'result-review-export.mp4', async () => {
    await goto(page, '/result', 'Resultado');
    await sleep(1500);

    await clickText(page, 'Original');
    await sleep(1200); // Tab fade

    await clickText(page, 'Organizado');
    await sleep(1200);

    await clickText(page, 'Más');
    await waitForApp(page, 'Revisar');
    await sleep(1500);

    await clickText(page, 'Todo coincide');
    await sleep(600); // Check pop

    await page.waitForFunction(
      () => document.body.innerText.includes('Exportar a PDF'),
      { timeout: 15000 },
    );
    await sleep(1800);
  });
}

async function recordHomeInteractions(page) {
  return record(page, 'home-interactions.mp4', async () => {
    await goto(page, '/home', 'Hola');
    await sleep(1800); // FAB entrance

    await clickText(page, 'Hoy');
    await sleep(900);

    await clickText(page, 'Esta semana');
    await sleep(900);

    await clickText(page, 'Todos');
    await sleep(700);

    await pressElement(page, 'Ideas del proyecto');
    await sleep(400);

    // Return to home for FAB (card may have navigated).
    await goto(page, '/home', 'Hola');
    await sleep(800);

    const fab = await page.$('[aria-label="Capturar nueva página"]');
    if (!fab) throw new Error('FAB not found');
    const fabBox = await fab.boundingBox();
    if (!fabBox) throw new Error('FAB box missing');
    await page.mouse.move(fabBox.x + fabBox.width / 2, fabBox.y + fabBox.height / 2);
    await page.mouse.down();
    await sleep(200);
    await page.mouse.up();
    await sleep(700);
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  console.log('Pre-calentando bundle…');
  await warmBundle(page);

  const results = [];
  const only = process.env.ONLY?.trim();
  const jobs = [
    ['onboarding-flow.mp4', recordOnboardingFlow],
    ['capture-to-processing.mp4', recordCaptureToProcessing],
    ['processing-sequence.mp4', recordProcessingSequence],
    ['result-review-export.mp4', recordResultReviewExport],
    ['home-interactions.mp4', recordHomeInteractions],
  ].filter(([name]) => !only || name === only || name.startsWith(only));

  for (const [name, fn] of jobs) {
    try {
      const out = await fn(page);
      results.push({ name, ok: true, path: out });
    } catch (err) {
      results.push({ name, ok: false, error: String(err) });
      console.error(`FAIL ${name}:`, err);
    }
  }

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  if (failed.length) process.exitCode = 1;

  console.log('\n--- Resumen ---');
  for (const r of results) {
    console.log(r.ok ? `✓ ${r.path}` : `✗ ${r.name}: ${r.error}`);
  }
}

main();
