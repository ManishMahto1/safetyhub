/**
 * Client-side mirror of the server's keyword guidance
 * (server/src/services/fallbackGuidance.ts). Used when the voice-assist
 * request can't reach the server at all (offline) — so speaking "someone's
 * having a heart attack" still highlights Hospitals and speaks calm guidance,
 * with zero network. Keep the keyword lists roughly in sync with the server.
 * Guidance only — it never triggers an action.
 */
const RULES = [
  {
    category: 'hospital',
    keywords: [
      'hospital', 'ambulance', 'injured', 'injury', 'hurt', 'bleed', 'blood',
      'unconscious', 'faint', 'breath', 'chest', 'heart', 'pain', 'sick',
      'accident', 'wound', 'stroke', 'choking', 'choke', 'pregnant', 'labour',
      'labor', 'medical', 'doctor', 'dizzy', 'seizure', 'overdose', 'poison',
    ],
  },
  {
    category: 'fire-station',
    keywords: ['fire', 'smoke', 'burning', 'burn', 'flame', 'gas leak', 'explosion'],
  },
  {
    category: 'police',
    keywords: [
      'police', 'robbed', 'robbery', 'theft', 'stolen', 'steal', 'attack',
      'assault', 'followed', 'following', 'stalk', 'harass', 'unsafe', 'danger',
      'threat', 'fight', 'gun', 'knife', 'kidnap', 'abuse', 'mugged',
    ],
  },
  {
    category: 'pharmacy',
    keywords: [
      'medicine', 'medication', 'pharmacy', 'prescription', 'pills', 'pill',
      'chemist', 'insulin', 'inhaler', 'bandage',
    ],
  },
  {
    category: 'fuel',
    keywords: ['fuel', 'petrol', 'diesel', 'gas station', 'out of gas', 'empty tank', 'gasoline'],
  },
  { category: 'bank', keywords: ['bank', 'atm', 'cash', 'withdraw', 'card blocked'] },
];

const LIFE_THREATENING = [
  'heart attack', 'not breathing', "can't breathe", 'cant breathe', 'unconscious',
  'severe bleed', 'bleeding badly', 'drowning', 'choking', 'stroke', 'gun', 'knife',
  'stabbed', 'shot', 'overdose', 'not responding',
];

const CATEGORY_REPLY = {
  hospital:
    "It sounds like someone may need medical help. I'm showing hospitals near you — tap Call or Directions on the closest one.",
  'fire-station': "This sounds like a fire. I'm showing fire stations near you.",
  police: "If you feel unsafe, I'm showing police stations near you.",
  pharmacy: "I'm showing pharmacies near you where you can get medicine.",
  fuel: "I'm showing fuel stations near you.",
  bank: "I'm showing banks and ATMs near you.",
};

const NO_MATCH_REPLY =
  "I couldn't reach the assistant, and I'm not sure what kind of help you need. Try the map or your emergency numbers directly.";

const URGENT_PREFIX =
  'This may be a life-threatening emergency. Use the SOS button or call your local emergency number right away. ';

/**
 * @param {string} transcript
 * @returns {{ reply: string, suggestedCategory: string | null }}
 */
export function localVoiceGuidance(transcript) {
  const text = (transcript || '').toLowerCase();

  let matched = null;
  for (const rule of RULES) {
    if (rule.keywords.some((k) => text.includes(k))) {
      matched = rule.category;
      break;
    }
  }

  const urgent = LIFE_THREATENING.some((k) => text.includes(k));
  const base = matched ? CATEGORY_REPLY[matched] : NO_MATCH_REPLY;

  return {
    reply: urgent ? URGENT_PREFIX + base : base,
    suggestedCategory: matched,
  };
}
