# Checklist pre-demo — Claridad

Usar **15–20 minutos antes** de una presentación en vivo.

---

## Entorno

- [ ] Node.js instalado (LTS recomendado).
- [ ] Dependencias al día: `npm install` (solo si `node_modules` falta o cambió `package.json`).
- [ ] Typecheck opcional pero recomendado: `npm run typecheck` → debe pasar sin errores.
- [ ] Expo Doctor limpio: `npx expo-doctor` → 21/21 checks (Fase 6C).

---

## Arrancar la app

```bash
cd /Users/mfreixanet/Projects/claridad
npm start
```

- [ ] Metro arrancado sin errores rojos en terminal.
- [ ] Dispositivo/simulador conectado:
  - iOS: `npm run ios` o Expo Go / simulador desde QR.
  - Android: `npm run android`.
  - Web (backup): `npm run web` — motion y safe area pueden diferir; preferir nativo para demo.

---

## Prewarm Metro (importante)

- [ ] Dejar Metro corriendo **5+ minutos** antes; primera carga es más lenta.
- [ ] Abrir la app una vez y recorrer el flujo completo en seco (sin audiencia).
- [ ] Segunda apertura: comprobar que transiciones Reanimated no tartamudean en frío.
- [ ] Si usas simulador iOS: abrir app, cerrar, reabrir — confirma redirect de `/`.

---

## Ruta inicial

- [ ] Al abrir, la app debe ir a **`/(onboarding)/chaos-to-order`** (redirect desde `/`).
- [ ] Confirmar que **no** aparece mapa de rutas ni copy de «stubs».
- [ ] Decidir antes: demo **con onboarding** (~3 min) o **atajo login** (~2 min).

---

## Smoke flow (obligatorio)

Recorrer una vez, en orden:

1. [ ] Onboarding 1 → … → 5 **o** atajo **Iniciar sesión** desde pantalla 1
2. [ ] Login → Home
3. [ ] Home → FAB captura
4. [ ] Captura → obturador → Procesando
5. [ ] Procesando → auto → Resultado (~3,5 s)
6. [ ] Resultado → tab Original / Organizado
7. [ ] Resultado → **Más** → Revisar
8. [ ] Revisar → **Todo coincide** → Exportar
9. [ ] Exportar → tocar PDF → toast visible

Tiempo total smoke: **~2 min**.

---

## Assets de respaldo

Tener abiertos o en segundo plano:

- [ ] Contact sheet: `docs/screenshots/after-phase5/all-screens-contact-sheet.png`
- [ ] Vídeos fase 5B (más recientes):
  - `docs/videos/phase5b-motion/capture-to-processing-fixed.mp4`
  - `docs/videos/phase5b-motion/processing-sequence-fixed.mp4`
  - `docs/videos/phase5b-motion/result-review-export-fixed.mp4`
- [ ] Design board: `docs/claridad-design-board.png`
- [ ] Guion: `docs/demo/demo-script.md`

---

## Dispositivo / presentación

- [ ] Modo No molestar activado.
- [ ] Brillo al 80–100 %.
- [ ] Batería > 30 % o cargador conectado.
- [ ] Orientación **portrait** bloqueada.
- [ ] Si proyectas: probar cable/AirPlay antes; web solo como último recurso.

---

## Si algo se rompe

| Síntoma | Acción |
|---------|--------|
| Pantalla blanca al abrir | Reload en Expo (`r` en terminal) o shake → Reload |
| Metro no responde | Ctrl+C → `npm start` de nuevo |
| Redirect `/` falla | Navegar manualmente a `/(onboarding)/chaos-to-order` |
| Procesando no avanza | Esperar 5 s; si no avanza, ir a `/(document)/result` manualmente |
| Crash en captura | Saltar a processing: `/(capture)/processing` |
| Animaciones muy lentas | Cerrar otras apps; usar simulador en lugar de dispositivo físico antiguo |
| Demo imposible en vivo | Reproducir vídeo `result-review-export-fixed.mp4` + contact sheet |

**Frase de recovery:**

> «Metro estaba en frío; el flujo está grabado — os enseño el recorrido en vídeo mientras reinicio el entorno.»

---

## Post-demo (opcional)

- [ ] No cerrar Metro si hay segunda ronda pronto.
- [ ] Anotar pantalla donde hubo fricción para feedback.
- [ ] Scripts QA intactos en `scripts/` — no borrar ni modificar para demo.
