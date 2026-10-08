import { settings, updateSettings } from "@live/live-state";
import { showErrorToast } from "./notice-store";
import { t } from "@live/i18n";

export async function saveOverlaySettings(
  newSettings: Partial<typeof settings>,
): Promise<boolean> {
  const previousSettings = settings;
  updateSettings(newSettings);

  try {
    const response = await chrome.runtime.sendMessage({
      action: "saveSettings",
      // Only the changed fields, so values set on the settings page meanwhile
      // (e.g. the meeting language) are never overwritten with stale copies.
      settings: newSettings,
    });
    if (!response?.success) throw new Error("Settings were not saved");
    return true;
  } catch {
    updateSettings(previousSettings);
    showErrorToast(t("ui.saveFailed"));
    return false;
  }
}
