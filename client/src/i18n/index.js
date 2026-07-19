import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
];

// Map our short codes to BCP-47 tags for speech recognition/synthesis and to
// the language name the LLM should reply in.
export const LANGUAGE_META = {
  en: { bcp47: 'en-US', name: 'English' },
  hi: { bcp47: 'hi-IN', name: 'Hindi' },
  es: { bcp47: 'es-ES', name: 'Spanish' },
  fr: { bcp47: 'fr-FR', name: 'French' },
};

const PREF_KEY = 'safetyhub:langPref'; // 'auto' | <code>
const SUPPORTED_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

function navigatorLanguage() {
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return SUPPORTED_CODES.includes(nav) ? nav : 'en';
}

export function getLanguagePref() {
  try {
    return localStorage.getItem(PREF_KEY) || 'auto';
  } catch {
    return 'auto';
  }
}

function resolvePref(pref) {
  return pref === 'auto' ? navigatorLanguage() : pref;
}

/** Apply and persist a language preference ('auto' or a code). */
export function applyLanguagePref(pref) {
  try {
    localStorage.setItem(PREF_KEY, pref);
  } catch {
    // storage unavailable — language still applies for this session
  }
  i18n.changeLanguage(resolvePref(pref));
}

/** BCP-47 tag for the active language (for STT/TTS). */
export function activeBcp47() {
  return LANGUAGE_META[i18n.language]?.bcp47 || 'en-US';
}

/** Human language name for the active language (for the LLM prompt). */
export function activeLanguageName() {
  return LANGUAGE_META[i18n.language]?.name || 'English';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    es: { translation: es },
    fr: { translation: fr },
  },
  lng: resolvePref(getLanguagePref()),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Keep <html lang> in sync so screen readers announce content in the right
// language. All four supported languages are LTR, so dir stays untouched.
function syncHtmlLang(lng) {
  try {
    document.documentElement.lang = lng;
  } catch {
    // no document (SSR/tests) — non-fatal
  }
}
syncHtmlLang(i18n.language);
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
