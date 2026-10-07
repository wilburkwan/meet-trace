import { en, type MessageKey, type Messages } from "./locales/en";
import { de } from "./locales/de";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { hi } from "./locales/hi";
import { id } from "./locales/id";
import { it } from "./locales/it";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { ms } from "./locales/ms";
import { nl } from "./locales/nl";
import { pl } from "./locales/pl";
import { pt } from "./locales/pt";
import { ru } from "./locales/ru";
import { th } from "./locales/th";
import { tr } from "./locales/tr";
import { uk } from "./locales/uk";
import { vi } from "./locales/vi";
import { zhCN } from "./locales/zh-cn";
import { zhTW } from "./locales/zh-tw";

export type { MessageKey };

/** Every interface language, in picker order, with its native name. */
const LOCALES = {
  en: { name: "English", messages: en },
  "zh-TW": { name: "繁體中文", messages: zhTW },
  "zh-CN": { name: "简体中文", messages: zhCN },
  ja: { name: "日本語", messages: ja },
  ko: { name: "한국어", messages: ko },
  vi: { name: "Tiếng Việt", messages: vi },
  th: { name: "ไทย", messages: th },
  id: { name: "Bahasa Indonesia", messages: id },
  ms: { name: "Bahasa Melayu", messages: ms },
  hi: { name: "हिन्दी", messages: hi },
  es: { name: "Español", messages: es },
  pt: { name: "Português", messages: pt },
  fr: { name: "Français", messages: fr },
  de: { name: "Deutsch", messages: de },
  it: { name: "Italiano", messages: it },
  nl: { name: "Nederlands", messages: nl },
  pl: { name: "Polski", messages: pl },
  tr: { name: "Türkçe", messages: tr },
  ru: { name: "Русский", messages: ru },
  uk: { name: "Українська", messages: uk },
} as const satisfies Record<string, { name: string; messages: Messages }>;

/** Languages the UI is translated into. */
export type UiLocale = keyof typeof LOCALES;

/** User preference: a fixed locale, or "auto" to follow the browser/system language. */
export type UiLanguagePreference = "auto" | UiLocale;

export type TranslateParams = Record<string, string | number>;
export type Translate = (key: MessageKey, params?: TranslateParams) => string;

/** chrome.storage.local key holding the UI language preference. */
export const UI_LANGUAGE_STORAGE_KEY = "uiLanguage";

const isUiLocale = (value: unknown): value is UiLocale =>
  typeof value === "string" && Object.hasOwn(LOCALES, value);

/** Selectable options; names are shown in their own language. */
export const UI_LANGUAGE_OPTIONS: readonly { id: UiLocale; name: string }[] = Object.entries(
  LOCALES
).flatMap(([id, { name }]) => (isUiLocale(id) ? [{ id, name }] : []));

/** Traditional Chinese regions/scripts (Taiwan, Hong Kong, Macau, zh-Hant). */
const TRADITIONAL_CHINESE = /^zh-(tw|hk|mo|hant)/i;

/**
 * Maps a browser language tag (e.g. "pt-BR", "zh-HK") to a UI locale,
 * falling back to English for languages without a translation.
 */
const matchLocale = (language: string): UiLocale => {
  if (TRADITIONAL_CHINESE.test(language)) return "zh-TW";
  const base = language.split("-")[0].toLowerCase();
  if (base === "zh") return "zh-CN";
  return isUiLocale(base) ? base : "en";
};

/** Detects the UI locale from the browser/system language. */
export const detectSystemLocale = (): UiLocale => {
  const language =
    typeof chrome !== "undefined" && chrome.i18n?.getUILanguage
      ? chrome.i18n.getUILanguage()
      : navigator.language;
  return matchLocale(language);
};

/** Resolves a stored preference (possibly missing or invalid) into a concrete locale. */
export const resolveLocale = (preference: unknown): UiLocale =>
  isUiLocale(preference) ? preference : detectSystemLocale();

/** Narrows an unknown stored value into a valid preference. */
export const toPreference = (value: unknown): UiLanguagePreference =>
  isUiLocale(value) ? value : "auto";

/** Creates a translate function bound to a locale, filling `{token}` params. */
export const createTranslator =
  (locale: UiLocale): Translate =>
  (key, params) => {
    const template = LOCALES[locale].messages[key] ?? en[key];
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match
    );
  };
