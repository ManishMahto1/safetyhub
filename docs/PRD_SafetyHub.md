# Product Requirements Document (PRD)
## Project Name: SafetyHub (working title — rename as desired)
### Tagline: "Find what you need, right now, right here."

---

## 1. Overview

SafetyHub is an open-source, cross-platform (Web + Mobile) emergency and essentials helper. It gives users instant access to local emergency numbers, an SOS system, and a map-based directory of nearby essential places (hospitals, pharmacies, police stations, banks/ATMs, fuel stations) — complete with photos, distance, and contact numbers. It is built to work even with poor or no connectivity via offline caching.

**Problem Statement:** In an emergency or an unfamiliar location, people waste critical time searching multiple apps for emergency numbers, nearby hospitals, or help. There's no single open-source, community-driven hub combining all of this.

**Solution:** A single-screen, tap-first hub combining verified emergency numbers, live nearby essentials with visuals, and a one-tap SOS system — all open-source and community-improvable.

---

## 2. Goals & Success Metrics

| Goal | Metric (Hackathon Demo) |
|---|---|
| Fast access to help | SOS triggered in under 3 taps / 5 seconds |
| Useful nearby data | Shows minimum 5 categories of places within 2km, with photo + number |
| Works offline | Cached data loads with zero network in demo |
| Judged as "complete" | Working web + mobile-responsive PWA in one codebase |
| Open-source appeal | Public GitHub repo, README, contribution guide, MIT license |

---

## 3. Target Users

- Travelers / tourists in unfamiliar cities
- Elderly users or people with medical conditions needing quick hospital access
- Women/solo travelers needing discreet SOS
- General public in accident/emergency situations
- Communities in low-connectivity areas (rural, disaster-hit zones)

---

## 4. Core Features (MVP — Build This First)

