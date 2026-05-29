# Sección lista para pegar en README.md

Copiar el bloque siguiente al README principal del repositorio (p. ej. después de «Desarrollo»).

---

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

---
