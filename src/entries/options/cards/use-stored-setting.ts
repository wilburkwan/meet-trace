import { useEffect, useState } from "react";

/**
 * Reads one preference from the background "settings" store and saves changes
 * immediately (open meeting overlays pick them up through storage sync).
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
  }, [key]);

  const update = (next: T) => {
    setValue(next);
    void chrome.runtime.sendMessage({ action: "saveSettings", settings: { [key]: next } });
  };

  return [value, update] as const;
};
