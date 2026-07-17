# Demo Script (≈4 minutes)

## 1. The hook (20s)
"In an emergency, you don't want to be searching five different apps. SafetyHub is one screen: emergency numbers, nearby help, an SOS button, and a voice assistant — and it still works with no signal."

## 2. Home screen (45s)
- Open the app. Point out the emergency number for the detected country, loaded instantly with zero network calls.
- Toggle airplane mode. Numbers are still there, still tappable. This is the offline guarantee in action.
- Turn network back on.

## 3. Voice assistant (60s)
- Tap the mic. Say: *"My friend just twisted her ankle badly on a hike."*
- The assistant replies out loud with calm guidance and suggests the "hospital" category.
- Tap "Show hospitals on map" to jump straight to the map, filtered.
- Call out: the assistant never dials or messages anyone on its own — it only guides and points.

## 4. Map (45s)
- Show the map centered on current location, pins colored by category.
- Tap a hospital pin → detail card slides up with photo (or fallback icon), distance, Call and Directions buttons.
- Switch category chips to show Police, then Pharmacy.

## 5. Contacts + SOS (60s)
- Go to Contacts, show a saved contact (added before the demo).
- Return to Home, press the SOS button.
- Show the 5-second cancel window — call out why it exists (accidental taps).
- Let it complete: SMS app opens pre-filled with a live Google Maps link.

## 6. Close (20s)
"Everything here is open source — MIT licensed — and the emergency numbers list is community-maintained, because we can't get that right alone. Thanks!"

## Fallback notes if live demo hits network issues
- Places: if Overpass is slow/rate-limited mid-demo, the map still renders from the static fallback dataset for the demo city — mention this is intentional, not a bug.
- Voice: if `OPENAI_API_KEY` isn't configured on the deployed server, the assistant returns a friendly message pointing to the map/numbers instead of erroring.
