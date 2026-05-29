# Limitaciones del prototipo — Claridad

Documento honesto para presentadores, stakeholders y QA. **QA producto: 8.4/10 · QA técnico: 8.2/10** (Fases 6A–6C).

---

## Qué es este build

Un **prototipo navegable premium**: 15 pantallas definitivas, motion aprobado, mocks de datos coherentes y flujo end-to-end sin backend. Sirve para validar **experiencia, narrativa de confianza y calidad editorial**.

**No es** un MVP funcional con lectura de manuscritos ni export real.

---

## Simulaciones explícitas

### Cámara (mock)

- La pantalla Capturar usa `PremiumCameraSurface`: UI de viewfinder, encuadre animado, flash y haptics al pulsar obturador.
- **No** abre `expo-camera` ni guarda fotos.
- El obturador navega directamente a Procesando.

### OCR / lectura (mock)

- No hay modelo de ML ni API de transcripción.
- Textos manuscritos son componentes visuales (`HandwrittenPageMock`, datos en `src/data/mockDocuments.ts`).
- Los «fragmentos detectados» y temas son **datos estáticos** preparados para demo.

### Procesamiento (mock)

- Pantalla Procesando: secuencia de 4 pasos con timers (`STEP_DELAY_MS = 750`).
- Barra de progreso y checks son animación UI, no estado de un job real.
- Tras ~3,45 s navega automáticamente a Resultado.

### Export (mock)

- PDF, Markdown, copiar y compartir muestran **toast de confirmación** y haptic success.
- **No** se genera archivo, no hay share sheet nativo ni escritura al portapapeles.

### Auth y backend (mock)

- Login acepta cualquier input; Apple/Google son botones decorativos que llevan a Home.
- No hay sesión persistente, sync ni almacenamiento remoto.

### Búsqueda y filtros (mock)

- Home filtra `mockDocuments` en memoria.
- Los chips de fecha no alteran datos reales de calendario.

---

## Qué SÍ demuestra el prototipo

| Área | Evidencia en build |
|------|-------------------|
| Propuesta de valor | Onboarding: caos → orden, fragmentos, temas, confianza |
| Calidad visual | Tokens, tipografía editorial, design board cumplido |
| Motion premium | Reanimated, haptics, transiciones por grupo de rutas |
| Flujo de confianza | Trust badges, revisión split, fragmentos dudosos, confirmación |
| Arquitectura de producto | 15 rutas canónicas, mocks centralizados, tipos de navegación |
| Pipeline narrativo | Captura → procesamiento → resultado → revisión → export |
| Safe area / polish demo | FAB y scroll ajustados en Home y Document View (Fase 6C) |

---

## Qué falta para MVP funcional

| Capacidad | Estado actual | MVP necesitaría |
|-----------|---------------|-----------------|
| Captura real | UI simulada | `expo-camera`, permisos, preview, almacenamiento local |
| OCR / lectura manuscrita | Mock visual | Modelo on-device o API, confidence scores reales |
| Pipeline async | Timer en cliente | Cola de jobs, estados error/retry, offline |
| Edición de fragmentos | Solo lectura | CRUD fragmentos, merge/split, corrección |
| Export real | Toast | Generación PDF/MD, share sheet, clipboard API |
| Auth / sync | Mock | Proveedor auth, backend, multi-dispositivo |
| Persistencia | Mock en memoria | SQLite / almacenamiento documentos e imágenes |
| Tests E2E | Scripts QA manuales (Puppeteer) | CI con detox o similar |

---

## Cómo comunicarlo en demo

**Decir:**

- «Prototipo de experiencia — el motor viene en la siguiente fase.»
- «Los textos que veis son ejemplo fiel al diseño; la lectura automática conectará aquí.»
- «El flujo de revisión y confianza es real en producto; los datos son de muestra.»

**Evitar:**

- «Ya lee tu letra.»
- «Genera PDFs.»
- «Está listo para App Store.»

---

## Deuda técnica conocida (no bloquea demo)

- Componentes exportados no usados en runtime (`PressableScale`, `ExportOptionRow`, etc.) — sin impacto en navegación.
- Web como target secundario; demo en iOS/Android preferida.
- Home es la pantalla más débil en QA producto (contenido/listado, no bugs críticos).

---

## Verificación técnica (Fase 6C)

- `npm run typecheck` — pass
- `npx expo-doctor` — 21/21 checks
- Arranque `/` → `/(onboarding)/chaos-to-order`
- Smoke flow completo verificado por rutas en código
