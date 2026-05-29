# Changelog demo — Claridad

Historial de hitos del prototipo navegable. **Baseline estable** cerrada 2026-05-29.

---

## [demo-baseline] — 2026-05-29

### Cierre baseline estable

- README actualizado con sección Demo y enlaces a `docs/demo/`.
- Paquete de documentación demo completo (guion, checklist, flujo, limitaciones, assets).
- `DEMO_STATUS.md` como fuente de verdad del estado actual.

### Aprobaciones

| Hito | Resultado |
|------|-----------|
| Diseño visual | ✅ **Aprobado** — alineado con design board |
| Motion premium | ✅ **Aprobado** — Phase 5 + micro-fixes 5B |
| QA producto | ✅ **PASS · 8.4/10** |
| QA técnico | ✅ **PASS · 8.2/10** |
| Expo Doctor | ✅ **21/21 checks** |

### Fases incluidas en esta baseline

| Fase | Entregable |
|------|------------|
| 4 | 15 pantallas definitivas + tokens + design board |
| 5 | Motion premium (PressableScale, transiciones, haptics) |
| 5B | Micro-fixes timing processing, tab crossfade, BottomActionBar |
| 6A | QA producto (read-only) |
| 6B | QA técnico (read-only) |
| 6C | Redirect `/` → onboarding; fix `app.json`; safe area Home/Document View |
| 7 | Documentación demo en `docs/demo/` |
| 8 (doc) | Baseline estable — este changelog + DEMO_STATUS |

### Fixes técnicos demo (6C)

- `app/index.tsx`: redirect limpio a `/(onboarding)/chaos-to-order` (sin copy de stubs).
- `app.json`: eliminado `newArchEnabled` inválido en root.
- Safe area inferior: FAB y scroll en Home y Document View.

### Alcance explícito (sin cambios en baseline)

- Sin OCR, cámara real ni export real.
- Sin rediseño, nuevas features ni cambios de tokens/motion/rutas post-cierre.

### Assets generados

- Screenshots: `docs/screenshots/after-phase5/`
- Vídeos motion: `docs/videos/phase5b-motion/` (preferido)
- Contact sheet: `all-screens-contact-sheet.png`

---

## Plantilla para entradas futuras

```markdown
## [demo-x.y] — YYYY-MM-DD

### Added / Changed / Fixed
- ...

### QA
- Producto: ...
- Técnico: ...
- Expo Doctor: ...
```
