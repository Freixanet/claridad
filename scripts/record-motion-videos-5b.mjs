/**
 * Fase 5B — grabaciones de motion premium con fixes aplicados.
 * Uso: node scripts/record-motion-videos-5b.mjs
 */
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import puppeteer from 'puppeteer';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs/videos/phase5b-motion');
const BASE = 'http://localhost:8081';
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2 };

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForContent(page, hint) {
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
      (n) => document.body.innerText.toUpperCase().includes(n.toUpperCase()),
      { timeout: 30000 },
      hint,
    );
  }
}

async function goto(page, routePath, hint) {
  await page.goto(`${BASE}${routePath}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await waitForContent(page, hint);
}

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
    if (!candidates[0]) return false;
    candidates[0].el.click();
    return true;
  }, needle);
  if (!clicked) throw new Error(`No clickable element for text: ${needle}`);
}

/** Click an element by aria-label; falls back to coordinates if aria not present. */
async function clickAria(page, label, fallbackY) {
  const sel = `[aria-label="${label}"]`;
  const found = await page.$(sel);
  if (found) {
    await found.click();
    return;
  }
  // AnimatedPressable may strip aria on web — fall back to centre of screen at Y.
  await page.mouse.click(VIEWPORT.width / 2, fallbackY ?? VIEWPORT.height / 2);
}

async function waitForText(page, needle, timeout = 20000) {
  await page.waitForFunction(
    (n) => document.body.innerText.toUpperCase().includes(n.toUpperCase()),
    { timeout },
    needle,
  );
}

/** Mouse press (pressIn + pressOut) to trigger scale animation without necessarily navigating. */
async function mousePress(page, x, y, holdMs = 180) {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await sleep(holdMs);
  await page.mouse.up();
}

class ScreencastRecorder {
  constructor(page) {
    this.page = page;
    this.client = null;
    this.frames = [];
    this.recording = false;
    this.startedAt = 0;
  }

  async start() {
    this.frames = [];
    this.client = await this.page.createCDPSession();
    await this.client.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 85,
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
      await this.client.send('Page.screencastFrameAck', { sessionId: event.sessionId }).catch(() => {});
    });
    await sleep(200);
  }

  async stop() {
    this.recording = false;
    if (this.client) {
      await this.client.send('Page.stopScreencast').catch(() => {});
    }
    const durationSec = Math.max(0.5, (Date.now() - this.startedAt) / 1000);
    return { frameCount: this.frames.length, durationSec };
  }

  async encode(outputPath, durationSec) {
    if (this.frames.length === 0) throw new Error('No frames captured');
    const tmp = await mkdtemp(path.join(tmpdir(), 'clar5b-'));
    try {
      await Promise.all(
        this.frames.map((buf, i) =>
          writeFile(path.join(tmp, `f${String(i).padStart(6, '0')}.jpg`), buf),
        ),
      );
      const fps = Math.min(30, Math.max(12, this.frames.length / durationSec));
      await execFileAsync('ffmpeg', [
        '-y',
        '-framerate', fps.toFixed(2),
        '-i', path.join(tmp, 'f%06d.jpg'),
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        outputPath,
      ]);
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  }
}

async function record(page, filename, action) {
  const outPath = path.join(OUT_DIR, filename);
  const rec = new ScreencastRecorder(page);
  await rec.start();
  try {
    await action();
  } finally {
    const { durationSec } = await rec.stop();
    await rec.encode(outPath, durationSec);
    console.log(`OK  ${filename} (${rec.frames.length} frames, ${durationSec.toFixed(1)}s)`);
  }
  return outPath;
}

// ---------------------------------------------------------------------------
// Recording routines
// ---------------------------------------------------------------------------

async function recordOnboardingFlowClean(page) {
  return record(page, 'onboarding-flow-clean.mp4', async () => {
    // Navigate directly — no pre-warm noise in this clip.
    await goto(page, '/chaos-to-order', 'Del caos');
    await sleep(2000); // animated FlowConnector + hero fade

    await clickText(page, 'Comenzar');
    await waitForText(page, 'Tomas la foto');
    await sleep(1600); // phone-mock fade-in

    await clickText(page, 'Siguiente');
    await waitForText(page, 'Detecta cada');
    await sleep(3200); // ScanBand sweep + staggered chips

    await clickText(page, 'Siguiente');
    await waitForText(page, 'Agrupado');
    await sleep(2200); // TopicSection stagger

    await clickText(page, 'Siguiente');
    await waitForText(page, 'Tus ideas');
    await sleep(2600); // concentric rings + trust badges
  });
}

async function recordCaptureToProcessingFixed(page) {
  return record(page, 'capture-to-processing-fixed.mp4', async () => {
    await goto(page, '/capture', 'Encuadra');
    await sleep(1800); // FocusFrame breathe

    // Press shutter.
    await clickAria(page, 'Capturar foto', VIEWPORT.height - 72);
    await sleep(600); // shutter scale + flash overlay peak

    // Wait for processing screen.
    await waitForText(page, 'LEYENDO', 12000);
    await sleep(1200);
  });
}

async function recordProcessingSequenceFixed(page) {
  return record(page, 'processing-sequence-fixed.mp4', async () => {
    await goto(page, '/processing', undefined);
    // STEP_DELAY_MS=750 × 4 steps + 450ms nav = 3450ms total.
    // Sleep slightly longer to capture all checks + progress bar fill.
    await sleep(4200);
  });
}

async function recordResultReviewExportFixed(page) {
  return record(page, 'result-review-export-fixed.mp4', async () => {
    await goto(page, '/result', 'Resultado');
    await sleep(1200);

    // Tab switch — should be soft crossfade now (fromOpacity 0.5, 180ms).
    await clickText(page, 'Original');
    await sleep(900);

    await clickText(page, 'Organizado');
    await sleep(900);

    // Navigate to Review via BottomActionBar "Más".
    await clickText(page, 'Más');
    await waitForText(page, 'Revisar');
    await sleep(1400);

    // Confirm with press scale + check pop.
    await clickText(page, 'Todo coincide');
    await sleep(700); // check pop

    // Wait for Export sheet slide_from_bottom.
    await waitForText(page, 'Exportar a PDF', 12000);
    await sleep(1600);
  });
}

async function recordHomeInteractionsFixed(page) {
  return record(page, 'home-interactions-fixed.mp4', async () => {
    await goto(page, '/home', 'Hola');
    await sleep(1600); // FAB entrance animation

    // Filter chips with animated colour transition.
    await clickText(page, 'Hoy');
    await sleep(700);
    await clickText(page, 'Esta semana');
    await sleep(700);
    await clickText(page, 'Todos');
    await sleep(600);

    // DocumentCard press scale.
    const cardBox = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      let node = walker.currentNode;
      while (node) {
        const el = /** @type {HTMLElement} */ (node);
        if ((el.innerText ?? '').includes('Ideas del proyecto') && el.offsetParent) {
          const r = el.getBoundingClientRect();
          if (r.width > 100) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        node = walker.nextNode();
      }
      return null;
    });
    if (cardBox) {
      await mousePress(page, cardBox.x, cardBox.y, 200);
    }
    await sleep(600);

    // Return to home in case card navigated away.
    const onHome = await page.evaluate(() =>
      document.body.innerText.toUpperCase().includes('HOLA'),
    );
    if (!onHome) {
      await goto(page, '/home', 'Hola');
      await sleep(600);
    }

    // FAB press scale.
    const fabSel = '[aria-label="Capturar nueva página"]';
    const fab = await page.$(fabSel);
    if (fab) {
      const box = await fab.boundingBox();
      if (box) await mousePress(page, box.x + box.width / 2, box.y + box.height / 2, 200);
    }
    await sleep(600);
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Warm the bundle once before recording.
  console.log('Pre-calentando bundle…');
  await page.goto(`${BASE}/home`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await waitForContent(page, 'Hola');
  await sleep(1500);

  const only = process.env.ONLY?.trim();
  const jobs = [
    ['onboarding-flow-clean.mp4', recordOnboardingFlowClean],
    ['capture-to-processing-fixed.mp4', recordCaptureToProcessingFixed],
    ['processing-sequence-fixed.mp4', recordProcessingSequenceFixed],
    ['result-review-export-fixed.mp4', recordResultReviewExportFixed],
    ['home-interactions-fixed.mp4', recordHomeInteractionsFixed],
  ].filter(([name]) => !only || name === only || name.startsWith(only));

  const results = [];
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

  console.log('\n--- Resumen ---');
  for (const r of results) {
    console.log(r.ok ? `✓ ${r.path}` : `✗ ${r.name}: ${r.error}`);
  }

  if (results.some((r) => !r.ok)) process.exitCode = 1;
}

main();
