// Single source of truth for the languages farmers can use.
// Must stay in sync with the backend's utils/languages.js (AgriTech_Backend):
// the backend rejects quizzes missing any of these languages.
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "bho", label: "Bhojpuri" },
];

// The language admins author in; others are translated from it.
export const BASE_LANG = "en";

export const LANG_CODES = LANGUAGES.map((l) => l.code);

export const emptyI18nString = () =>
  Object.fromEntries(LANG_CODES.map((code) => [code, ""]));

export const emptyI18nOptions = (count = 4) =>
  Object.fromEntries(LANG_CODES.map((code) => [code, Array(count).fill("")]));
