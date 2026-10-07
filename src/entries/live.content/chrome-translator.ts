import type { TranslateResponse } from "@live/models";
import { t } from "@live/i18n";
import {
  getBuiltInAi,
  toTranslatorLanguage,
  type ChromeLanguageDetector,
  type ChromeTranslator,
} from "@/core/chrome-ai";

// Detection on short captions is noisy; below this confidence we reuse the
// last confident language instead.
const MIN_DETECTION_CONFIDENCE = 0.6;

const translators = new Map<string, Promise<ChromeTranslator>>();
let detectorPromise: Promise<ChromeLanguageDetector> | null = null;
let lastDetectedLanguage: string | null = null;

const baseLanguage = (code: string): string => code.split("-")[0].toLowerCase();

/** Error raised when a model must be downloaded first (needs a user click). */
class ModelNotReadyError extends Error {}
class UnsupportedPairError extends Error {}

const getDetector = (): Promise<ChromeLanguageDetector> | null => {
  const { LanguageDetector } = getBuiltInAi();
  if (!LanguageDetector) return null;
  detectorPromise ??= LanguageDetector.create().catch((error: unknown) => {
    detectorPromise = null;
    throw error;
  });
  return detectorPromise;
};

/** Spoken language: the configured one, or detected from the caption. */
const resolveSourceLanguage = async (text: string, configured: string): Promise<string | null> => {
  if (configured !== "auto") return toTranslatorLanguage(configured);
  try {
    const detector = await getDetector();
    const [top] = detector ? await detector.detect(text) : [];
    if (top && top.detectedLanguage !== "und" && top.confidence >= MIN_DETECTION_CONFIDENCE) {
      lastDetectedLanguage = top.detectedLanguage;
    }
  } catch {
    // Detector model missing: keep the last detected language, if any.
  }
  return lastDetectedLanguage;
};

/**
 * Returns a cached translator. Content scripts only use models that are
 * already on the device: downloads need a click, which happens on the
 * settings page (Settings → Translation → Download).
 */
const getTranslator = (sourceLanguage: string, targetLanguage: string): Promise<ChromeTranslator> => {
  const key = `${sourceLanguage}->${targetLanguage}`;
  const cached = translators.get(key);
  if (cached) return cached;

  const { Translator } = getBuiltInAi();
  if (!Translator) return Promise.reject(new Error("Translator API unavailable"));

  const created = Translator.availability({ sourceLanguage, targetLanguage }).then((availability) => {
    if (availability === "unavailable") throw new UnsupportedPairError();
    if (availability !== "available") throw new ModelNotReadyError();
    return Translator.create({ sourceLanguage, targetLanguage });
  });
  // Forget failures so the next caption retries (e.g. after a download).
  created.catch(() => translators.delete(key));
  translators.set(key, created);
  return created;
};

/**
 * Called synchronously from a click (the Translations toggle or language
 * picker): Chrome only allows model downloads during a user gesture.
 */
export const prepareTranslatorFromClick = (sourceSetting: string, targetSetting: string): void => {
  const { Translator, LanguageDetector } = getBuiltInAi();
  if (sourceSetting === "auto") {
    LanguageDetector?.create().catch(() => {});
    return;
  }
  const sourceLanguage = toTranslatorLanguage(sourceSetting);
  const targetLanguage = toTranslatorLanguage(targetSetting);
  if (!Translator || sourceLanguage === targetLanguage) return;
  // Not awaited before create(): the gesture must still be active.
  Translator.create({ sourceLanguage, targetLanguage })
    .then(() => translators.delete(`${sourceLanguage}->${targetLanguage}`))
    .catch(() => {});
};

const toErrorMessage = (error: unknown, source: string, target: string): string => {
  if (error instanceof ModelNotReadyError) return t("overlay.needsModel");
  if (error instanceof DOMException && error.name === "NotAllowedError") return t("overlay.needsModel");
  if (error instanceof UnsupportedPairError) return t("overlay.unsupported", { source, target });
  const reason = error instanceof Error ? error.message : String(error);
  return t("overlay.failed", { reason });
};

/** Translates text on-device with Chrome's built-in Translator API. */
export const translateWithChrome = async (
  text: string,
  sourceSetting: string,
  targetSetting: string
): Promise<TranslateResponse> => {
  if (!getBuiltInAi().Translator) {
    return { success: false, error: t("overlay.browserUnsupported") };
  }

  const target = toTranslatorLanguage(targetSetting);
  const source = await resolveSourceLanguage(text, sourceSetting);
  if (!source) return { success: false, error: t("overlay.needsModel") };
  if (source === target) return { success: true, translation: text };

  try {
    const translator = await getTranslator(source, target);
    return { success: true, translation: await translator.translate(text) };
  } catch (error) {
    // Same language family (e.g. zh -> zh-Hant) without a model: show as-is.
    if (baseLanguage(source) === baseLanguage(target)) return { success: true, translation: text };
    return { success: false, error: toErrorMessage(error, source, target) };
  }
};
