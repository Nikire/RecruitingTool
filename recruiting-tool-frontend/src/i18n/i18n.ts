import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import es from "./locales/es.json";

/**
 * Dev-only guard. Vite statically replaces `import.meta.env.DEV` with `false`
 * in production builds, so every block below is dropped at build time and
 * never runs (or logs) for real users.
 */
const isDev = import.meta.env.DEV;

/**
 * Reports translation keys that are called from the UI but missing from the
 * locale files. Without this, i18next silently falls back to rendering the raw
 * dotted key (e.g. "common.expand"), which is easy to miss in review and
 * especially harmful inside aria-labels.
 *
 * Each key is reported once per session to keep the console readable.
 */
const reportedMissingKeys = new Set<string>();

const missingKeyHandler = (
  lngs: readonly string[],
  ns: string,
  key: string,
): void => {
  if (!isDev) return;

  const dedupeKey = `${lngs.join(",")}|${ns}|${key}`;
  if (reportedMissingKeys.has(dedupeKey)) return;
  reportedMissingKeys.add(dedupeKey);

  console.error(
    `[i18n] Missing translation key "${key}" (namespace: "${ns}", language: "${lngs.join(", ")}"). ` +
      `Add it to src/i18n/locales/en.json and src/i18n/locales/es.json.`,
  );
};

/**
 * Keeps `<html lang>` in sync with the active i18next language.
 *
 * index.html hardcodes `lang="en"`, so without this the Spanish UI is served
 * inside a document declared as English. That is a WCAG 2.2 SC 3.1.1
 * (Language of Page, Level A) failure: screen readers pick the wrong voice /
 * pronunciation rules, and search engines mis-detect the page language.
 *
 * Only the base subtag is written (`es`, never `es-419`) so it always matches
 * one of our `supportedLngs`.
 */
const syncDocumentLanguage = (lng: string | undefined): void => {
  if (typeof document === "undefined") return;

  const baseLanguage = (lng || "en").split("-")[0].split("_")[0];
  if (document.documentElement.lang !== baseLanguage) {
    document.documentElement.lang = baseLanguage;
  }
};

i18n.on("languageChanged", syncDocumentLanguage);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    supportedLngs: ["en", "es"],
    nonExplicitSupportedLngs: true,
    fallbackLng: "en",
    debug: false,
    // `saveMissing` is what makes i18next invoke `missingKeyHandler` at all.
    // Kept dev-only so production never pays the lookup cost nor spams logs.
    saveMissing: isDev,
    missingKeyHandler,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "cookie", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
    react: { useSuspense: false },
  });

// `languageChanged` normally fires during `init()`, but run once more here so
// the attribute is correct even if the detector resolves synchronously to the
// fallback language and no event is emitted.
syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language);

export default i18n;
