import { useCallback, useEffect, useState } from "react";
import { getBuiltInAi, toTranslatorLanguage, type DownloadMonitor } from "@/core/chrome-ai";

export type ModelStatus =
  | { kind: "checking" }
  | { kind: "browser-unsupported" }
  | { kind: "same-language" }
  | { kind: "auto" }
  | { kind: "unsupported" }
  | { kind: "downloadable" }
  | { kind: "downloading"; percent: number }
  | { kind: "ready" }
  | { kind: "failed"; reason: string };

type LanguageSettings = { sourceLanguage: string; targetLanguage: string };

const saveLanguageSettings = (settings: Partial<LanguageSettings>) =>
  chrome.runtime.sendMessage({ action: "saveSettings", settings });

/** Meeting/target language preferences and the on-device model for that pair. */
export const useTranslationSetup = () => {
  const [languages, setLanguages] = useState<LanguageSettings | null>(null);
  const [status, setStatus] = useState<ModelStatus>({ kind: "checking" });

  useEffect(() => {
    chrome.runtime
      .sendMessage({ action: "getSettings" })
      .then((response) => {
        if (!response?.success) return;
        const { sourceLanguage, targetLanguage } = response.settings;
        setLanguages({ sourceLanguage, targetLanguage });
      })
      .catch(() => {});
  }, []);

  const checkStatus = useCallback(async (settings: LanguageSettings) => {
    const { Translator } = getBuiltInAi();
    if (!Translator) return setStatus({ kind: "browser-unsupported" });
    if (settings.sourceLanguage === "auto") return setStatus({ kind: "auto" });
    const sourceLanguage = toTranslatorLanguage(settings.sourceLanguage);
    const targetLanguage = toTranslatorLanguage(settings.targetLanguage);
    if (sourceLanguage === targetLanguage) return setStatus({ kind: "same-language" });
    setStatus({ kind: "checking" });
    const availability = await Translator.availability({ sourceLanguage, targetLanguage });
    setStatus(
      availability === "available"
        ? { kind: "ready" }
        : availability === "unavailable"
          ? { kind: "unsupported" }
          : { kind: "downloadable" }
    );
  }, []);

  useEffect(() => {
    if (languages) void checkStatus(languages).catch(() => setStatus({ kind: "unsupported" }));
  }, [languages, checkStatus]);

  const updateLanguages = (next: Partial<LanguageSettings>) => {
    setLanguages((current) => (current ? { ...current, ...next } : current));
    void saveLanguageSettings(next);
  };

  /** Must be called from a click: Chrome only downloads models on a user gesture. */
  const download = () => {
    const { Translator } = getBuiltInAi();
    if (!Translator || !languages || languages.sourceLanguage === "auto") return;
    const monitor = (m: DownloadMonitor) =>
      m.addEventListener("downloadprogress", (event) =>
        setStatus({ kind: "downloading", percent: Math.round(event.loaded * 100) })
      );
    setStatus({ kind: "downloading", percent: 0 });
    Translator.create({
      sourceLanguage: toTranslatorLanguage(languages.sourceLanguage),
      targetLanguage: toTranslatorLanguage(languages.targetLanguage),
      monitor,
    })
      .then((translator) => {
        translator.destroy();
        setStatus({ kind: "ready" });
      })
      .catch((error: unknown) =>
        setStatus({ kind: "failed", reason: error instanceof Error ? error.message : String(error) })
      );
  };

  return { languages, status, updateLanguages, download };
};
