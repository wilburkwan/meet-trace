import { useId } from "react";
import { MicrophoneIcon, MicrophoneSlashIcon } from "@phosphor-icons/react";
import type { RecordingStatus } from "@/core/recording";
import { useI18n } from "@/ui-kit/i18n-provider";
import { useMicSwitch } from "./use-mic-switch";

type Props = {
  status: RecordingStatus;
  onStatus: (status: RecordingStatus) => void;
};

/** iOS-style switch for recording the user's own microphone. */
export const MicSwitch = ({ status, onStatus }: Props) => {
  const { t } = useI18n();
  const labelId = useId();
  const { isOn, isReady, isBusy, isDenied, toggle } = useMicSwitch(status, onStatus);
  if (!isReady) return null;

  const Icon = isOn ? MicrophoneIcon : MicrophoneSlashIcon;
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2.5">
        <Icon className={`size-5 shrink-0 ${isOn ? "text-(--ms-positive)" : "text-(--ms-app-text-secondary)"}`} weight={isOn ? "fill" : "regular"} />
        <span id={labelId} className="flex-1 text-sm">{t("settings.recordMic")}</span>
        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-labelledby={labelId}
          disabled={isBusy}
          onClick={() => void toggle()}
          className={`relative h-6 w-10 shrink-0 cursor-pointer rounded-full transition-colors disabled:opacity-60 ${
            isOn ? "bg-(--ms-primary)" : "bg-(--ms-app-field-border)"
          }`}
        >
          <span className={`absolute top-0.5 left-0 size-5 rounded-full bg-white shadow-md transition-transform ${isOn ? "translate-x-4.5" : "translate-x-0.5"}`} />
        </button>
      </div>
      {isDenied && <p className="mt-1.5 text-xs leading-4.5 text-red-400">{t("popup.recordMicFailed")}</p>}
    </div>
  );
};
