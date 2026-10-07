import type { Settings } from "./models";
import { DEFAULT_SETTINGS } from "./defaults";

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];

/** Keeps only known preferences; unknown or outdated fields are ignored. */
const pickKnownSettings = (stored: unknown): Partial<Settings> => {
  if (typeof stored !== "object" || stored === null) return {};
  return Object.fromEntries(
    Object.entries(stored).filter(([key]) => SETTING_KEYS.some((known) => known === key))
  );
};

export async function getSettings(): Promise<{
  success: boolean;
  settings: Settings;
}> {
  const result = await chrome.storage.local.get("settings");
  const settings = { ...DEFAULT_SETTINGS, ...pickKnownSettings(result.settings) };
  return { success: true, settings };
}

export async function saveSettings(
  settings: Partial<Settings>
): Promise<{ success: boolean }> {
  const current = await getSettings();
  const updated = { ...current.settings, ...pickKnownSettings(settings) };
  await chrome.storage.local.set({ settings: updated });
  return { success: true };
}
