# SafetyHub — Implementation Roadmap

> Build map from empty scaffolding to a demo-ready, hackathon-winning PWA.
> Companion to [`PRD_SafetyHub.md`](PRD_SafetyHub.md) (vision) and [`architecture.md`](architecture.md) (current contract).
> **Rule of thumb:** ship each phase end-to-end before starting the next. A working narrow slice beats a broken wide one on demo day.

---

## 0. Where we are vs. where we're going

**Current state:** Two-package monorepo (`client/` React+Vite PWA, `server/` Express+TS) with files scaffolded but most logic stubbed. Server proxies all third-party APIs so keys never reach the browser. Two routes exist: `/api/places` and `/api/voice-assist`.

**Guiding principles (do not violate):**
1. **Offline-first is a constraint, not a feature.** Emergency numbers + region detection must work with zero network.
2. **Server is the only thing that holds keys.** Browser hits OSM tiles directly; everything else goes through Express.
3. **SOS is user-initiated and serverless.** No AI, no backend in the SOS path.
4. **Voice assistant guides, never acts.** It highlights map categories and speaks; it never triggers SOS/calls.

### Architecture changes — keep / remove / add

| Decision | Rationale |
|---|---|
| ✅ **Keep** React+Vite+PWA, Express+TS, Leaflet+OSM, Overpass, deep-link SOS | Proven, free, no billing risk on stage |
| ⚠️ **Make MongoDB fully optional** | It's only used for fire-and-forget voice logging. Keep the code path but never let a feature hard-depend on it. If time is tight, drop Mongo entirely and log to console. |
| ➖ **Remove** any hard network dependency from Home/Emergency/SOS screens | These must render offline |
| ➕ **Add** Nominatim reverse-geocoding (server-proxied) | Better region/city detection + "search by city" fallback |
| ➕ **Add** i18next for multi-language | High-impact accessibility/global-thinking score |
| ➕ **Add** Web Push (optional) + QR live-location share | Demo-friendly stretch features |
| 🔄 **Reconsider** OpenAI → keep, but add graceful degradation | Voice assistant must degrade to a canned response if the API/key is down mid-demo |

---

## Phase-wise implementation map

Each phase lists **Goal → Tasks → Key files → Done when**. Phases 1–5 are the MVP. 6+ are the hackathon differentiators.

---

### Phase 0 — Foundation & scaffolding hardening ✅ DONE
**Goal:** Both apps boot, lint clean, talk to each other, deploy-ready.

**Tasks**
- [x] Reconcile the **port mismatch** — standardized on `7000` (server) / `5173` (client); README + `.env.example` updated to match code.
- [x] Scrub `server/.env.example` of the committed real secrets → placeholders. ⚠️ **Still TODO by the repo owner: rotate the leaked Mongo + OpenAI keys and purge them from git history** — scrubbing the file doesn't remove them from past commits.
- [x] Confirm `vite-plugin-pwa` config — manifest/icons/`autoUpdate` verified; added `@`→`src` resolve alias (matches `jsconfig.json`) and added `webmanifest` to the precache glob. Build precaches 25 entries incl. manifest.
- [x] ESLint + Prettier in **both** packages (client had ESLint but no config; server had no ESLint at all). Added `.eslintrc.cjs` per package, shared root `.prettierrc.json`/`.prettierignore`, and `format`/`format:check` scripts. Both lint clean.
- [x] `client/src/services/api.js` axios instance + offline error normalization — verified present and correct.

**Key files:** `client/vite.config.js`, `client/.eslintrc.cjs`, `server/.eslintrc.cjs`, `.prettierrc.json`, `server/.env.example`, `README.md`

**Verified:** `npm run lint` + `npm run build` pass in both packages; server boots on `:7000` and `GET /health` → `{"status":"ok",...}`; production build emits `sw.js` (installable PWA).

**Follow-ups deferred to their phases:** self-hosting the Google Fonts referenced in `index.html` (network dependency — address in Phase 4 offline pass); rotating/purging the leaked keys (owner action).

---

### Phase 1 — Emergency Numbers Panel (offline core) ✅ DONE
**Goal:** Home screen shows correct emergency numbers for the detected country, one tap to call, works with zero network.

