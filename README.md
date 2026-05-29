# Claridad

Premium editorial scanner: convierte fotos de libretas manuscritas en documentos limpios, estructurados y fieles.

[![Demo en GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-F7F4EF?style=for-the-badge&labelColor=D0492B)](https://freixanet.github.io/claridad/)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2056-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)

**Probar en el navegador:** [freixanet.github.io/claridad](https://freixanet.github.io/claridad/) — prototipo navegable (web); cámara, OCR y export son simulados.

<p align="center">
  <img src="docs/screenshots/after-phase5/all-screens-contact-sheet.png" alt="Claridad — 15 pantallas" width="720" />
</p>

## Referencia visual

Contrato oficial: [`docs/claridad-design-board.png`](docs/claridad-design-board.png)

## Desarrollo

```bash
cd /Users/mfreixanet/Projects/claridad
npm install
npm start
```

- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`
- Tipos: `npm run typecheck`

## Demo

Claridad es un **prototipo navegable premium** (QA producto 8.4/10, QA técnico 8.2/10): 15 pantallas, motion aprobado y flujo completo **sin OCR, cámara ni export reales**. Sirve para presentar experiencia, confianza y calidad editorial.

### Arrancar en 3 pasos

```bash
cd claridad
npm install   # solo la primera vez o tras cambios en dependencias
npm start
```

Abre en simulador iOS (`npm run ios`), Android (`npm run android`) o Expo Go. La app arranca en **`/(onboarding)/chaos-to-order`**.

**Atajo demo (~2 min):** en la primera pantalla, pulsa **«¿Ya tienes cuenta? Iniciar sesión»** → Home → FAB captura → obturador → espera procesamiento (~3,5 s) → Resultado → Revisar → Exportar.

### Flujo completo

```
onboarding (5) → login → home → capture → processing → result → review → export
```

Rutas exactas y diagrama: [`docs/demo/demo-flow.md`](docs/demo/demo-flow.md)

### Documentación de presentación

| Doc | Descripción |
|-----|-------------|
| [`docs/demo/demo-script.md`](docs/demo/demo-script.md) | Guion 2–3 min: qué decir y qué tocar |
| [`docs/demo/demo-checklist.md`](docs/demo/demo-checklist.md) | Checklist pre-demo y recovery |
| [`docs/demo/demo-limitations.md`](docs/demo/demo-limitations.md) | Qué es mock vs. qué falta para MVP |
| [`docs/demo/demo-assets.md`](docs/demo/demo-assets.md) | Screenshots, vídeos, design board |
| [`docs/demo/DEMO_STATUS.md`](docs/demo/DEMO_STATUS.md) | Baseline estable y estado actual |
| [`docs/demo/CHANGELOG_DEMO.md`](docs/demo/CHANGELOG_DEMO.md) | Historial de hitos demo |

### Assets de respaldo

- Contact sheet: [`docs/screenshots/after-phase5/all-screens-contact-sheet.png`](docs/screenshots/after-phase5/all-screens-contact-sheet.png)
- Vídeos motion: [`docs/videos/phase5b-motion/`](docs/videos/phase5b-motion/)
- Referencia visual: [`docs/claridad-design-board.png`](docs/claridad-design-board.png)

### Verificación rápida

```bash
npm run typecheck
npx expo-doctor
```

### Importante

No prometer lectura real de manuscritos ni generación de PDF en esta build. Ver [`docs/demo/demo-limitations.md`](docs/demo/demo-limitations.md).

## Estructura

- `app/` — Expo Router (15 rutas definitivas; `/` redirige a onboarding demo)
- `src/design/` — tokens, tipografía, motion
- `src/components/` — UI primitivos y shells por dominio
- `src/data/` — mocks de producto
- `docs/` — referencia visual y paquete demo (`docs/demo/`)
