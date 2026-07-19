import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEmergencyContacts } from '../hooks/useEmergencyContacts.js';

const EMPTY_FORM = { name: '', phone: '', channel: 'sms' };

/** Requires at least 3 digits so a deep link has something dialable. */
function hasEnoughDigits(phone) {
  return (phone.match(/\d/g) || []).length >= 3;
}

export default function Contacts() {
  const { t } = useTranslation();
  const { contacts, addContact, updateContact, removeContact, canAddMore, maxContacts } =
    useEmergencyContacts();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const isEditing = editingId !== null;
  const showForm = isEditing || canAddMore;

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name, phone: c.phone, channel: c.channel || 'sms' });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const name = form.name.trim();
    const phone = form.phone.trim();

    if (!name || !phone) {
      setError(t('contacts.errRequired'));
      return;
    }
    if (!hasEnoughDigits(phone)) {
      setError(t('contacts.errPhone'));
      return;
    }

    if (isEditing) {
      updateContact(editingId, { name, phone, channel: form.channel });
      cancelEdit();
      return;
    }

    const result = addContact({ name, phone, channel: form.channel });
    if (!result.ok) {
      setError(
        result.reason === 'duplicate'
          ? t('contacts.errDuplicate')
          : t('contacts.errLimit', { max: maxContacts })
      );
      return;
    }
    setForm(EMPTY_FORM);
  };

  return (
    <div className="px-4 pt-6 pb-28 space-y-6 max-w-lg mx-auto">
      <header>
        <h1 className="font-display text-2xl font-bold">{t('contacts.title')}</h1>
        <p className="text-muted text-sm mt-1">
          {t('contacts.subtitle', { count: contacts.length, max: maxContacts })}
        </p>
      </header>

      <ul className="space-y-2">
        {contacts.map((c) => (
          <li key={c.id} className="card flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              <p className="font-semibold truncate">{c.name}</p>
              <p className="text-xs text-muted truncate">
                {c.phone} · {c.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => startEdit(c)}
                className="tap-target text-sm font-semibold text-calm"
                aria-label={t('contacts.ariaEdit', { name: c.name })}
              >
                {t('contacts.edit')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingId === c.id) cancelEdit();
                  removeContact(c.id);
                }}
                className="tap-target text-sm font-semibold text-alert"
                aria-label={t('contacts.ariaRemove', { name: c.name })}
              >
                {t('contacts.remove')}
              </button>
            </div>
          </li>
        ))}
        {contacts.length === 0 && (
          <li className="card px-4 py-6 text-center text-sm text-muted">{t('contacts.empty')}</li>
        )}
      </ul>

      {showForm ? (
        <form onSubmit={handleSubmit} className="card p-4 space-y-3">
          <h2 className="font-semibold">
            {isEditing ? t('contacts.editTitle') : t('contacts.addTitle')}
          </h2>
          <div>
            <label htmlFor="contact-name" className="block text-xs text-muted mb-1">
              {t('contacts.name')}
            </label>
            <input
              id="contact-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg bg-surface2 px-3 py-2.5 outline-none"
              placeholder={t('contacts.namePlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="contact-phone" className="block text-xs text-muted mb-1">
              {t('contacts.phone')}
            </label>
            <input
              id="contact-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-lg bg-surface2 px-3 py-2.5 outline-none"
              placeholder={t('contacts.phonePlaceholder')}
            />
          </div>
          <fieldset>
            <legend className="block text-xs text-muted mb-1">{t('contacts.sendVia')}</legend>
            <div className="flex gap-2">
              {['sms', 'whatsapp'].map((channel) => (
                <button
                  type="button"
                  key={channel}
                  onClick={() => setForm((f) => ({ ...f, channel }))}
                  className={`tap-target flex-1 rounded-lg py-2 text-sm font-medium ${
                    form.channel === channel ? 'bg-signal text-ink' : 'bg-surface2 text-muted'
                  }`}
                >
                  {channel === 'sms' ? t('contacts.channelSms') : t('contacts.channelWhatsapp')}
                </button>
              ))}
            </div>
          </fieldset>
          {error && <p className="text-alert text-xs">{error}</p>}
          <div className="flex gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="tap-target flex-1 rounded-full bg-surface2 py-3 font-semibold"
              >
                {t('contacts.cancel')}
              </button>
            )}
            <button
              type="submit"
              className="tap-target flex-1 rounded-full bg-signal text-ink py-3 font-semibold"
            >
              {isEditing ? t('contacts.saveChanges') : t('contacts.save')}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-muted text-center">
          {t('contacts.limitReached', { max: maxContacts })}
        </p>
      )}
    </div>
  );
}
