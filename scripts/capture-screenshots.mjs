/**
 * Fase 4B-QA Visual — captura las 15 pantallas en viewport móvil.
 * Uso: node scripts/capture-screenshots.mjs
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = process.env.SCREENSHOT_OUT_DIR
  ? path.resolve(process.env.SCREENSHOT_OUT_DIR)
  : path.join(ROOT, 'docs/screenshots/current');
const BASE = 'http://localhost:8081';

/** @type {{ file: string; path: string; waitMs?: number; hint?: string }[]} */
const SCREENS = [
  { file: '01-onboarding-chaos-to-order.png', path: '/chaos-to-order', waitMs: 1500, hint: 'Del caos' },
  { file: '02-onboarding-photograph-page.png', path: '/photograph-page', waitMs: 1500, hint: 'Tomas la foto' },
  { file: '03-onboarding-fragments-detected.png', path: '/fragments-detected', waitMs: 2000, hint: 'Detecta cada' },
  { file: '04-onboarding-grouped-by-topics.png', path: '/grouped-by-topics', waitMs: 1500, hint: 'Agrupado' },
  { file: '05-onboarding-review-before-trust.png', path: '/review-before-trust', waitMs: 1500, hint: 'Tus ideas' },
  { file: '06-login.png', path: '/login', waitMs: 900, hint: 'Bienvenido' },
  { file: '07-home.png', path: '/home', waitMs: 1500, hint: 'Hola' },
  { file: '08-empty-state.png', path: '/empty', waitMs: 1500, hint: 'Aquí aparecerán' },
  { file: '09-capture.png', path: '/capture', waitMs: 2000, hint: 'Encuadra' },
  { file: '10-processing.png', path: '/processing', waitMs: 1200 },
  { file: '11-result-organized.png', path: '/result', waitMs: 1500, hint: 'Resultado' },
  { file: '12-review-comparison.png', path: '/review', waitMs: 1500, hint: 'Revisar' },
  { file: '13-export.png', path: '/export', waitMs: 1500, hint: 'Exportar' },
  { file: '14-document-view.png', path: '/doc-ideas-proyecto', waitMs: 1500, hint: 'Ideas del proyecto' },
  { file: '15-settings.png', path: '/settings', waitMs: 800, hint: 'Ajustes' },
];

async function waitForApp(page, hint) {
  // Expo web puede tardar en compilar el bundle en la primera visita.
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

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
  });

  // Pre-calentar bundle de Metro.
  console.log('Pre-calentando bundle…');
  await page.goto(`${BASE}/home`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await waitForApp(page, 'Hola');
  await new Promise((r) => setTimeout(r, 2000));

  const results = [];

  for (const screen of SCREENS) {
    const dest = path.join(OUT_DIR, screen.file);
    try {
      await page.goto(`${BASE}${screen.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 120000,
      });
      await waitForApp(page, screen.path === '/processing' ? undefined : screen.hint);
      if (screen.waitMs) {
        await new Promise((r) => setTimeout(r, screen.waitMs));
      }
      await page.screenshot({ path: dest, type: 'png' });
      results.push({ file: screen.file, ok: true });
      console.log(`OK  ${screen.file}`);
    } catch (err) {
      results.push({ file: screen.file, ok: false, error: String(err) });
      console.error(`FAIL ${screen.file}:`, err);
    }
  }

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    process.exitCode = 1;
  }
}

main();
