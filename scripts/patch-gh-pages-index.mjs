/**
 * Post-export: enrich index.html for GitHub Pages (meta + phone frame on desktop).
 * Run after `npx expo export -p web`.
 */
import fs from 'node:fs';
import path from 'node:path';

const indexPath = path.join(process.cwd(), 'dist', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

html = html.replace('<html lang="en">', '<html lang="es">');

const inject = `
    <meta name="description" content="Claridad — prototipo demo. Notas manuscritas a documentos editoriales organizados por temas." />
    <meta name="theme-color" content="#F7F4EF" />
    <meta property="og:title" content="Claridad" />
    <meta property="og:description" content="Del caos al orden. Prototipo navegable premium." />
    <style id="claridad-gh-pages">
      @media (max-width: 519px) {
        html, body, #root {
          height: 100%;
        }
        body {
          background: #ffffff !important;
          overflow: hidden !important;
        }
        #root {
          width: 100% !important;
          max-width: none !important;
          height: 100% !important;
          min-height: 100% !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
      }
      @media (min-width: 520px) {
        html, body { height: 100%; }
        body {
          background: #2a2826 !important;
          display: flex !important;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          box-sizing: border-box;
          overflow: auto !important;
        }
        #root {
          width: 100% !important;
          max-width: 430px !important;
          height: min(92vh, 920px) !important;
          min-height: 640px;
          border-radius: 28px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.06),
            0 24px 80px rgba(0,0,0,0.45);
        }
      }
    </style>
`;

if (!html.includes('claridad-gh-pages')) {
  html = html.replace('</head>', `${inject}</head>`);
}

fs.writeFileSync(indexPath, html);
console.log('Patched dist/index.html for GitHub Pages');
