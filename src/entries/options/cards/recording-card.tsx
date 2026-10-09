import { useId, useState } from "react";
import { MicrophoneIcon } from "@phosphor-icons/react";
import { useI18n } from "@/ui-kit/i18n-provider";
import { useStoredSetting } from "./use-stored-setting";

/** Asks Chrome for microphone access once; the recorder page reuses the grant. */
const requestMicrophone = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
};

/** Recording: where files go, and whether the user's own voice is included. */
export const RecordingCard = () => {
  const { t } = useI18n();
  const switchId = useId();
  const [recordMic, setRecordMic] = useStoredSetting<boolean>("recordMicrophone");
  const [isDenied, setIsDenied] = useState(false);

  const toggle = async () => {
    if (recordMic) return setRecordMic(false);
    const allowed = await requestMicrophone();
    setIsDenied(!allowed);
    if (allowed) setRecordMic(true);
  };

  return (
    <div className="rounded-xl border border-(--ms-app-border) bg-(--ms-app-surface) p-6">
      <div className="mb-5 flex gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--ms-primary) text-white">
          <MicrophoneIcon className="size-5.5" />
        </span>
        <div>
          <h2 className="mb-1 text-lg leading-5 font-medium text-(--ms-app-text-emphasis)">{t("settings.recordingTitle")}</h2>
          <p className="text-sm leading-5 text-(--ms-app-text-secondary)">{t("settings.recordingBody")}</p>
        </div>
      </div>

      {recordMic !== null && (
        <div className="flex items-center gap-3 rounded-lg bg-(--ms-app-canvas) px-4 py-3">
          <div className="min-w-0 flex-1">
            <label htmlFor={switchId} className="block cursor-pointer text-sm">{t("settings.recordMic")}</label>
            <p className={`text-xs leading-4.5 ${isDenied ? "text-red-400" : "text-(--ms-app-text-secondary)"}`}>
              {isDenied ? t("settings.recordMicDenied") : t("settings.recordMicHint")}
            </p>
          </div>
          <button
            id={switchId}
            type="button"
            role="switch"
            aria-checked={recordMic}
            onClick={() => void toggle()}
            className={`relative h-7.5 w-12.5 shrink-0 cursor-pointer rounded-full transition-colors ${
              recordMic ? "bg-(--ms-primary)" : "bg-(--ms-app-field-border)"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0 size-6.5 rounded-full bg-white shadow-md transition-transform ${
                recordMic ? "translate-x-5.5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
};