### 4.1 Emergency Numbers Panel
- Auto-detect country/region (via GPS or IP fallback) and display correct emergency numbers (police, ambulance, fire, women's helpline, child helpline, disaster management).
- One-tap call button (`tel:` links).
- Manually switchable region/country dropdown as fallback.
- Static local JSON dataset of country → emergency numbers (open-source, community-editable via GitHub PRs).

### 4.2 Nearby Essentials Map
- Interactive map (OpenStreetMap/Leaflet.js recommended for open-source; Google Maps as stretch goal).
- Categories: Hospitals, Pharmacies, Police Stations, Banks/ATMs, Fuel Stations, Fire Stations.
- Each pin/list item shows: name, photo (from Overpass/Places API or user-submitted), distance, phone number, open/closed status, "Get Directions" link.
- Filter chips to toggle categories on/off.
- List view + Map view toggle.

### 4.3 SOS / Emergency Alert
- One large SOS button on home screen.
- On tap: sends live GPS location + pre-set message via SMS (using `sms:` deep link) and/or WhatsApp (`wa.me` link) to saved emergency contacts.
- Countdown (3 sec) with cancel option to avoid accidental triggers.
- Store up to 5 emergency contacts locally (localStorage/device storage — no server needed for MVP).

### 4.4 Offline Mode
- Cache last-fetched nearby places + images (Service Worker + IndexedDB for PWA).
- Emergency numbers dataset bundled locally — always available with zero network.
- Offline banner indicator so user knows they're viewing cached data.

### 4.5 Core Navigation / UI
- Single-page app, bottom nav: Home (SOS + emergency numbers) | Map (nearby essentials) | Contacts | Settings.
- Mobile-first responsive design; installable as PWA (Add to Home Screen).

---

## 5. Hackathon-Oriented Stretch Features
(Pick 2–3 based on time left — these are what make judges remember you)

| Feature | Why it impresses judges |
|---|---|
| **Panic Mode** — triple power-button press or shake-to-trigger silent SOS | Shows device-level integration thinking |
| **Community-Verified Data** — users can submit/edit place info (crowdsourced, like Waze) via a simple form, stored in open DB | Reinforces the "open-source" narrative directly |
| **Voice-Guided Accessibility Mode** — text-to-speech reads out nearest hospital/directions for visually impaired users | Strong social-impact angle, scores well on inclusivity criteria |
| **Multi-language auto-switch** based on detected location | Shows scalability/global thinking |
| **Live "I'm Safe" check-in** — SOS contact gets follow-up message when user marks themselves safe | Completes the emergency loop narrative |
| **Disaster Mode** — pulls a curated list of shelters/relief centers when a natural disaster is detected in the region (static dataset for demo) | Great for "social good" hackathon tracks |
| **QR-based Quick Share** — generate a QR code with your live location for someone to scan and track you | Very demo-friendly, visually impressive on stage |

**Demo tip:** Simulate "no signal" first, show offline cache working, then flip to live GPS pulling real hospitals with photos. This contrast is the single strongest 30-second hook for judges.

---

## 6. Tech Stack Recommendation

| Layer | Recommendation | Why |
|---|---|---|
| Frontend (Web + Mobile) | React + Vite (PWA) or React Native/Expo if native app is required | One codebase, fast hackathon build |
| Maps | Leaflet.js + OpenStreetMap tiles | Free, open-source, no billing risk during demo |
| Places Data | Overpass API (OSM) | Free, no API key needed, great for hospitals/banks/etc. |
| Backend (optional, for community data) | Supabase or Firebase | Instant auth + DB + storage, minimal setup time |
| Offline Storage | Service Worker + IndexedDB (via `idb` library) | True offline-first PWA behavior |
| SOS Messaging | `tel:`, `sms:`, `wa.me` deep links (no backend needed) | Zero-cost, works instantly on any phone |
| Hosting | Vercel / Netlify (frontend), Supabase (backend) | Free tier, fast deploy for demo link |
| Version Control | GitHub (public repo, MIT License) | Required for open-source hackathon judging |

---

## 7. Data Sources
- **Emergency numbers:** Static, community-maintained JSON (`/data/emergency-numbers.json`) — seed with top 20–30 countries for demo.
- **Places (hospitals, banks, etc.):** Overpass API query by category + radius around user's GPS coordinates.
- **Photos:** Overpass/Wikimedia Commons tags where available; fallback to category icon if no photo exists (don't block MVP on photo availability).

---

## 8. User Flow (MVP Demo Path)

1. User opens app → location permission prompt.
2. Home screen loads: emergency numbers for detected country + big SOS button.
3. User taps "Map" → sees nearby hospitals/pharmacies/banks as pins with photos.
4. User taps a pin → detail card slides up: name, photo, number, distance, "Call" and "Directions" buttons.
5. User taps SOS → 3-second countdown → location + message sent to saved contacts.
6. User goes offline (airplane mode demo) → app still shows cached map data + all emergency numbers.

---

## 9. Team Roles (Suggested Split for Hackathon)

| Role | Responsibility |
|---|---|
| Frontend Lead | UI screens, navigation, responsive design |
| Maps/Geo Engineer | Leaflet integration, Overpass API queries, offline caching |
| Backend/Data Engineer | Emergency numbers dataset, Supabase setup (if used), community data submission |
| SOS/Feature Engineer | SOS flow, deep links, panic mode, accessibility features |
| Design/Pitch Lead | UI polish, demo script, pitch deck, README, GitHub repo readiness |

---

## 10. Timeline (Typical 24–36 Hour Hackathon)

| Time | Milestone |
|---|---|
| Hour 0–2 | Repo setup, wireframes, tech stack finalized |
| Hour 2–8 | Emergency numbers panel + basic map with Overpass API |
| Hour 8–14 | SOS button + contact storage + deep links working |
| Hour 14–20 | Offline mode (service worker + caching) |
| Hour 20–26 | Stretch feature (pick 1–2: panic mode, voice mode, QR share) |
| Hour 26–32 | UI polish, bug fixes, responsive testing |
| Hour 32–36 | Demo script rehearsal, README, pitch deck, deploy live link |

---

## 11. Open-Source Readiness Checklist
- [ ] MIT (or similar permissive) LICENSE file
- [ ] README with setup instructions, screenshots, live demo link
- [ ] CONTRIBUTING.md explaining how others can add emergency numbers/places data
- [ ] Clear folder structure (`/src`, `/data`, `/docs`)
- [ ] `.env.example` for any API keys (never commit real keys)
- [ ] Issues tagged `good-first-issue` for future contributors

---

## 12. Risks / Things to Watch
- **API rate limits:** Overpass API can be slow/rate-limited — cache aggressively, have a static fallback dataset for demo city.
- **Location permission denial:** Always have a manual "search by city name" fallback.
- **Scope creep:** Stick to MVP first; stretch features only after core SOS + map + offline all work end-to-end.
- **Live demo network risk:** Pre-cache the demo location's data before going on stage so you're not dependent on venue WiFi.

---

## 13. Pitch Narrative (for Judges)
"When something goes wrong, people lose the most valuable resource they have — time — searching across five different apps for a number or a nearby hospital. SafetyHub puts everything in one open-source, offline-ready hub: emergency numbers, verified nearby essentials, and a one-tap SOS — built by the community, for the community."
