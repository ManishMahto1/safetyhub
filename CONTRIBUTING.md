# Contributing to SafetyHub

Thanks for helping make SafetyHub more useful and more accurate. This is a safety tool — accuracy and clarity matter more than cleverness.

## Ground rules

- **Emergency numbers must be correct.** If you're adding or editing a country entry in `client/src/data/emergencyNumbers.json`, cite a source (government site, Wikipedia's emergency-number list, etc.) in your PR description.
- **Never commit secrets.** `.env` files are git-ignored. Use `.env.example` as the template and keep real keys out of PRs.
- **Keep the offline path working.** Any feature touching the map, emergency numbers, or SOS flow must degrade gracefully with no network connection. Don't introduce a hard dependency on a network call for core screens.
- **The voice assistant never triggers actions.** It gives guidance and highlights map categories. It must never call, text, or trigger SOS on its own — see `server/src/prompts/voiceAssistSystemPrompt.ts`.

## Setup

```bash
cd client && npm install
cd ../server && npm install
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Run both dev servers (`npm run dev` in each folder) as described in the root README.

## Coding conventions

- **Client:** React function components, hooks-first, Tailwind utility classes (avoid inline styles unless dynamic). Keep components under `src/components/<domain>/`.
- **Server:** TypeScript, `async/await` with the shared `asyncHandler` wrapper (no unhandled promise rejections in routes). Controllers stay thin; business logic lives in `services/`.
- **Naming:** camelCase for variables/functions, PascalCase for React components and TS types/interfaces.
- **Commits:** short, imperative subject line (`Add pharmacy category icon fallback`), body if it needs context.

## Adding a place category

1. Add the OSM tag mapping in `server/src/services/overpass.service.ts`.
2. Add a fallback SVG icon in `client/public/category-icons/`.
3. Add the chip in `CategoryFilterChips.jsx`.
4. Update `docs/architecture.md` if the API response shape changes.

## Pull requests

- One logical change per PR.
- Describe what you tested manually (there's no full CI test suite yet — see `good-first-issue`s if you'd like to help add one).
- Screenshots/GIFs welcome for any UI change.

## Good first issues

Look for the `good-first-issue` label — these are scoped to a single file or a small, self-contained change, and are a good way to get familiar with the codebase.
