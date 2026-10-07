import {
  UI_LANGUAGE_STORAGE_KEY,
  createTranslator,
  resolveLocale,
  type Translate,
} from "@/core/i18n";
import { notifyStateChange } from "@live/live-state";

// Overlay messages follow the interface language chosen on the settings page.
let translate: Translate = createTranslator(resolveLocale(undefined));

/** Translates an overlay message into the current interface language. */
export const t: Translate = (key, params) => translate(key, params);

const apply = (value: unknown): void => {
  translate = createTranslator(resolveLocale(value));
  notifyStateChange(); // re-render the overlay in the new language
};

/** Loads the interface language (await before rendering) and follows later changes. */
export const startI18nSync = async (): Promise<void> => {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && UI_LANGUAGE_STORAGE_KEY in changes) {
      apply(changes[UI_LANGUAGE_STORAGE_KEY].newValue);
    }
  });
  try {
    const result = await chrome.storage.local.get(UI_LANGUAGE_STORAGE_KEY);
    apply(result[UI_LANGUAGE_STORAGE_KEY]);
  } catch {
    // Keep the system language.
  }
};
