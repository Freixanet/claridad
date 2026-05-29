# Assets de demo — Claridad

Inventario de material visual y de respaldo para presentaciones. **No borrar carpetas** — scripts QA en `scripts/` las regeneran.

---

## Design board (referencia oficial)

| Asset | Ruta |
|-------|------|
| Design board completo | `docs/claridad-design-board.png` |

Contrato visual: tipografía, color, composición de las 15 pantallas.

---

## Screenshots

### Carpeta recomendada para demo (post Phase 5 motion)

`docs/screenshots/after-phase5/`

| # | Archivo | Pantalla |
|---|---------|----------|
| 01 | `01-onboarding-chaos-to-order.png` | Onboarding 1 |
| 02 | `02-onboarding-photograph-page.png` | Onboarding 2 |
| 03 | `03-onboarding-fragments-detected.png` | Onboarding 3 |
| 04 | `04-onboarding-grouped-by-topics.png` | Onboarding 4 |
| 05 | `05-onboarding-review-before-trust.png` | Onboarding 5 |
| 06 | `06-login.png` | Login |
| 07 | `07-home.png` | Home |
| 08 | `08-empty-state.png` | Empty state |
| 09 | `09-capture.png` | Capturar |
| 10 | `10-processing.png` | Procesando |
| 11 | `11-result-organized.png` | Resultado |
| 12 | `12-review-comparison.png` | Revisar |
| 13 | `13-export.png` | Exportar |
| 14 | `14-document-view.png` | Vista documento |
| 15 | `15-settings.png` | Ajustes |
| — | `all-screens-contact-sheet.png` | **Contact sheet 15 pantallas** |

### Otras carpetas (histórico)

| Carpeta | Notas |
|---------|-------|
| `docs/screenshots/current/` | Snapshot alternativo |
| `docs/screenshots/after-4c/` | Pre–Phase 5; usar solo si hace falta comparar |

---

## Vídeos de motion

### Recomendados (Phase 5B — fixes de timing)

`docs/videos/phase5b-motion/`

| Archivo | Contenido |
|---------|-----------|
| `onboarding-flow-clean.mp4` | Onboarding 1→5 |
| `home-interactions-fixed.mp4` | Home: búsqueda, FAB, tarjetas |
| `capture-to-processing-fixed.mp4` | Obturador → procesando |
| `processing-sequence-fixed.mp4` | 4 pasos ~3,5 s |
| `result-review-export-fixed.mp4` | Resultado → revisar → export |

### Histórico (Phase 5)

`docs/videos/phase5-motion/` — mismos nombres sin sufijo `-fixed`; preferir 5B para demo.

---

## Documentación demo (esta carpeta)

| Archivo | Uso |
|---------|-----|
| `docs/demo/demo-script.md` | Guion 2–3 min |
| `docs/demo/demo-checklist.md` | Pre-flight |
| `docs/demo/demo-flow.md` | Rutas y diagrama |
| `docs/demo/demo-limitations.md` | Honestidad técnica |
| `docs/demo/demo-assets.md` | Este índice |
| `docs/demo/README-demo-section.md` | Bloque para README |

---

## Scripts QA (no ejecutar en vivo salvo regenerar assets)

| Script | Función |
|--------|---------|
| `scripts/capture-screenshots.mjs` | Captura screenshots vía Puppeteer |
| `scripts/record-motion-videos.mjs` | Graba vídeos Phase 5 |
| `scripts/record-motion-videos-5b.mjs` | Graba vídeos Phase 5B |
| `scripts/make-contact-sheet.sh` | Genera contact sheet desde PNGs |

Requisitos: Metro en `localhost:8081`, dependencia `puppeteer` en devDependencies.

---

## Árbol de carpetas `docs/`

```
docs/
├── claridad-design-board.png
├── demo/                          ← documentación de presentación
├── screenshots/
│   ├── after-phase5/              ← preferido para demo
│   ├── after-4c/
│   └── current/
└── videos/
    ├── phase5-motion/
    └── phase5b-motion/            ← preferido para demo
```

---

## Kit mínimo para presentación offline

1. `all-screens-contact-sheet.png`
2. `result-review-export-fixed.mp4`
3. `capture-to-processing-fixed.mp4`
4. `demo-script.md` (impreso o segundo monitor)
5. `claridad-design-board.png` (slide de apertura opcional)

---

## Uso sugerido por formato

| Situación | Asset |
|-----------|-------|
| Pitch rápido sin dispositivo | Contact sheet + vídeo result-review-export |
| Demo live con red inestable | Vídeos 5B en cola de respaldo |
| Deep dive diseño | Design board + screenshots 01–15 |
| Pregunta «¿qué falta?» | `demo-limitations.md` |
