import { LANGUAGES } from "@/core/constants";

// Traditional Chinese regions; other Chinese locales use Simplified.
const TRADITIONAL_CHINESE = /^zh-(hant|tw|hk|mo)/i;

/** The browser's UI language as a translation target, falling back to English. */
export const systemTargetLanguage = (): string => {
  const locale = navigator.language;
  if (TRADITIONAL_CHINESE.test(locale)) return "zh-Hant";
  const base = locale.split("-")[0].toLowerCase();
  if (base === "zh") return "zh";
  return LANGUAGES.some((language) => language.code === base) ? base : "en";
};
