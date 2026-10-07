import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  UI_LANGUAGE_STORAGE_KEY,
  createTranslator,
  resolveLocale,
  toPreference,
  type Translate,
  type UiLanguagePreference,
  type UiLocale,
} from "@/core/i18n";

type I18nContextValue = {
  /** Concrete locale currently rendered. */
  locale: UiLocale;
  /** Stored preference ("auto" follows the system language). */
  preference: UiLanguagePreference;
  setPreference: (preference: UiLanguagePreference) => void;
  t: Translate;
};

const I18nContext = createContext<I18nContextValue | null>(null);

/** Loads the UI language preference from storage and keeps every open page in sync. */
export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [preference, setPreferenceState] = useState<UiLanguagePreference>("auto");
  // Render nothing until the saved preference is read, so text never flashes
  // (or toasts fire) in the wrong language.
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    chrome.storage.local
      .get(UI_LANGUAGE_STORAGE_KEY)
      .then((result) => setPreferenceState(toPreference(result[UI_LANGUAGE_STORAGE_KEY])))
      .catch(() => {})
      .finally(() => setIsLoaded(true));

    // React to changes made from another extension page (e.g. options -> popup)
    const onChanged = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === "local" && UI_LANGUAGE_STORAGE_KEY in changes) {
        setPreferenceState(toPreference(changes[UI_LANGUAGE_STORAGE_KEY].newValue));
      }
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, []);

  const locale = resolveLocale(preference);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      preference,
      t: createTranslator(locale),
      setPreference: (next) => {
        setPreferenceState(next);
        chrome.storage.local.set({ [UI_LANGUAGE_STORAGE_KEY]: next }).catch(() => {});
      },
    }),
    [locale, preference]
  );

  return (
    <I18nContext.Provider value={value}>{isLoaded ? children : null}</I18nContext.Provider>
  );
};

/** Access the current locale and translate function. Must be used inside I18nProvider. */
export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
};
