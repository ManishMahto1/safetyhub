import { create } from 'zustand';

const CONTACTS_KEY = 'safetyhub:contacts';
const MAX_CONTACTS = 5;

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

  // emergency contacts, capped at MAX_CONTACTS, persisted to localStorage
  contacts: loadContacts(),
  addContact: (contact) => {
    const { contacts } = get();
    if (contacts.length >= MAX_CONTACTS) return { ok: false, reason: 'limit' };
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
