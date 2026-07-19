# Demo Script (≈4–5 minutes)

> The single strongest hook is the **offline → online contrast**. Start offline, prove it works, then flip to live data. Save SOS and voice for the emotional beats.

## Pre-demo checklist (do this before you're on stage)

- [ ] **Add an emergency contact** in Contacts (so SOS has a target). Use your own second phone.
- [ ] **Warm the cache while online:** open the Map once at the venue so OSM tiles + a `/api/places` result are cached, and the "last-loaded places" are saved. Then you can go offline safely.
- [ ] Confirm the deployed server is up (`/health` returns ok) and `OPENAI_API_KEY` is set (for the best voice demo). Even if it isn't, voice still works via keyword fallback — don't panic.
- [ ] Pick your language: Settings → Language. A quick switch to **हिन्दी** or **Español** mid-demo is a strong inclusivity beat.
- [ ] Phone volume up (TTS speaks aloud).

## 1. The hook (20s)
"In an emergency you don't want to be searching five different apps. SafetyHub is one screen — emergency numbers, nearby help, one-tap SOS, and a voice assistant — and it still works with **no signal**."

## 2. Offline-first proof (45s)
- Open the app on Home. Point out the emergency numbers for the detected country, loaded **instantly with zero network**.
- Turn on **airplane mode**. Reload the app — it still opens (installed PWA), numbers still there and tappable, and the offline banner appears.
- Open the Map while offline: your **last-loaded places still render** with an "offline — showing your last-loaded places" pill. Nothing is blank.

## 3. Voice assistant — the accessibility centerpiece (60s)
- Back online. Tap the mic. Say: *"My friend just twisted her ankle badly on a hike."*
- The assistant **speaks back** calm guidance and suggests the **Hospital** category. It's shown as text too (accessibility — never audio-only).
- Tap **"Show hospitals on map"** to jump straight to the filtered map.
- Call out the guardrail: the assistant **never dials or messages anyone on its own** — it only guides and points. SOS stays a deliberate human tap.

## 4. Map (40s)
- Map centered on your location, pins colored by category, distance-sorted.
- Tap a hospital pin → detail card with photo (or category icon fallback), distance, **Call** and **Directions**.
- Toggle the **List view** and a couple of category chips (Police, Pharmacy).
- If GPS is denied on the demo device: use **search by city** — type the venue city, places load around it.

## 5. SOS + "I'm Safe" (60s)
- Return to Home, press the big **SOS** button.
- Show the **3-second cancel window** — explain it exists to prevent accidental triggers.
- Let it complete: the **SMS/WhatsApp app opens pre-filled** with a live Google Maps link to your location, to all saved contacts at once.
- Point out the new **"I'm safe now"** button that appeared — tap it to send the follow-up that closes the loop.

## 6. Stretch flourishes (pick 1–2, 40s)
- **QR share:** tap "Share my location (QR)" → a QR of your live location someone can scan to track you. Very stage-friendly.
- **Multi-language:** Settings → switch to हिन्दी → the whole UI (and the next voice reply) changes language.
- **Disaster mode:** Settings → toggle Disaster mode → an app-wide banner appears and Home surfaces nearby **shelters & relief centers** — all from bundled data, so it works with no signal.

## 7. Close (20s)
"Everything here is open source — MIT licensed — the emergency-numbers list is community-maintained across ~40 countries, and the whole core works offline. Because when something's actually wrong, that's exactly when the network isn't there. Thanks!"

---

## Fallback notes if the live demo hits trouble
- **Places / Overpass slow or rate-limited:** the map still renders from the static fallback dataset (you'll see a "sample data" pill) — mention it's intentional, not a bug.
- **Voice API down or `OPENAI_API_KEY` unset:** the assistant degrades to on-device keyword guidance — it still speaks calm guidance and highlights the right category. If the whole server is unreachable, the client's own keyword fallback covers it.
- **SOS deep link doesn't auto-open** (browser popup blocker): the send screen always shows explicit tap-through buttons — just tap the contact button.
- **Mic not supported / permission denied:** the voice card shows a graceful "not supported" message; fall back to the map + numbers.
- **GPS denied:** use search-by-city on the Map; emergency numbers still work via timezone/locale detection.
