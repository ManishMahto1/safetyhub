import { create } from 'zustand';

const CONTACTS_KEY = 'safetyhub:contacts';
const SOS_ACTIVE_KEY = 'safetyhub:sosActive';
const DISASTER_KEY = 'safetyhub:disasterMode';
const MAX_CONTACTS = 5;

/** Compare phone numbers by digits only, so "+1 555" and "1555" are the same. */
function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function loadContacts() {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistContacts(contacts) {
  try {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  } catch {
    // storage unavailable (private mode / quota) — fail silently, in-memory state still works
  }
}

function loadSosActive() {
  try {
    return localStorage.getItem(SOS_ACTIVE_KEY) === '1';
  } catch {
    return false;
  }
}

function persistSosActive(active) {
  try {
    if (active) localStorage.setItem(SOS_ACTIVE_KEY, '1');
    else localStorage.removeItem(SOS_ACTIVE_KEY);
  } catch {
    // non-fatal
  }
}

function loadDisasterMode() {
  try {
    return localStorage.getItem(DISASTER_KEY) === '1';
  } catch {
    return false;
  }
}

function persistDisasterMode(active) {
  try {
    if (active) localStorage.setItem(DISASTER_KEY, '1');
    else localStorage.removeItem(DISASTER_KEY);
  } catch {
    // non-fatal
  }
}

export const useAppStore = create((set, get) => ({
  // region: ISO country code used to look up emergency numbers
  region: 'default',
  setRegion: (region) => set({ region }),

  // network status, updated by useOnlineStatus
  isOffline: !navigator.onLine,
  setOffline: (isOffline) => set({ isOffline }),

  // last known position, shared across Home/MapView/SOS so we don't re-prompt constantly
  coords: null,
  setCoords: (coords) => set({ coords }),

  // whether an SOS was recently sent — drives the "I'm Safe" follow-up prompt.
  // Persisted so it survives a reload/offline after an alert.
  sosActive: loadSosActive(),
  setSosActive: (active) => {
    persistSosActive(active);
    set({ sosActive: active });
  },

  // demo "disaster mode": surfaces a curated shelter/relief dataset app-wide.
  disasterMode: loadDisasterMode(),
  setDisasterMode: (active) => {
    persistDisasterMode(active);
    set({ disasterMode: active });
  },

  // emergency contacts, capped at MAX_CONTACTS, persisted to localStorage
  contacts: loadContacts(),
  addContact: (contact) => {
    const { contacts } = get();
    if (contacts.length >= MAX_CONTACTS) return { ok: false, reason: 'limit' };
    const phone = normalizePhone(contact.phone);
    if (contacts.some((c) => normalizePhone(c.phone) === phone)) {
      return { ok: false, reason: 'duplicate' };
    }
    const next = [...contacts, { id: crypto.randomUUID(), ...contact }];
    persistContacts(next);
    set({ contacts: next });
    return { ok: true };
  },
  updateContact: (id, patch) => {
    const next = get().contacts.map((c) => (c.id === id ? { ...c, ...patch } : c));
    persistContacts(next);
    set({ contacts: next });
  },
  removeContact: (id) => {
    const next = get().contacts.filter((c) => c.id !== id);
    persistContacts(next);
    set({ contacts: next });
  },

  maxContacts: MAX_CONTACTS,
}));
