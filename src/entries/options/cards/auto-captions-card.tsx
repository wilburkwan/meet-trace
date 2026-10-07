import { ClosedCaptioningIcon, PlayCircleIcon } from "@phosphor-icons/react";
import { SettingToggleCard } from "./setting-toggle-card";

/** Open the caption window automatically when joining a meeting. */
export const AutoPanelCard = () => (
  <SettingToggleCard
    icon={<PlayCircleIcon className="size-5.5" />}
    settingKey="autoShowPanel"
    titleKey="settings.autoPanelTitle"
    bodyKey="settings.autoPanelBody"
  />
);

/** Click the meeting's CC button automatically. */
export const AutoCaptionsCard = () => (
  <SettingToggleCard
    icon={<ClosedCaptioningIcon className="size-5.5" />}
    settingKey="autoEnableCaptions"
    titleKey="settings.autoCaptionsTitle"
    bodyKey="settings.autoCaptionsBody"
  />
);
