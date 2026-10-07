import { ChatsTeardropIcon, TimerIcon } from "@phosphor-icons/react";
import type { MessageKey } from "@/core/i18n";
import { useI18n } from "@/ui-kit/i18n-provider";
import { useStoredSetting } from "./use-stored-setting";

type Mode = "pause" | "speaker";

const MODES: readonly { id: Mode; icon: typeof TimerIcon; label: MessageKey; hint: MessageKey }[] = [
  { id: "pause", icon: TimerIcon, label: "settings.segmentModePause", hint: "settings.segmentModePauseHint" },
  { id: "speaker", icon: ChatsTeardropIcon, label: "settings.segmentModeSpeaker", hint: "settings.segmentModeSpeakerHint" },
];

/** Choose between pause-based segments and one block per speaker (like Google Meet). */
export const SegmentModePicker = () => {
  const { t } = useI18n();
  const [mode, setMode] = useStoredSetting<Mode>("segmentMode");
  if (mode === null) return null;

  return (
    <div className="mb-5">
      <span className="mb-2 block text-sm">{t("settings.segmentMode")}</span>
      <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
        {MODES.map(({ id, icon: Icon, label, hint }) => {
          const selected = id === mode;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setMode(id)}
              className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-left transition-colors ${
                selected
                  ? "border-(--ms-primary) bg-(--ms-app-canvas)"
                  : "border-(--ms-app-field-border) hover:border-(--ms-app-field-hover)"
              }`}
            >
              <Icon className={`mt-0.5 size-5 shrink-0 ${selected ? "text-(--ms-positive)" : ""}`} />
              <span>
                <span className="block text-sm font-medium">{t(label)}</span>
                <span className="mt-0.5 block text-xs leading-4.5 text-(--ms-app-text-secondary)">{t(hint)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
