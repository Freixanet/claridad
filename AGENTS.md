# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Cursor Cloud specific instructions

**Product:** Claridad — single-package Expo SDK 56 app (Expo Router). No backend, database, or Docker services; document data and `/api/documents/*` are mocked in-process (`src/api/setupMockApi.ts`).

**Node:** Use Node 22 (matches CI). Package manager is **npm** (`package-lock.json`).

**Install / refresh deps:** `npm ci` (update script runs this on VM startup).

**Run (development):**

| Command | Purpose |
|---------|---------|
| `npm start` | Expo dev server (Metro) |
| `npm run web` | Web dev in browser (default port **8081**) |
| `npm run ios` / `npm run android` | Native simulators (optional; not available in headless cloud VMs) |

For non-interactive web in cloud shells, start Metro in **tmux** (long-lived): `CI=1 EXPO_NO_TELEMETRY=1 npx expo start --web --port 8081`. The app entry redirects `/` → `/(tabs)` (Library), not onboarding routes in older demo docs.

**Verify:**

| Command | Notes |
|---------|--------|
| `npm run typecheck` | `tsc --noEmit` — primary static check |
| `npx expo-doctor` | May warn about non-square icon assets in `app.json`; does not block dev |
| `npm run export:web` | Static web build to `dist/` (GitHub Pages) |

There is no `lint` or `test` script in `package.json`. Optional visual QA: `node scripts/capture-screenshots.mjs` (requires Metro on `:8081` and Puppeteer).

**Hello-world flow:** Open `http://localhost:8081` → Library lists seed docs (e.g. “Ideas del proyecto”) → `/document/1` shows sections → `/capture` shows capture intent screen.
