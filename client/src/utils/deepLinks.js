/**
 * Builders for platform deep links. Kept dependency-free so they work offline.
 */

/** tel: link for direct dialing. Strips whitespace, keeps leading +. */
export function buildTelLink(number) {
  const cleaned = String(number).replace(/[^\d+]/g, '');
  return `tel:${cleaned}`;
}

/** sms: link, pre-filled with a body message (used by SOS). */
export function buildSmsLink(number, message = '') {
  const cleaned = String(number).replace(/[^\d+]/g, '');
  const body = encodeURIComponent(message);
  // iOS uses `&`, most Android clients accept `?body=` too; `&` is the safer cross-platform choice
  return `sms:${cleaned}&body=${body}`;
}

/** wa.me deep link. Expects an E.164-ish number without symbols for best results. */
export function buildWhatsAppLink(number, message = '') {
  const cleaned = String(number).replace(/[^\d]/g, '');
  const text = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${text}`;
}

/** Google Maps link for a lat/lng pair, used inside SOS messages. */
export function buildMapsLink(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/** Standard SOS message body shared by SMS + WhatsApp sends. */
export function buildSosMessage({ name, lat, lng, accuracy }) {
  const mapsLink = buildMapsLink(lat, lng);
  const who = name ? `${name} needs help.` : 'I need help.';
  const acc = Number.isFinite(accuracy) ? ` (accuracy ~${Math.round(accuracy)}m)` : '';
  return `SafetyHub SOS: ${who} My live location: ${mapsLink}${acc}`;
}
