# Estado demo — Claridad (baseline estable)

**Versión:** demo baseline · **Fecha cierre:** 2026-05-29  
**Veredicto:** lista para presentación · **No es MVP funcional**

---

## Estado actual

| Área | Estado |
|------|--------|
| 15 pantallas definitivas | ✅ Navegables end-to-end |
| Diseño visual | ✅ Aprobado (design board) |
| Motion premium | ✅ Aprobado (Phase 5 + 5B) |
| QA producto | ✅ PASS · 8.4/10 |
| QA técnico | ✅ PASS · 8.2/10 |
| Expo Doctor | ✅ 21/21 checks |
| Typecheck | ✅ `npm run typecheck` |
| Arranque demo | ✅ `/` → `/(onboarding)/chaos-to-order` |
| Documentación demo | ✅ `docs/demo/` completa |

**Tipo de build:** prototipo navegable premium con datos mock centralizados en `src/data/`.

---

## Qué está aprobado

### Diseño
- Tokens, tipografía editorial, paleta cálida, composición alineada con [`docs/claridad-design-board.png`](../claridad-design-board.png).
- 15 pantallas: onboarding (5), login, home, empty, capture, processing, result, review, export, document view, settings.

### Motion
- Reanimated en transiciones, press scale, FAB entrance, processing sequence, tab crossfade, review confirm, export toast.
- Haptics en acciones clave (obturador, confirmación, export).
- Timing processing: 4 × 750 ms + navegación ~450 ms (~3,45 s total).

### Flujo demo
```
onboarding (5) → login → home → capture → processing → result → review → export
```
Atajo: onboarding 1 → **Iniciar sesión** → flujo desde home (~2 min).

### QA
- Sin issues críticos bloqueantes para demo.
- Safe area inferior ajustada en Home y Document View (Fase 6C).
- `app.json` válido; sin warnings de schema en expo-doctor.

---

## Qué es mock (no aprobado como funcional)

| Capacidad | Comportamiento actual |
|-----------|----------------------|
| Cámara | UI simulada (`PremiumCameraSurface`); obturador → processing |
| OCR / lectura | Textos y fragmentos estáticos en mocks |
| Procesamiento | Secuencia animada con timers; no job real |
| Export | Toast + haptic; sin PDF/MD/share/clipboard real |
| Auth | Cualquier CTA lleva a Home; sin backend |
| Persistencia | Datos en memoria (`mockDocuments`) |
| Búsqueda/filtros | Filtrado local sobre mocks |

Detalle: [`demo-limitations.md`](demo-limitations.md)

---

## Cómo ejecutar

```bash
cd claridad
npm install    # primera vez o tras cambios en package.json
npm start      # prewarm Metro 5+ min antes de presentar en vivo
npm run ios    # o npm run android / Expo Go
```

**Verificación:**
```bash
npm run typecheck
npx expo-doctor
```

**Guion y checklist:** [`demo-script.md`](demo-script.md) · [`demo-checklist.md`](demo-checklist.md)

**Assets de respaldo:** [`demo-assets.md`](demo-assets.md)

---

## Riesgos restantes

| Riesgo | Mitigación |
|--------|------------|
| Metro en frío / primera carga lenta | Prewarm; vídeos `docs/videos/phase5b-motion/` |
| Expectativa de OCR/PDF real | Usar guion; enfatizar reorganización editorial |
| Home (pantalla más débil en QA producto) | Opcional: saltar a capture vía FAB |
| Web como target secundario | Demo en iOS/Android preferida |
| Componentes no usados en runtime | Sin impacto en navegación; no bloquea demo |
| Recovery en vivo | Checklist en `demo-checklist.md`; rutas manuales en `demo-flow.md` |

---

## Siguiente fase recomendada

**Fase 8 — MVP funcional (propuesta):**

1. **Captura real** — integrar `expo-camera`, permisos, preview y almacenamiento de imagen.
2. **Pipeline backend** — job async para lectura/OCR con estados loading/error/retry.
3. **Modelo de lectura** — API o on-device con confidence scores reales alimentando review.
4. **Persistencia** — SQLite/local storage para documentos e imágenes.
5. **Export real** — generación PDF/Markdown, share sheet nativo, clipboard.
6. **Auth mínima** — sesión real si hay sync.
7. **Tests E2E** — CI con flujo crítico automatizado.

**No iniciar en demo baseline:** rediseño, cambios de tokens/motion, ni limpieza agresiva de código no usado salvo que genere errores de build.

---

## Referencias rápidas

- Changelog: [`CHANGELOG_DEMO.md`](CHANGELOG_DEMO.md)
- Flujo y rutas: [`demo-flow.md`](demo-flow.md)
- README proyecto: [`../../README.md`](../../README.md)