Most of this phase was already scaffolded; the work was expanding data + coverage and hardening rendering. Schema in practice is `{ country, numbers: [{ label, number, type }] }` (more flexible than the sketch above).

**Tasks**
- [x] Expanded `emergencyNumbers.json` from 10 → **41 countries** with accurate numbers. `type` vocabulary: `general | police | medical | fire | women | child | disaster | mental-health | traffic | tourist`.
- [x] `detectRegion.js` (GPS box → timezone → locale, all offline) extended to cover every new country: **41 bounding boxes** (ordered so border overlaps resolve correctly — Delhi→IN not CN, Seoul→KR not JP) and **~45 timezone mappings**.
- [x] Settings country override already existed → now filtered + **sorted alphabetically**; persists via Zustand/localStorage.
- [x] `EmergencyNumberCard.jsx` (tap targets + `tel:` links) already complete.
- [x] Hardened `Home.jsx` React key (a country can list one number for several services, e.g. `112` → key collision) to `type-number-label`.

**Key files:** `client/src/data/emergencyNumbers.json`, `utils/detectRegion.js`, `pages/Home.jsx`, `pages/Settings.jsx`

**Verified:** dataset validates (41 entries, 0 malformed, every detection code maps to a real entry); 11/11 coordinate detection tests pass; `npm run lint` + `npm run build` clean.

**Notes for later:** data accuracy is best-effort from well-known sources — contributors should cite sources per CONTRIBUTING when correcting. Category icons per `type` (the original "category icon + label" idea) are cosmetic and deferred; the card currently shows the type as a text subtitle.

---

### Phase 2 — Nearby Essentials Map ✅ DONE
**Goal:** Interactive Leaflet map with category pins, list/map toggle, filter chips, detail card with call + directions.

The server (`overpass/cache/photo` services, `/api/places` with fallback) and most of the client map (`MapContainer`, `PlacePin`, `PlaceDetailCard`, `PlacePhoto`, `CategoryFilterChips`) were already complete. The work was the two missing pieces — list view and location-denied recovery — plus polish.

**Tasks**
- [x] Server places pipeline verified (Overpass query → in-memory cache → Wikimedia photo lookup → static fallback on failure). Already solid.
- [x] **Added `/api/geocode`** (Nominatim proxy): `geocode.service.ts` (24h cache, honest User-Agent), controller, route, `geocodeRateLimiter` (30/min), wired into `app.ts`.
- [x] **Location-denied recovery:** new `CitySearch.jsx` (debounced, dropdown) + `geocodeService.js`; searched city becomes the map origin. MapView shows a prompt when GPS is off and no city chosen yet.
- [x] **List view + map/list toggle:** new `PlaceList.jsx` (distance-sorted, photo/icon, call/directions) + a `ViewToggle`; both views share the selected place.
- [x] **Polish:** places sorted by distance (`sortByDistance`); `placesService` now returns `{ places, source }` and the UI shows a **"sample data" pill** when `source === "fallback"`; empty state ("no places found"); MapView relaid out as a flex column so search + chips + content stack cleanly.

**Key files:** `client/src/pages/MapView.jsx`, `client/src/components/map/{CitySearch,PlaceList}.jsx`, `client/src/services/{placesService,geocodeService}.js`, `server/src/services/geocode.service.ts`, `server/src/{controllers,routes}/geocode.*`, `docs/architecture.md`

**Verified:** both packages lint + build clean; server boots; `GET /api/geocode?q=Indore` returns real Nominatim results; `q` under 2 chars → 400; `/api/places` missing coords → 400; Overpass-unreachable path returns `source: "fallback"`.

**Deferred:** live-network Overpass results weren't exercised here (the test box returned fallback) — worth a manual check with real coordinates + connectivity during the Phase 9 demo rehearsal. Photo coverage from OSM tags is naturally sparse; the icon fallback handles it.

---

### Phase 3 — SOS / Emergency Alert (serverless) ✅ DONE
**Goal:** One big button → 3-sec cancelable countdown → live location + message to saved contacts via SMS/WhatsApp.

