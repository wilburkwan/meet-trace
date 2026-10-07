import { ScissorsIcon } from "@phosphor-icons/react";
import { MAX_SEGMENT_PAUSE_MS, MIN_SEGMENT_PAUSE_MS } from "@/core/constants";
import { useI18n } from "@/ui-kit/i18n-provider";
import { SegmentModePicker } from "./segment-mode-picker";
import { useStoredSetting } from "./use-stored-setting";

const PRESET_SECONDS = [2, 3, 5, 8] as const;
const STEP_MS = 500;

/** Caption segmentation: how long a pause ends the current segment. */
export const SegmentSettings = () => {
  const { t } = useI18n();
  const [pauseMs, setPauseMs] = useStoredSetting<number>("segmentPauseMs");
  const seconds = (pauseMs ?? 0) / 1000;

  return (
    <div className="rounded-xl border border-(--ms-app-border) bg-(--ms-app-surface) p-6">
      <div className="mb-5 flex gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--ms-primary) text-white">
          <ScissorsIcon className="size-5.5" />
        </span>
        <div>
          <h2 className="mb-1 text-lg leading-5 font-medium text-(--ms-app-text-emphasis)">{t("settings.segmentTitle")}</h2>
          <p className="text-sm leading-5 text-(--ms-app-text-secondary)">{t("settings.segmentBody")}</p>
        </div>
      </div>

      <SegmentModePicker />

      {pauseMs !== null && (
        <>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm">{t("settings.segmentPause")}</span>
            <span className="text-lg font-semibold text-(--ms-positive) tabular-nums">
              {t("settings.segmentSeconds", { seconds: seconds.toFixed(1).replace(/\.0$/, "") })}
            </span>
          </div>
          <input
            type="range"
            min={MIN_SEGMENT_PAUSE_MS}
            max={MAX_SEGMENT_PAUSE_MS}
            step={STEP_MS}
            value={pauseMs}
            onChange={(event) => setPauseMs(Number(event.target.value))}
            aria-label={t("settings.segmentPause")}
            className="mb-3 w-full cursor-pointer accent-(--ms-primary)"
          />
          <div className="mb-3 flex flex-wrap gap-2">
            {PRESET_SECONDS.map((preset) => {
              const selected = pauseMs === preset * 1000;
              return (
                <button
                  key={preset}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setPauseMs(preset * 1000)}
                  className={`cursor-pointer rounded-full border px-3.5 py-1 text-sm transition-colors ${
                    selected
                      ? "border-(--ms-primary) bg-(--ms-primary) text-white"
                      : "border-(--ms-app-field-border) hover:border-(--ms-app-field-hover)"
                  }`}
                >
                  {t("settings.segmentSeconds", { seconds: preset })}
                </button>
              );
            })}
          </div>
          <p className="text-xs leading-4.5 text-(--ms-app-text-secondary)">{t("settings.segmentHint")}</p>
        </>
      )}
    </div>
  );
};
