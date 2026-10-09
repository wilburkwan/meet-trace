import { RecordIcon, StopIcon } from "@phosphor-icons/react";
import { useI18n } from "@/ui-kit/i18n-provider";
import { MicSwitch } from "./mic-switch";
import { UnsavedNotice } from "./unsaved-notice";
import { useRecording } from "./use-recording";

type Props = { tabId: number };

const pad = (value: number) => String(value).padStart(2, "0");

const formatElapsed = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 3600)}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
};

const buttonClass =
  "flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-default disabled:opacity-60";

/** Mic switch plus record / stop button for a tab's audio. */
export const RecordingControl = ({ tabId }: Props) => {
  const { t } = useI18n();
  const { status, setStatus, phase, error, micFailed, elapsedMs, isThisTab, start, stop } = useRecording(tabId);
  if (!status) return null;

  const hint = !status.recording
    ? t("popup.recordHint")
    : micFailed
      ? t("popup.recordMicFailed")
      : !isThisTab
        ? t("popup.recordingOtherTab")
        : t("popup.recordHint");

  return (
    <div>
      <UnsavedNotice status={status} />
      {(!status.recording || isThisTab) && <MicSwitch status={status} onStatus={setStatus} />}
      {status.recording ? (
        <>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium tabular-nums">
            <span className="size-2.5 animate-pulse rounded-full bg-red-500" />
            {t("popup.recording", { time: formatElapsed(elapsedMs) })}
          </p>
          <button type="button" disabled={phase !== "idle"} onClick={() => void stop()} className={`${buttonClass} bg-red-500 text-white hover:bg-red-600`}>
            <StopIcon className="size-4" weight="fill" />
            {phase === "saving" ? t("popup.recordSaving") : t("popup.recordStop")}
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={phase !== "idle"}
          onClick={() => void start()}
          className={`${buttonClass} border border-(--ms-app-field-border) hover:border-(--ms-app-field-hover)`}
        >
          <RecordIcon className="size-4 text-red-500" weight="fill" />
          {t("popup.recordStart")}
        </button>
      )}
      <p className="mt-2 text-xs leading-4.5 text-(--ms-app-text-secondary)">{hint}</p>
      {error && <p className="mt-1 text-xs leading-4.5 text-red-400">{t("popup.recordFailed", { reason: error })}</p>}
    </div>
  );
};
