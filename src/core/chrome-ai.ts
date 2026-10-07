// Minimal typings for Chrome's built-in AI APIs (Chrome 138+), which are not
// yet part of lib.dom. See https://developer.chrome.com/docs/ai/translator-api

export type AiAvailability =
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

export type DownloadMonitor = {
  addEventListener: (
    type: "downloadprogress",
    listener: (event: { loaded: number }) => void
  ) => void;
};

type CreateOptions = {
  monitor?: (monitor: DownloadMonitor) => void;
};

export type ChromeTranslator = {
  translate: (text: string) => Promise<string>;
  destroy: () => void;
};

export type TranslatorStatic = {
  availability: (options: {
    sourceLanguage: string;
    targetLanguage: string;
  }) => Promise<AiAvailability>;
  create: (
    options: { sourceLanguage: string; targetLanguage: string } & CreateOptions
  ) => Promise<ChromeTranslator>;
};

export type LanguageDetectionResult = {
  detectedLanguage: string;
  confidence: number;
};

export type ChromeLanguageDetector = {
  detect: (text: string) => Promise<LanguageDetectionResult[]>;
};

export type LanguageDetectorStatic = {
  availability: () => Promise<AiAvailability>;
  create: (options?: CreateOptions) => Promise<ChromeLanguageDetector>;
};

type BuiltInAiGlobals = {
  Translator?: TranslatorStatic;
  LanguageDetector?: LanguageDetectorStatic;
};

declare global {
  // Optional: only present in Chrome 138+ desktop.
  var Translator: TranslatorStatic | undefined;
  var LanguageDetector: LanguageDetectorStatic | undefined;
}

/** Reads the built-in AI constructors from the global scope, if present. */
export const getBuiltInAi = (): BuiltInAiGlobals => ({
  Translator: "Translator" in globalThis ? globalThis.Translator : undefined,
  LanguageDetector:
    "LanguageDetector" in globalThis ? globalThis.LanguageDetector : undefined,
});

/**
 * Maps the app's language codes to codes Chrome's Translator understands.
 * Chrome has no Cantonese model; written Cantonese captions use Traditional
 * Chinese characters, so zh-Hant is the closest match.
 */
export const toTranslatorLanguage = (code: string): string =>
  code === "yue-Hant" ? "zh-Hant" : code;
