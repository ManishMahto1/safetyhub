# Architecture

SafetyHub is a two-tier app: a React PWA client and an Express + TypeScript API. The client never calls third-party services (OpenStreetMap tiles aside) directly — everything else goes through the server, so API keys never reach the browser.

```
┌─────────────┐        ┌──────────────┐        ┌───────────────────┐
│   Client     │  HTTP  │   Server     │  HTTP  │  Overpass / OSM    │
│  (React PWA) │ ─────► │ (Express+TS) │ ─────► │  Wikimedia Commons │
│              │        │              │ ─────► │  OpenAI API        │
└─────────────┘        └──────┬───────┘        └───────────────────┘
                               │
                          ┌────▼─────┐
                          │ MongoDB  │  (optional interaction logging only)
                          └──────────┘
```

## API contract

| Route | Method | Request | Response | Notes |
|---|---|---|---|---|
| `/health` | GET | — | `{ status: "ok", service: "safetyhub-server" }` | Liveness check |
| `/api/places` | GET | Query: `lat` (number, required), `lng` (number, required), `category` (`all` \| `hospital` \| `pharmacy` \| `police` \| `bank` \| `fuel` \| `fire-station`, default `all`), `radius` (meters, default `3000`) | `{ places: Place[], source: "overpass" \| "fallback" }` | Falls back to `server/src/data/fallbackPlaces.json` if Overpass fails or rate-limits |
| `/api/geocode` | GET | Query: `q` (string, required, min 2 chars) | `{ results: { name: string, lat: number, lng: number }[] }` | Forward-geocode via Nominatim (OSM), server-proxied + cached 24h. Powers "search by city" when location is denied. Returns `[]` on failure, never errors |
| `/api/voice-assist` | POST | Body: `{ transcript: string, location: {lat:number,lng:number} \| null }` | `{ reply: string, suggestedCategory: PlaceCategory \| null }` | Guidance only — never triggers SOS or any action. See `server/src/prompts/voiceAssistSystemPrompt.ts` |

### `Place` shape

```ts
{
  id: string;
  name: string;
  category: "hospital" | "pharmacy" | "police" | "bank" | "fuel" | "fire-station";
  lat: number;
  lng: number;
  photoUrl: string | null;   // null → client shows the category icon instead
  address?: string;
  phone?: string;
}
```

## Data flow notes

- **Emergency numbers** are bundled client-side (`client/src/data/emergencyNumbers.json`) and never require a network call — this is what keeps that screen usable with zero signal.
- **Region detection** (`client/src/utils/detectRegion.js`) is also offline-first: a coarse bounding-box lookup from GPS coordinates, falling back to device timezone, then browser locale.
- **Places** are fetched from `/api/places`, which queries Overpass live and caches results in-memory for 5 minutes per (lat, lng, radius, category) bucket. On failure, it serves the static fallback dataset so a demo never shows a blank map. The client surfaces `source: "fallback"` to the user as a "sample data" pill.
- **Search by city**: when the browser denies Geolocation, the map has no origin. The user can type a city into the search box, which calls `/api/geocode` (Nominatim, server-proxied + cached); the chosen result becomes the map origin and places are fetched around it. The map also has a **list view** toggle; both views sort places by distance from the origin.
- **Photos** are resolved server-side from OSM `image`/`wikimedia_commons` tags (`photo.service.ts`), with results cached for 24 hours. A `null` photoUrl is a normal, expected response — the client renders a category icon in that case, not an error state.
- **Voice assistant**: browser transcribes speech (Web Speech API) → POSTs transcript + coordinates to `/api/voice-assist` → server calls the LLM with a guidance-only system prompt → structured JSON reply is spoken via speech synthesis and also rendered as text, with an optional "show this category on the map" shortcut.
- **SOS** never touches the server. It reads saved contacts from `localStorage`, gets a fresh GPS fix, and opens `sms:`/`wa.me` deep links directly from the client after a cancelable countdown.
- **Offline (PWA):** `vite-plugin-pwa` (Workbox `generateSW`) precaches the app shell; `navigateFallback` serves the precached `/index.html` so client-side routes boot with zero network. Runtime caching: OSM tiles `CacheFirst`, `/api/places` `NetworkFirst` (5s timeout). Emergency numbers are bundled into the JS, so they're offline by construction. Additionally, the client persists the **last successful `/api/places` result** to `localStorage` (`utils/placesCache.js`); when a fetch fails offline — or the app is reopened with no GPS fix — `MapView` restores those places (and their origin) so the map isn't blank, showing an "Offline — showing your last-loaded places" pill. `offline-fallback.html` remains precached as a last resort but is superseded by the app shell working offline.
