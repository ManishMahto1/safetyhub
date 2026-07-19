# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SafetyHub is an offline-first emergency PWA: local emergency numbers, a Leaflet map of nearby essentials (hospitals, pharmacies, police, banks, fuel, fire stations), a one-tap SOS, and a voice AI assistant that speaks guidance for accessibility. Built for a hackathon (OpenAI Codex Hackathon, July 2026). `docs/PRD_SafetyHub.md` is the original vision doc — treat `README.md` and `docs/architecture.md` as the source of truth for what's actually built; the PRD names some tools (Supabase, Firebase, `idb`) that were not used.

## Monorepo layout

Two independent npm packages, no root `package.json` — run commands inside `client/` or `server/`.

- `client/` — React 18 + Vite (JavaScript, not TS), Tailwind, Zustand, React Router, `vite-plugin-pwa`
- `server/` — Express + TypeScript (CommonJS), Mongoose, OpenAI SDK
- `docs/` — `architecture.md` (client/server API contract — keep updated when response shapes change), `demo-script.md`, `PRD_SafetyHub.md`

## Commands

```bash
# Client (from client/)
npm run dev        # Vite dev server on :5173
npm run build      # production build
npm run preview    # serve the built bundle (needed to test PWA/service-worker behavior)
npm run lint       # eslint src

# Server (from server/)
npm run dev        # nodemon + ts-node on :7000 (see port note below)
npm run build      # tsc -> dist/
npm start          # node dist/index.js (run build first)
npm run lint       # eslint src --ext .ts
```

There is **no test suite** yet (README/CONTRIBUTING both note this). Verification is manual.

## Ports & env — read before wiring anything

The README says the server runs on `5000`, but the **code default is `7000`** (`server/src/config/env.ts`, `client/src/services/api.js`, and both `.env.example` files). Trust the code: server `7000`, client `5173`, client talks to server via `VITE_API_BASE_URL`. If something can't reach the API, this mismatch is the first thing to check.

`server/.env.example` currently contains real-looking secrets (a MongoDB Atlas URI and an OpenAI key) instead of placeholders. Do not treat committed example env files as safe — never copy real credentials into `.env.example`, and flag it if asked to touch that file.

## Architecture — the load-bearing ideas

**All third-party calls go through the server; the browser only ever hits OSM tile servers directly.** OpenAI and Overpass keys never reach the client. Two API routes only:

- `GET /api/places?lat&lng&category&radius` → `{ places, source }`. Server queries Overpass live (`overpass.service.ts`), resolves photos from OSM tags (`photo.service.ts`), and **falls back to `server/src/data/fallbackPlaces.json` when Overpass fails or rate-limits** so a demo never shows a blank map. Results are cached in-memory (`cache.service.ts`): 5 min for places, 24 h for photos.
- `POST /api/voice-assist` `{ transcript, location }` → `{ reply, suggestedCategory }`. Server calls the LLM with a **guidance-only** system prompt (`server/src/prompts/voiceAssistSystemPrompt.ts`).

**Offline-first is a hard constraint, not a feature.** Two things must always work with zero network, so never introduce a network dependency into them:
- Emergency numbers are bundled client-side (`client/src/data/emergencyNumbers.json`) — no API call.
- Region detection (`client/src/utils/detectRegion.js`) is a coarse GPS bounding-box lookup, falling back to timezone then locale.

**SOS never touches the server.** It reads contacts from `localStorage`, gets a fresh GPS fix, and opens `sms:`/`wa.me` deep links (`client/src/utils/deepLinks.js`) after a cancelable countdown.

**The voice assistant must never take actions** — it returns guidance text + a `suggestedCategory` to highlight on the map, and nothing else. It must never trigger SOS, call, or text. This boundary is enforced by the system prompt and is a stated project invariant.

**MongoDB is optional and non-blocking.** `connectDatabase()` catches connection failures and continues; the only DB use is fire-and-forget `VoiceLog` logging in `voiceAssist.controller.ts`. The API fully works without Mongo — don't add features that hard-depend on it.

## Client state & structure

- Global state is **Zustand** (`client/src/store/appStore.js`): region, offline status, shared `coords` (so screens don't re-prompt for location), and contacts (capped at 5, persisted to `localStorage`). Not React Context.
- Pages (`pages/`) map to the bottom-nav tabs: Home / MapView / Contacts / Settings. Components live under `components/<domain>/` (emergency, map, sos, voice, layout).
- Voice uses browser Web Speech API via `useSpeechRecognition.js` / `useSpeechSynthesis.js` hooks.

## Server conventions

- Route → thin controller → `services/` for logic (per CONTRIBUTING). Wrap async routes with `utils/asyncHandler.ts`; errors flow to `middleware/errorHandler.ts`.
- Place categories are the enum `hospital | pharmacy | police | bank | fuel | fire-station` (`types/place.types.ts`), mapped to OSM tags in `overpass.service.ts`.

## Adding a place category (touches both packages)

1. Add the OSM tag mapping in `server/src/services/overpass.service.ts` (`CATEGORY_TAGS` + `categoryFromTags`).
2. Add a fallback SVG in `client/public/category-icons/`.
3. Add the chip in `client/src/components/map/CategoryFilterChips.jsx`.
4. Update `docs/architecture.md` if the response shape changes.

## Contributor norms

Client: function components, hooks-first, Tailwind utilities (avoid inline styles unless dynamic). Server: `async/await` with `asyncHandler`. camelCase vars/functions, PascalCase components and TS types. Emergency-number data edits must cite a source in the PR.