The SOS button, countdown, contacts store, and deep-link helpers were already scaffolded. The work was correctness/reliability hardening on the send path plus finishing contact CRUD.

**Tasks**
- [x] `useEmergencyContacts.js` + Zustand add/edit/remove (≤5, localStorage) — store already had `updateContact`; **wired edit into the Contacts UI** (was add/remove only) + added light phone validation (≥3 digits).
- [x] `SOSButton.jsx` (fresh GPS `refresh()` on press) + `SOSCountdown.jsx` cancel window — already good; **countdown 5s → 3s** to match spec.
- [x] `deepLinks.js` — `buildSmsLink` now accepts **multiple recipients** (comma-joined into one `sms:` link); `wa.me` + encoded Google Maps location verified.
- [x] Contacts page CRUD — now full add / **edit** / remove with cancel.

**Reliability fix (the real work):** the old send fired `window.open(link,'_blank')` per contact behind `setTimeout` — timer-driven popups get blocked, so most contacts silently never opened. Rewrote the send: SMS contacts merge into **one combined `sms:` link** (single navigation), each WhatsApp contact its own `wa.me`; after the countdown we **best-effort auto-fire the primary** (sms via protocol navigation, wa.me via anchor click) and **always render explicit tap-through send buttons** for every contact as the dependable path.

**Key files:** `client/src/components/sos/SOSCountdown.jsx`, `pages/Contacts.jsx`, `utils/deepLinks.js`

**Verified:** client lint + build clean; SOS components import **nothing** from api/services/fetch/axios (serverless confirmed); deep-link output validated — combined SMS `sms:+919…,100&body=…`, URL-encoded message with a working `maps?q=lat,lng` link, digits-only `wa.me`.

**Note:** deep-link behavior varies by OS/browser (iOS uses `sms:num&body=`, Android `sms:num?body=`; timer auto-open may still be blocked) — this is why the tap-through buttons exist. Worth a real-device check in the Phase 9 rehearsal.

---

### Phase 4 — Offline Mode & PWA polish ✅ DONE
**Goal:** Cached map data + all emergency numbers available offline, with a clear offline indicator.

The Workbox config, `OfflineBanner`, and `offline-fallback.html` were scaffolded — but the SW had a bug that broke offline reloads, and there was no app-level persistence of map data.

**Tasks**
- [x] Service worker (Workbox `generateSW`): app shell precached (25 entries incl. `index.html`, manifest, icons); runtime caching present — OSM tiles `CacheFirst`, `/api/places` `NetworkFirst` (5s timeout). Emergency numbers are **bundled into the JS**, so they're offline by construction (verified inlined in the built bundle).
- [x] **Critical fix:** `navigateFallback` was bound to `/offline-fallback.html`, so reloading any route offline served the static "You're offline" page instead of the app — defeating the whole phase. Repointed to the precached **`/index.html`** so the SPA + client-side routes boot offline. Verified in `dist/sw.js`: `createHandlerBoundToURL("/index.html")`.
- [x] `useOnlineStatus.js` → `OfflineBanner.jsx` already wired.
- [x] **Last-fetched places persistence** (`utils/placesCache.js`, localStorage): `MapView` saves each successful result and, on offline fetch failure **or** reopening with no GPS fix, restores those places + origin so the map isn't blank — with an "Offline — showing your last-loaded places" pill. (Chose localStorage over IndexedDB: payloads are small JSON; the SW Cache Storage already handles tiles/photos.)
- [x] `offline-fallback.html` retained + precached as a last resort (now superseded by the app shell working offline).

**Key files:** `client/vite.config.js`, `client/src/utils/placesCache.js`, `client/src/pages/MapView.jsx`, `docs/architecture.md`

**Verified:** lint + build clean; `dist/sw.js` binds navigation to `/index.html`, registers 4 runtime routes (emergency-data/tiles CacheFirst, places NetworkFirst, navigation), and `registerSW.js` is injected (SW activates); `npm run preview` serves `/`, SPA route `/map`, and `/sw.js` all 200; emergency numbers confirmed inlined in the bundle.

