import { useEffect, useState } from "react";

/**
 * Reads one preference from the background "settings" store, saves changes
 * immediately and follows changes made elsewhere (popup, overlay).
 */
export const useStoredSetting = <T,>(key: string) => {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    chrome.runtime
      .sendMessage({ action: "getSettings" })
      .then((response) => {
        if (response?.success) setValue(response.settings[key] as T);
      })
      .catch(() => {});

    // Follow changes made elsewhere (e.g. the popup's mic switch) while this page is open.
    const handleChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      const next: unknown = changes.settings?.newValue;
      if (area === "local" && typeof next === "object" && next !== null && key in next) {
        setValue((next as Record<string, T>)[key]);
      }
    };
    chrome.storage.onChanged.addListener(handleChange);
    return () => chrome.storage.onChanged.removeListener(handleChange);
  }, [key]);

  const update = (next: T) => {
    setValue(next);
    void chrome.runtime.sendMessage({ action: "saveSettings", settings: { [key]: next } });
  };

  return [value, update] as const;
};
