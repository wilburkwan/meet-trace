import type { ChangeEvent, RefObject } from "react";
import {
  ClosedCaptioningIcon,
  MinusIcon,
  NotePencilIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  TranslateIcon,
} from "@phosphor-icons/react";
import {
  LANGUAGES,
  MAX_AUTO_TRANSLATE_DISTANCE,
} from "@live/config";
import {
  clearTranslationQueue,
  enqueueNearbyCaptions,
} from "@live/translate-scheduler";
import type { Settings } from "@live/models";
import { saveOverlaySettings } from "@live/panel/common";
import { prepareTranslatorFromClick } from "@live/chrome-translator";
import { t } from "@live/i18n";
import { CopyAllButton } from "./copy-all-button";
import { FontSizeControlContainer } from "./text-size";
import { WaveIndicator } from "./voice-meter";

type Props = {
  headerRef: RefObject<HTMLDivElement | null>;
  isMinimized: boolean;
  isWaveActive: boolean;
  isNotesOpen: boolean;
  settings: Settings;
  onMinimize: () => void;
  onExpand: () => void;
  onToggleNotes: () => void;
};

const iconButtonClass =
  "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent transition hover:bg-(--ms-overlay-control-hover) hover:text-white";

export const Header = ({
  headerRef,
  isMinimized,
  isWaveActive,
  isNotesOpen,
  settings,
  onMinimize,
  onExpand,
  onToggleNotes,
}: Props) => {
  const handleToggleTranslation = async () => {
    const enabled = !settings.translationEnabled;
    // Runs inside the click so Chrome may download the model if needed.
    if (enabled) prepareTranslatorFromClick(settings.sourceLanguage, settings.targetLanguage);
    const saved = await saveOverlaySettings({ translationEnabled: enabled });
    if (!saved) return;
    if (enabled) enqueueNearbyCaptions(MAX_AUTO_TRANSLATE_DISTANCE);
    else clearTranslationQueue();
  };

  const handleTargetLanguageChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    prepareTranslatorFromClick(settings.sourceLanguage, event.target.value);
    void saveOverlaySettings({ targetLanguage: event.target.value });
  };

  const handleOpenSettings = () => {
    void chrome.runtime.sendMessage({ action: "openOptions" });
  };

  if (isMinimized) {
    return (
      <div ref={headerRef} className="flex h-12 w-27 cursor-grab items-center justify-center gap-5 rounded-3xl bg-(--ms-overlay-header) select-none active:cursor-grabbing">
        <WaveIndicator active={isWaveActive} />
        <button className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-white transition-colors hover:bg-white/15" type="button" title={t("ui.expand")} aria-label={t("ui.expand")} onClick={onExpand}>
          <PlusIcon className="size-5" weight="regular" />
        </button>
      </div>
    );
  }

  return (
    <div ref={headerRef} className="flex h-14.5 min-w-max shrink-0 cursor-grab items-center gap-3 rounded-t-xl bg-(--ms-overlay-header) px-3.5 select-none active:cursor-grabbing">
      {/* Left: title, then translation controls */}
      <div className="flex shrink-0 items-center gap-1.5">
        <ClosedCaptioningIcon className="size-5 text-white" weight="fill" />
        <span className="text-sm font-semibold whitespace-nowrap text-white">{t("ui.captions")}</span>
      </div>

      <span className="h-5 w-px shrink-0 bg-white/15" aria-hidden="true" />

      <div className="mr-auto flex shrink-0 items-center gap-2">
        <TranslateIcon className="size-4.5 text-white/80" />
        <span className="text-sm whitespace-nowrap text-white/90">{t("ui.translate")}</span>
        <button
          type="button"
          role="switch"
          aria-checked={settings.translationEnabled}
          aria-label={t("ui.translate")}
          title={settings.translationEnabled ? t("ui.translationOn") : t("ui.translationOff")}
          onClick={handleToggleTranslation}
          className={`relative h-5 w-9 cursor-pointer rounded-full border-0 transition-colors ${
            settings.translationEnabled ? "bg-(--ms-primary)" : "bg-white/20"
          }`}
        >
          <span
            className={`absolute top-0.5 size-4 rounded-full bg-white transition-[left] ${
              settings.translationEnabled ? "left-4.5" : "left-0.5"
            }`}
          />
        </button>
        <select
          aria-label={t("ui.targetLanguage")}
          title={t("ui.targetLanguage")}
          value={settings.targetLanguage}
          disabled={!settings.translationEnabled}
          onChange={handleTargetLanguageChange}
          className={`h-8 cursor-pointer rounded-md bg-(--ms-overlay-control) text-xs text-white outline-none transition-colors field-sizing-content hover:bg-(--ms-overlay-control-hover) ${
            settings.translationEnabled
              ? "w-fit max-w-40 border border-(--ms-overlay-control-border) px-2.5 opacity-100"
              : "pointer-events-none w-0 min-w-0 border-0 p-0 opacity-0"
          }`}
        >
          {LANGUAGES.map((language) => (
            <option key={language.code} value={language.code} className="bg-(--ms-overlay-header) text-white">
              {language.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right: view tools */}
      <div className="flex shrink-0 items-center gap-2">
        <FontSizeControlContainer fontSize={settings.captionFontSize} />
        <div className="flex items-center gap-0.5">
          <button
            className={`${iconButtonClass} text-white ${isNotesOpen ? "bg-(--ms-overlay-control)" : ""}`}
            type="button"
            title={isNotesOpen ? t("ui.hideNotes") : t("ui.notes")}
            aria-label={isNotesOpen ? t("ui.hideNotes") : t("ui.notes")}
            aria-pressed={isNotesOpen}
            onClick={onToggleNotes}
          >
            <NotePencilIcon className="size-5" weight="regular" />
          </button>
          <CopyAllButton className={iconButtonClass} />
          <button
            className={`${iconButtonClass} text-white`}
            type="button"
            title={t("ui.settings")}
            aria-label={t("ui.settings")}
            onClick={handleOpenSettings}
          >
            <SlidersHorizontalIcon className="size-5" weight="regular" />
          </button>
          <button
            className={`${iconButtonClass} text-white`}
            type="button"
            title={t("ui.minimize")}
            aria-label={t("ui.minimize")}
            onClick={onMinimize}
          >
            <MinusIcon className="size-4" weight="regular" />
          </button>
        </div>
      </div>
    </div>
  );
};
