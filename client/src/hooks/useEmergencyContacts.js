import { useAppStore } from '../store/appStore.js';

/**
 * Thin, ergonomic wrapper around the contacts slice of appStore.
 * Kept as its own hook so components don't need to know contacts
 * happen to live in localStorage/Zustand.
 */
export function useEmergencyContacts() {
  const contacts = useAppStore((s) => s.contacts);
  const addContact = useAppStore((s) => s.addContact);
  const updateContact = useAppStore((s) => s.updateContact);
  const removeContact = useAppStore((s) => s.removeContact);
  const maxContacts = useAppStore((s) => s.maxContacts);

  return {
    contacts,
    addContact, // (contact: {name, phone, relation?}) => {ok, reason?}
    updateContact, // (id, patch)
    removeContact, // (id)
    canAddMore: contacts.length < maxContacts,
    maxContacts,
  };
}
