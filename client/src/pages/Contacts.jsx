import { useState } from 'react';
import { useEmergencyContacts } from '../hooks/useEmergencyContacts.js';

export default function Contacts() {
  const { contacts, addContact, removeContact, canAddMore, maxContacts } = useEmergencyContacts();
  const [form, setForm] = useState({ name: '', phone: '', channel: 'sms' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone number are required.');
      return;
    }
    const result = addContact({ ...form, name: form.name.trim(), phone: form.phone.trim() });
    if (!result.ok) {
      setError(`You can save up to ${maxContacts} contacts.`);
      return;
    }
    setForm({ name: '', phone: '', channel: 'sms' });
  };

  return (
    <div className="px-4 pt-6 pb-28 space-y-6 max-w-lg mx-auto">
      <header>
        <h1 className="font-display text-2xl font-bold">Emergency contacts</h1>
        <p className="text-muted text-sm mt-1">
          These are who SOS alerts your live location to. {contacts.length}/{maxContacts} saved.
        </p>
      </header>

      <ul className="space-y-2">
        {contacts.map((c) => (
          <li key={c.id} className="card flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-muted">
                {c.phone} · {c.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeContact(c.id)}
              className="tap-target text-alert text-sm font-semibold"
              aria-label={`Remove ${c.name}`}
            >
              Remove
            </button>
          </li>
        ))}
        {contacts.length === 0 && (
          <li className="card px-4 py-6 text-center text-sm text-muted">
            No contacts yet. Add someone who should know if you're in trouble.
          </li>
        )}
      </ul>

      {canAddMore ? (
        <form onSubmit={handleSubmit} className="card p-4 space-y-3">
          <h2 className="font-semibold">Add a contact</h2>
          <div>
            <label htmlFor="contact-name" className="block text-xs text-muted mb-1">
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg bg-surface2 px-3 py-2.5 outline-none"
              placeholder="e.g. Mom"
            />
          </div>
          <div>
            <label htmlFor="contact-phone" className="block text-xs text-muted mb-1">
              Phone number
            </label>
            <input
              id="contact-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-lg bg-surface2 px-3 py-2.5 outline-none"
              placeholder="+1 555 123 4567"
            />
          </div>
          <fieldset>
            <legend className="block text-xs text-muted mb-1">Send SOS via</legend>
            <div className="flex gap-2">
              {['sms', 'whatsapp'].map((channel) => (
                <button
                  type="button"
                  key={channel}
                  onClick={() => setForm((f) => ({ ...f, channel }))}
                  className={`tap-target flex-1 rounded-lg py-2 text-sm font-medium capitalize ${
                    form.channel === channel ? 'bg-signal text-ink' : 'bg-surface2 text-muted'
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>
          </fieldset>
          {error && <p className="text-alert text-xs">{error}</p>}
          <button
            type="submit"
            className="tap-target w-full rounded-full bg-signal text-ink py-3 font-semibold"
          >
            Save contact
          </button>
        </form>
      ) : (
        <p className="text-xs text-muted text-center">
          You've reached the {maxContacts}-contact limit. Remove one to add another.
        </p>
      )}
    </div>
  );
}
