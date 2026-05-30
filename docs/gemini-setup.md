# Configurar Gemini 3 Flash en Claridad

Claridad procesa fotos de notas manuscritas con **Gemini 3 Flash** a través de un proxy en Vercel. La API key nunca va en el frontend (GitHub Pages).

## 1. Obtener API key (gratis)

1. Entra en [Google AI Studio](https://aistudio.google.com/apikey).
2. Crea una API key.
3. Guárdala como `GEMINI_API_KEY`.

## 2. Desplegar el proxy en Vercel

1. Importa el repo [Freixanet/claridad](https://github.com/Freixanet/claridad) en [Vercel](https://vercel.com).
2. No cambies el root del proyecto (usa la raíz del repo).
3. En **Settings → Environment Variables**, añade:
   - `GEMINI_API_KEY` = tu key de AI Studio
4. Despliega. La URL será algo como `https://claridad-xxx.vercel.app`.

El endpoint expuesto es:

```
POST https://<tu-proyecto>.vercel.app/api/documents/process
```

## 3. Configurar el cliente Expo

### Desarrollo local

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Terminal 1 — proxy (sin login de Vercel):**

```bash
npm run dev:api
```

Alternativa con Vercel CLI (requiere cuenta): `npx vercel dev`

Terminal 2 — app:

```bash
npx expo start --web
```

### GitHub Pages (producción)

En el repo de GitHub → **Settings → Secrets and variables → Actions**, añade:

| Secret | Valor |
|--------|--------|
| `EXPO_PUBLIC_API_URL` | `https://tu-proyecto.vercel.app` |

Cada push a `main` redespliega GH Pages con esa URL.

## 4. Probar el flujo

1. Abre la app → **Capture** → toma o elige una foto de notas manuscritas.
2. Espera en **Processing**.
3. Deberías ver un documento con transcripción real y secciones por tema.
4. Recarga la app: el documento debe seguir en **Library** (AsyncStorage).

## 5. Ajustes en Settings

- **High-fidelity mode**: más secciones y estructura detallada.
- **Auto-title sections**: títulos editoriales generados por Gemini.

## Límites del tier gratuito

- Vercel Hobby: suficiente para uso personal/demo.
- Google AI Studio: cuotas diarias en el tier free; el proxy limita a 10 req/min por IP.

## Solución de problemas

| Error | Causa probable |
|-------|----------------|
| `API no configurada` | Falta `EXPO_PUBLIC_API_URL` en build o `.env.local` |
| `GEMINI_API_KEY is not configured` | Falta la variable en Vercel |
| `Origin not allowed` | Abre la app desde GH Pages o localhost |
| `Too many requests` | Espera 1 minuto (rate limit del proxy) |
