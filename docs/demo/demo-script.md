# Guion de demo — Claridad (2–3 minutos)

Prototipo navegable premium. **No es OCR real ni export real.** El mensaje central: *reorganización editorial fiel*, no transcripción mágica.

---

## Antes de empezar (30 s, off-camera)

> «Claridad convierte notas manuscritas en documentos limpios y titulados por temas. Hoy veis el producto diseñado y navegable; el motor de lectura y export vendrá después. Lo importante es la experiencia: captura, confianza, revisión y export.»

**Arranque:** la app abre en onboarding 1. Para demo corta, usa el atajo en pantalla 1: **«¿Ya tienes cuenta? Iniciar sesión»**.

---

## Ruta rápida recomendada (~2 min)

| # | Pantalla | Tiempo | Qué decir | Qué tocar |
|---|----------|--------|-----------|-----------|
| 1 | Login | 15 s | «Entrada simple. Cualquier acción lleva al archivo de documentos.» | **Iniciar sesión**, Apple o Google |
| 2 | Home | 20 s | «Biblioteca editorial: búsqueda, filtros y documentos ya organizados.» | Muestra lista; opcional: tocar un documento y volver |
| 3 | Capturar | 25 s | «Interfaz de cámara premium: encuadre, controles, obturador. La foto es simulada.» | FAB **Capturar** desde Home → pulsa **obturador** central |
| 4 | Procesando | 15 s | «No es OCR en vivo: es la *narrativa* del pipeline — detectar, fragmentar, agrupar, estructurar. ~3,5 s.» | No toques; espera auto-navegación |
| 5 | Resultado | 30 s | «Aquí está el valor: documento por temas, fiel al original. Tabs Organizado / Original.» | Cambia tab **Original** → vuelve a **Organizado** |
| 6 | Revisar | 25 s | «El usuario tiene la última palabra. Comparación lado a lado; fragmentos dudosos marcados.» | Barra inferior **Más** → **Todo coincide** |
| 7 | Exportar | 20 s | «Formatos claros. El toast confirma la acción; no genera archivo real.» | Toca **Exportar a PDF** (o Markdown) |

**Cierre (10 s):**

> «Claridad no inventa contenido: reorganiza lo que escribiste. El prototipo demuestra flujo, confianza y calidad editorial. El MVP funcional añadirá cámara, lectura y export reales.»

---

## Ruta narrativa completa (~3 min, con onboarding)

Usar si la audiencia no conoce el problema.

| # | Pantalla | Ruta | Qué decir | Qué tocar |
|---|----------|------|-----------|-----------|
| 1 | Del caos al orden | `/(onboarding)/chaos-to-order` | «Problema: libretas caóticas. Promesa: orden sin perder tu voz.» | **Comenzar** |
| 2 | Fotografiar | `/(onboarding)/photograph-page` | «Una foto de la página; sin escaneo complejo.» | **Siguiente** |
| 3 | Fragmentos | `/(onboarding)/fragments-detected` | «Separamos *ideas*, no solo líneas de texto.» | **Siguiente** |
| 4 | Por temas | `/(onboarding)/grouped-by-topics` | «Agrupación editorial automática.» | **Siguiente** |
| 5 | Confianza | `/(onboarding)/review-before-trust` | «Revisas antes de confiar. No inventamos.» | **Crear cuenta** |
| 6–12 | Flujo principal | ver tabla «Ruta rápida» arriba | (mismo guion) | (mismos gestos) |

---

## Pantalla a pantalla — copy sugerido

### 1. Onboarding — Del caos al orden
- **Decir:** «Convertimos notas desordenadas en documentos titulados por temas, fieles a lo que escribiste.»
- **Tocar:** **Comenzar** (narrativa) o **¿Ya tienes cuenta? Iniciar sesión** (atajo demo).
- **No prometer:** que ya lea tu letra en tiempo real.

### 2. Login
- **Decir:** «Onboarding termina aquí; el producto empieza en la biblioteca.»
- **Tocar:** cualquier CTA principal (**Iniciar sesión**, Apple, Google).
- **No prometer:** autenticación real ni sync en la nube.

### 3. Home
- **Decir:** «Tu archivo de documentos organizados. Buscar, filtrar, abrir.»
- **Tocar:** FAB cámara (abajo derecha) para iniciar captura. Opcional: tarjeta de documento → vista detalle → volver.
- **No prometer:** que búsqueda/filtros persistan datos reales.

### 4. Capturar
- **Decir:** «Superficie de cámara premium: encuadre, flash simulado, haptics. En producción usaríamos la cámara del dispositivo.»
- **Tocar:** **obturador** blanco central (único gesto necesario).
- **No prometer:** foto real, enfoque automático ni multi-página.

### 5. Procesando (~3,5 s)
- **Decir:** «Cuatro pasos visibles: detectar → fragmentar → agrupar → estructurar. Es la historia del producto, no un modelo corriendo en el móvil.»
- **Tocar:** nada; avanza solo a Resultado.
- **No prometer:** latencia real de IA ni precisión de OCR.

### 6. Resultado
- **Decir:** «Documento listo: temas, fragmentos, badge de confianza. Pestaña Original muestra la página manuscrita sin reinterpretar.»
- **Tocar:** tabs **Organizado** / **Original**; barra inferior **Exportar** o **Más** (Revisar).
- **No prometer:** edición inline ni sync.

### 7. Revisar
- **Decir:** «Comparación honesta. Fragmentos dudosos se marcan; tú confirmas antes de exportar.»
- **Tocar:** **Todo coincide** → navega a Exportar tras ~0,4 s.
- **No prometer:** corrección palabra a palabra en esta versión.

### 8. Exportar
- **Decir:** «PDF recomendado, Markdown, copiar, compartir. Toast de confirmación; en MVP generará archivos reales.»
- **Tocar:** **Exportar a PDF** (badge «Recomendado»).
- **No prometer:** archivo descargado, share sheet nativo ni portapapeles real.

---

## Cómo explicar «no es OCR» sin restar valor

Usa esta formulación:

> «Claridad no promete leer cualquier letra al 100 %. Promete **reorganizar editorialmente** lo que ya escribiste: detectar fragmentos, agrupar por tema y dejarte **revisar antes de exportar**. La lectura automática será parte del MVP; hoy mostramos la **experiencia de confianza** alrededor de ese pipeline.»

Evita: «es solo un mock», «no funciona».  
Prefiere: «prototipo de experiencia», «datos de ejemplo», «pipeline simulado con tiempos reales de UI».

---

## Atajos útiles durante la demo

| Objetivo | Atajo |
|----------|-------|
| Saltar onboarding | Pantalla 1 → **Iniciar sesión** |
| Ir directo a Home | Ruta `/(app)/home` (solo recovery) |
| Recovery si algo falla | Reinicia app; usa vídeos en `docs/videos/phase5b-motion/` |
| Mostrar diseño completo | Contact sheet `docs/screenshots/after-phase5/all-screens-contact-sheet.png` |

---

## Qué no prometer (lista rápida)

- Lectura real de manuscritos (OCR/ML).
- Cámara del dispositivo activa.
- Generación de PDF/Markdown/compartir real.
- Cuentas, sync, almacenamiento en nube.
- Edición profunda de fragmentos en esta build.