**Deferred:** self-hosting the Google Fonts in `index.html` — offline they fall back to `system-ui` (Tailwind fallback), so the app stays fully usable, just not pixel-identical. Left as optional polish; couldn't bundle the font binaries here without network. Also: true airplane-mode reload wasn't exercised in this headless env — a 30-second manual check (build → preview → DevTools "Offline" → reload) belongs in the Phase 9 rehearsal.

---

### Phase 5 — Voice AI Assistant (accessibility centerpiece) ✅ DONE
**Goal:** User speaks their situation; app speaks back calm guidance + highlights the right map category.

STT/TTS hooks, the mic UI, the guidance-only prompt, and the LLM endpoint were scaffolded. The work was making it demo-proof (graceful degradation — the phase's headline requirement) and fixing a render-time bug.

**Tasks**
- [x] Client `useSpeechRecognition` / `useSpeechSynthesis` / `VoiceAssistant` / `VoiceResponseCard` — already built.
- [x] Server prompt (guidance-only, strict JSON), `openai.service.ts` (`gpt-4o-mini`, `json_object`), `POST /api/voice-assist` — already built.
- [x] **Graceful degradation (the real work):** new `server/src/services/fallbackGuidance.ts` — deterministic keyword→category classifier with calm canned replies and a life-threatening "use SOS / call emergency" prefix. Wired into `openai.service.ts` on **both** the no-key path **and** a `try/catch` around the OpenAI call (rate limit / timeout / bad key / network) — previously an API throw became a 500 that killed the assistant mid-demo.
- [x] **Client offline fallback:** mirrored classifier `client/src/utils/voiceFallback.js`; `VoiceAssistant` catch path uses it so even with the **server fully unreachable** (offline), a transcript still highlights a category and speaks — the "no signal" demo hook.
- [x] `suggestedCategory` → auto-selects the chip via `navigate('/map?category=…')` (already wired in `VoiceResponseCard`).

**Bug fixed:** `VoiceAssistant` called the submit handler **during render** (`if (!listening && …) handleRecognitionEnd()`), which fired the API request repeatedly and set state during render. Moved to a `useEffect` keyed on `[listening, transcript, status]` with a `submittedRef` guard so each utterance submits exactly once.

**Key files:** `server/src/services/{fallbackGuidance,openai.service}.ts`, `client/src/utils/voiceFallback.js`, `client/src/components/voice/VoiceAssistant.jsx`

**Verified:** both packages lint + build clean; `keywordGuidance` unit-tested across 7 transcripts (heart-attack→hospital w/ SOS prefix, fire→fire-station, robbery→police, insulin→pharmacy, fuel→fuel, ATM→bank, unrelated→null); **end-to-end with the key removed**, `POST /api/voice-assist` returns keyword guidance (`suggestedCategory: "hospital"`) instead of a 500; empty transcript → 400. **Done-when satisfied.**

**Notes:** the two keyword lists (server TS + client JS) are deliberate mirrors — keep them roughly in sync when editing. Browser STT (Web Speech API) often needs network itself (Chrome streams audio to Google), so true-offline voice depends on the browser; the client fallback covers the "server down but STT worked" case. Real-mic behavior belongs in the Phase 9 rehearsal.

---

### Phase 6 — Multi-language (i18n) 🏆 stretch ✅ DONE
**Goal:** UI + voice auto-switch to the user's detected/region language.

Built from scratch — no i18n existed. Four languages: **English, हिन्दी (Hindi), Español, Français** (Hindi included deliberately for a non-Latin-script demo).

**Tasks**
- [x] Added `i18next` + `react-i18next`; `client/src/i18n/index.js` (init, `localStorage` pref, `navigator.language` auto-detect, BCP-47 + language-name maps); locale files `client/src/locales/{en,hi,es,fr}.json` — **106 keys each, verified identical structure**.
- [x] Auto-select from browser locale on first load; **Language selector in Settings** (Auto-detect + the four languages), persisted. `main.jsx` imports i18n before render.
- [x] Extracted **every user-facing string** to `t()` across ~14 components/pages (nav, home, SOS, contacts, map + all sub-components, settings, voice) with interpolation (`count`, `max`, `name`, `distance`, `category`) and category label maps.
- [x] Voice fully localized: STT `recognition.lang` and TTS `utterance.lang` set to the active BCP-47 tag; client sends the language **name** to `/api/voice-assist`, and `openai.service.ts` instructs the LLM to reply in it (keeping JSON keys + category value in English).

**Key files:** `client/src/i18n/index.js`, `client/src/locales/*.json`, `client/src/pages/*`, `client/src/components/**`, `client/src/components/voice/{useSpeechRecognition,useSpeechSynthesis}.js`, `server/src/services/openai.service.ts`, `server/src/{controllers,types}/voiceAssist.*`

**Verified:** both packages lint + build clean (bundle 450→524 KiB for i18n + 4 locales); **locale key parity 106/106 across all 4 languages**; runtime i18next test passes — nested keys, hyphenated `fire-station`, `count` interpolation (no plural-key breakage), multi-var interpolation, and Hindi script all resolve; `/api/voice-assist` accepts + threads `language`. **Done-when satisfied** (switching language changes UI + the language sent to the LLM/TTS).

**Honest caveats:** (1) Translations are **best-effort** (Spanish/French solid; Hindi reasonable) — fits the community-improvable narrative; flag for native-speaker review before production. (2) The **keyword fallback replies in English only** (the LLM path handles other languages) — acceptable since the demo runs with a key; noted in `openai.service.ts`. (3) The **emergency-numbers data** (country names, labels) stays in its source language — it's data, not UI. (4) Region selector and language selector are **independent** (US-region + Hindi-UI is allowed) — a deliberate choice, since region drives emergency numbers and language drives UI/voice.

---

### Phase 7 — "I'm Safe" check-in + Live Location QR 🏆 stretch ✅ DONE
**Goal:** Close the emergency loop and add a stage-friendly visual.

**Tasks**
- [x] **I'm Safe:** `sosActive` flag added to the store (persisted to `localStorage`, so it survives reload/offline), set when an SOS actually sends. New `ImSafeButton` appears on Home only while active; tapping sends a follow-up `buildSafeMessage(...)` ("I'm safe now" + optional location) to the **same contacts**, then clears the flag. Serverless.
- [x] **QR share:** added `qrcode` lib; new `LocationQR` component renders a QR encoding the current-location Google Maps link (`maps?q=lat,lng`), plus the native Web Share sheet where supported and a copyable link. Client-side only. Button on Home.
- [x] **Refactor (removes duplication):** extracted the reliable send logic (combined SMS + per-contact WhatsApp, best-effort auto-fire, tap-through buttons) from `SOSCountdown` into a shared **`SendLinksSheet`**; both the SOS alert and the "I'm Safe" follow-up now use it (different title/message/accent).

**Key files:** `client/src/components/sos/{SendLinksSheet,ImSafeButton,SOSCountdown}.jsx`, `client/src/components/share/LocationQR.jsx`, `client/src/utils/deepLinks.js` (`buildSafeMessage`), `client/src/store/appStore.js` (`sosActive`), `client/src/pages/Home.jsx`, locales.

**Verified:** client lint + build clean (bundle 524→554 KiB for `qrcode`); **locale parity 116/116** across all 4 languages (10 new `imSafe`/`qr` keys each); `qrcode` produces a valid PNG data URL; `buildSafeMessage` correct with and without location and threads through the combined-SMS link. **Done-when satisfied.**

**Notes:** the QR/Web-Share and "I'm Safe" deep-link behaviors (like SOS) vary by device/browser — bench-verified logic + data URLs here; real-device scan + share sheet belong in the Phase 9 rehearsal. `sosActive` has no auto-expiry — it clears when the user sends "I'm Safe" or dismisses; a time-based auto-clear could be a nice touch later.

---

### Phase 8 — Disaster Mode 🏆 stretch ✅ DONE
Chose **Disaster Mode** (social-good angle, and fully offline-capable which reinforces the core narrative).

- [x] Curated static dataset `client/src/data/disasterShelters.json` — 7 shelters/relief points around the demo city, typed `shelter | relief | medical | food`. Bundled → **works fully offline** (the whole point in a disaster).
- [x] `disasterMode` flag in the store (persisted to `localStorage`) + a **toggle switch in Settings**.
- [x] `DisasterBanner` — app-wide alert-colored banner while active (stacked with the offline banner in a shared sticky container; refactored `OfflineBanner` to suit).
- [x] `DisasterShelters` — Home section (shown only while active) listing shelters **sorted by distance** from the user, each with type badge, address, distance, Call + Directions deep links.
- [x] Fully localized — 10 new `disaster`/`disasterType` keys × 4 languages.

**Key files:** `client/src/data/disasterShelters.json`, `client/src/components/disaster/{DisasterBanner,DisasterShelters}.jsx`, `client/src/store/appStore.js` (`disasterMode`), `client/src/pages/{Settings,Home}.jsx`, `client/src/App.jsx`, locales.

**Verified:** client lint + build clean; **locale parity 126/126** across all 4 languages; shelter dataset validates (7 entries, all 4 types, none malformed). **Done-when satisfied** — toggle in Settings → banner appears app-wide → Home shows distance-sorted shelters with working Call/Directions, all offline.

**Note:** Disaster mode is a manual demo toggle (no real disaster-feed integration) — deliberately, per the roadmap's "region flag / demo-only static JSON". Shelters are Home-list only (not drawn on the Leaflet map); a map layer would be a nice future extension. Panic Mode (the other Phase 8 option) was intentionally skipped.

---

### Phase 9 — Polish, deploy, demo rehearsal 🟡 CODE-SIDE DONE (deploy + rehearsal need the owner)
Split into what code can own vs. what needs accounts/hardware.

**Done (code-ownable):**
- [x] **Deploy config prepared:** `client/vercel.json` (SPA rewrites so refreshing `/map` doesn't 404 + no-cache header on `sw.js`); `render.yaml` Blueprint for the server (health check `/health`, secret env vars marked `sync:false`); `engines.node >=18` on the server. README gained a **Deployment** section (Vercel + Render, the `VITE_API_BASE_URL` build-time gotcha, CORS/`CLIENT_ORIGIN`).
- [x] **A11y:** `<html lang>` now syncs with the active i18n language (screen-reader pronunciation) via an `i18n.on('languageChanged')` hook. ARIA on mic/SOS + loading/empty/error/offline states were already built across Phases 1–8.
- [x] **Demo script rewritten** ([`demo-script.md`](demo-script.md)) to match the app as built — corrected countdown (3s), added the voice keyword-fallback/i18n/"I'm Safe"/QR/Disaster beats, a **pre-demo checklist** (warm the cache, add a contact), and a **failure-fallback** cheat sheet.
- [x] Pre-cache-demo-city guidance captured in the demo checklist (open the Map online once to warm OSM tiles + `/api/places` + the last-places cache before going offline).

**Verified:** both packages lint + build clean; `vercel.json` valid; final endpoint smoke test all green (`/health`, `/api/places`, `/api/geocode`, `/api/voice-assist` → 200; unknown route → 404).

**Still needs the repo owner (can't be done from code):**
- [ ] Actually deploy (Vercel + Render) and set the dashboard env vars.
- [ ] ⚠️ **Rotate + purge the leaked Mongo/OpenAI keys** from git history (still outstanding from Phase 0) — do this *before* the repo goes public.
- [ ] Real-**device** rehearsal: airplane-mode reload, SOS deep links on iOS/Android, mic STT/TTS, QR scan, Web Share — the behaviors that only a physical phone can confirm.
- [ ] Self-host the Google Fonts (optional offline polish, deferred since Phase 0/4).

---

## Extra hackathon features worth adding (high impact / low effort)

| Feature | Why judges like it | Effort |
|---|---|---|
| **Nearest-help "one big answer"** — a single card that says "Nearest hospital: X, 400m, [Call][Directions]" computed on load | Instantly demonstrates the value prop in 3 seconds | Low |
| **Read-it-aloud accessibility toggle** — TTS reads any place card / emergency number on tap | Doubles down on the inclusivity angle | Low |
| **Battery/− data "lite mode"** — hide photos, minimal tiles | Shows thoughtful low-connectivity design | Low |
| **Recent/last-known location banner** when GPS denied | Robustness judges notice | Low |
| **Share-your-status link** (Web Share API) | Native-feeling, demoable | Low |
| **First-run guided tour** (3 tooltips) | Makes the demo self-explanatory | Med |
| **Haptic feedback** on SOS (`navigator.vibrate`) | Feels like a real safety app | Trivial |

---

## External APIs & services — sourcing guide

> **Golden rule for this project:** anything needing a key is called **server-side**. Keyless/browser-safe APIs (OSM tiles, Web Speech, Geolocation) can run client-side.

### 🗺️ Maps & tiles
| Service | Use | Key? | Free tier | Notes |
|---|---|---|---|---|
| **OpenStreetMap tiles** (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) | Base map | No | Yes (fair-use) | **Default.** Set a proper `User-Agent`/attribution; don't hammer it. |
| **Leaflet.js** | Map rendering lib | No | Free/OSS | Already in stack (`react-leaflet`). |
| **MapTiler** | Nicer tiles/styles | Yes | ~100k tiles/mo | Stretch; needs key → proxy or restrict by domain. |
| **Mapbox** | Premium tiles/directions | Yes | 50k loads/mo | Billing risk on stage — avoid for demo. |
| **Google Maps / Directions** | Directions, richer places | Yes | $200 credit | Stretch only; keep off the demo critical path. |

### 📍 Places / POI data
| Service | Use | Key? | Free tier | Notes |
|---|---|---|---|---|
| **Overpass API** (`https://overpass-api.de/api/interpreter`) | Nearby hospitals/pharmacies/etc. | No | Yes (rate-limited) | **Primary.** Cache aggressively; keep `fallbackPlaces.json`. Alt endpoints: `overpass.kumi.systems`, `lz4.overpass-api.de`. |
| **Nominatim** (`https://nominatim.openstreetmap.org/search`) | Geocode "search by city" + reverse-geocode | No | 1 req/sec | Must set `User-Agent`; proxy via server; respect usage policy. |
| **Foursquare Places** | Photos/ratings/hours | Yes | Generous free | Stretch for better photos. |
| **Google Places** | Best photos/hours | Yes | $200 credit | Stretch; billing risk. |

### ☎️ Emergency numbers
| Source | Use | Notes |
|---|---|---|
| **Bundled `emergencyNumbers.json`** | Primary, offline | **Source of truth.** Community-editable via PR. |
| **Wikipedia "List of emergency telephone numbers"** | Seed data | Cite in PRs (per CONTRIBUTING). |
| **Wikidata / REST Countries** (`restcountries.com`) | Country metadata (flag, calling code, region) | Keyless; use for flags + region mapping, not the numbers themselves. |

### 🌐 Location & region detection
| Service | Use | Key? | Notes |
|---|---|---|---|
| **Browser Geolocation API** | Primary GPS fix | No | `navigator.geolocation`; always have a denied-permission fallback. |
| **Nominatim reverse-geocode** | Coords → country/city | No | Proxy via server; for region + city label. |
| **ipapi.co / ip-api.com** | IP-based country fallback | ip-api free (no key, HTTP) | When GPS denied and offline cache empty. |
| **Intl API + timezone** | Offline region guess | No | `Intl.DateTimeFormat().resolvedOptions().timeZone` → country map. Fully offline. |

### 🎙️ Voice — speech-to-text & text-to-speech
| Service | Use | Key? | Notes |
|---|---|---|---|
| **Web Speech API** (`SpeechRecognition` + `speechSynthesis`) | Browser STT + TTS | No | **Primary.** Free, on-device-ish, no key. Best in Chrome; feature-detect and degrade. |
| **OpenAI Whisper** | Server STT (accuracy) | Yes | Stretch: record audio → server → transcript. Better for accents/noise. |
| **OpenAI TTS** (`tts-1`) | Higher-quality spoken replies | Yes | Stretch: server synthesizes MP3, client plays it. |
| **ElevenLabs** | Best-in-class TTS voices | Yes | 10k chars/mo free | Very demo-impressive; server-proxied. |

### 🤖 AI (guidance model)
| Service | Use | Key? | Notes |
|---|---|---|---|
| **OpenAI API** (`gpt-4o` / `gpt-4o-mini`) | Voice guidance reasoning | Yes | Current choice. Force **structured JSON** output. Add canned fallback. |
| **Anthropic Claude** | Alt guidance model | Yes | Drop-in alt; structured output via tools. |
| **Rule-based keyword fallback** | Degraded mode | No | Map keywords → category + canned line so the demo survives API/key failure. **Build this.** |

### 🌍 Multi-language / translation
| Service | Use | Key? | Notes |
|---|---|---|---|
| **i18next + react-i18next** | UI string translation | No | **Primary.** Static locale JSON files. |
| **Browser `Intl`** | Number/date/locale formatting | No | Free. |
| **LibreTranslate** (self-host or public) | On-the-fly translation | Optional | Open-source; good for dynamic/user content. |
| **DeepL / Google Translate** | High-quality translation | Yes | Stretch; server-proxied. |
| **LLM translation** | Reply in user's language | Yes (reuses OpenAI) | Just tell the model the target language — no extra service. |

### 🆘 SOS / messaging
| Mechanism | Use | Key? | Notes |
|---|---|---|---|
| **`tel:` / `sms:` / `wa.me` deep links** | Call/text/WhatsApp | No | **Primary, serverless.** Zero cost, works on any phone. |
| **Web Share API** (`navigator.share`) | Native share sheet for location | No | Nice fallback/addition. |
| **`navigator.vibrate`** | Haptic confirmation | No | Trivial polish. |
| **Twilio** | Actually send SMS from server | Yes | Only if you want true server-sent SMS (real cost + phone number). Overkill for MVP. |

### 📦 Offline / PWA
| Tool | Use | Notes |
|---|---|---|
| **vite-plugin-pwa (Workbox)** | Service worker, precache, runtime cache | Already in stack. StaleWhileRevalidate for tiles + `/api/places`. |
| **Cache Storage / IndexedDB (`idb`)** | Persist last places + images | For a non-blank offline map. |
| **Web Push API + VAPID** | Push notifications (stretch) | Needs a push service + server VAPID keys. |

### 🔧 Misc helpers
| Tool | Use |
|---|---|
| **`qrcode`** (npm) | Client-side QR for live-location share |
| **Wikimedia Commons** (`image`/`wikimedia_commons` OSM tags) | Place photos (already in `photo.service.ts`) |
| **Unsplash Source** | Generic category fallback photos (stretch) |

---

## Suggested build order (24–36h hackathon)

| Window | Focus |
|---|---|
| 0–2h | Phase 0 — boot, secrets/ports fixed, PWA installable |
| 2–8h | Phase 1 + 2 — emergency numbers + map with Overpass & fallback |
| 8–14h | Phase 3 — SOS + contacts + deep links |
| 14–19h | Phase 4 — offline mode + PWA caching |
| 19–25h | Phase 5 — voice assistant + graceful degradation |
| 25–30h | One stretch: Phase 6 (i18n) **or** Phase 7 (QR + I'm Safe) |
| 30–36h | Phase 9 — polish, deploy, pre-cache demo city, rehearse |

**Demo hook (strongest 30 seconds):** start in airplane mode showing cached data works → flip to live GPS pulling real hospitals with photos → tap SOS → speak to the voice assistant. That contrast is what judges remember.

---

## Definition of "demo-ready"

- [ ] Installable PWA, loads offline with emergency numbers + cached map
- [ ] SOS in <3 taps, cancelable, opens prefilled SMS/WhatsApp with a live map link
- [ ] Map shows ≥5 categories with photo-or-icon, distance, call, directions
- [ ] Overpass failure invisibly serves fallback (never a blank map)
- [ ] Voice assistant speaks guidance + highlights a category; survives API/key failure
- [ ] Deployed live link + public repo, MIT license, README, CONTRIBUTING
- [ ] No real secrets committed anywhere
