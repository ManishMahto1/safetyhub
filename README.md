# SafetyHub

**Find what you need, right now, right here.**

SafetyHub is an open-source, installable web app (PWA) that gives people instant access to local emergency numbers, a map of nearby essential services (hospitals, pharmacies, police, banks, fuel), a one-tap SOS system, and a **voice AI assistant** that speaks guidance out loud for accessibility — even with no internet connection.

Built for the OpenAI Codex Hackathon (NamasteDev × OpenAI, July 2026).

---

## The Problem

In an emergency or an unfamiliar place, people waste critical time jumping between five different apps to find an emergency number, the nearest hospital, or someone to call for help. There's no single, open-source, community-driven hub that brings all of this together — and almost nothing designed for people who can't easily read a screen in a crisis.

## The Solution

One screen. Tap-first. Works offline.

- **Emergency numbers** for your country, detected automatically, one tap to call
- **Nearby essentials map** — hospitals, pharmacies, police, banks, fuel stations, with real photos where available
- **One-tap SOS** — sends your live location to saved contacts via SMS/WhatsApp, with a cancel window to prevent accidental triggers
- **Voice AI assistant** — speak your situation, and SafetyHub speaks back calm, spoken guidance on what kind of help you need and where to find it. Built for accessibility: visually impaired users, situations where typing isn't possible, or moments of panic when reading a screen is hard.
- **Offline mode** — emergency numbers and your last-loaded map data are always available, even with zero signal

---

## How AI Is Used

SafetyHub's voice assistant is powered by the OpenAI API. A user speaks what's happening; the browser transcribes it (Web Speech API); the backend sends that transcript plus the user's location to an LLM with a system prompt scoped specifically to calm, structured emergency guidance. The model returns which category of help is needed and a short spoken response — never a diagnosis, never an autonomous action. The response is read aloud and shown as text, and the relevant map category is highlighted automatically.

This keeps AI at the center of the accessibility story without letting it make high-stakes decisions (like triggering SOS) on the user's behalf — that stays a deliberate, user-initiated action.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite (JavaScript), Tailwind CSS, installable as a PWA |
| Maps | Leaflet.js + OpenStreetMap tiles |
| Places data | Overpass API (OSM), with a static fallback dataset |
| Photos | Overpass/Wikimedia tags, falling back to category icons when unavailable |
| Voice | Web Speech API (recognition + synthesis) in the browser |
| Backend | Express + TypeScript |
| AI | OpenAI API |
| Database | MongoDB (Mongoose) — used minimally, for optional interaction logging |
| Offline | Service Worker + Cache Storage via `vite-plugin-pwa` |
| Hosting | Vercel (frontend), Render (backend) |

---

## Project Structure

```
client/     React + JS frontend (PWA)
server/     Express + TypeScript backend + MongoDB
docs/       Architecture notes, demo script, screenshots
```

See [`docs/architecture.md`](docs/architecture.md) for the full API contract between client and server.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (local or Atlas free tier)
- An OpenAI API key

### 1. Clone and install

```bash
git clone https://github.com/ManishMahto1/safetyhub.git
cd safetyhub

cd client && npm install
cd ../server && npm install
```

### 2. Environment variables

Copy the example env files and fill in your own values — **never commit real keys.**

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

`server/.env` needs at minimum:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```

`client/.env` needs:

```
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Run locally

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

The app will be available at `http://localhost:5173`. Grant location and microphone permissions when prompted to use the map and voice assistant.

### 4. Build for production

```bash
cd client && npm run build
cd server && npm run build && npm start
```

---

## Contributing

SafetyHub is open-source and community-improvable by design — the emergency numbers dataset in particular depends on contributors from different countries keeping it accurate.

- To add or correct emergency numbers, edit `client/src/data/emergencyNumbers.json` and open a PR
- See [`CONTRIBUTING.md`](CONTRIBUTING.md) for setup details and coding conventions
- Look for issues tagged `good-first-issue` if you're contributing for the first time

---

## Roadmap

Out of scope for the hackathon MVP, but planned:

- Community-submitted and verified place data
- Multi-language voice support, auto-switched by region
- "I'm safe" follow-up check-in for SOS contacts
- Disaster mode with curated shelter/relief center listings

---

## License

MIT — see [`LICENSE`](LICENSE).

---

## Team

Built by a team of 3 for the OpenAI Codex Hackathon, July 2026.
