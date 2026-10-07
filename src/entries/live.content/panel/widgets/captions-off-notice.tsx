import { ClosedCaptioningIcon, SpinnerGapIcon, XIcon } from "@phosphor-icons/react";
import { getPlatform } from "@live/adapters";
import { getAutoCaptionsStatus, retryAutoCaptions } from "@live/auto-captions";
import { t } from "@live/i18n";

/** Prominent warning shown until the meeting's captions (CC) are turned on. */
export const CaptionsOffNotice = () => {
  const platform = getPlatform();
  const status = getAutoCaptionsStatus();
  const isBusy = status.kind === "trying" || status.kind === "waiting-for-call";

  const hint =
    status.kind === "trying"
      ? t("overlay.autoTrying", { count: status.attempt })
      : status.kind === "waiting-for-call"
        ? t("overlay.autoWaitingCall")
        : status.kind === "gave-up"
          ? `${t("overlay.autoGaveUp")} ${t(platform.captionsHintKey)}`
          : t(platform.captionsHintKey);

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-2 text-center">
      <span className="relative flex size-16 items-center justify-center rounded-2xl bg-white/8">
        <ClosedCaptioningIcon className="size-10 text-white/80" weight="regular" />
        <span className="absolute -right-1.5 -bottom-1.5 flex size-7 items-center justify-center rounded-full bg-(--ms-danger) ring-4 ring-(--ms-overlay-bg)">
          <XIcon className="size-4 text-white" weight="bold" />
        </span>
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] leading-5 font-semibold text-white">{t("overlay.ccOffTitle")}</p>
        <p className="text-xs leading-4.5 text-white/75">{t("overlay.ccOffBody", { platform: platform.name })}</p>
      </div>
      <p className="flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-2 text-xs leading-4.5 text-white">
        {isBusy && <SpinnerGapIcon className="size-3.5 shrink-0 animate-spin" />}
        {hint}
      </p>
      {platform.enableCaptions && !isBusy && (
        <button
          type="button"
          onClick={retryAutoCaptions}
          className="cursor-pointer rounded-lg bg-(--ms-primary) px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-(--ms-primary-hover)"
        >
          {t("overlay.turnOnNow")}
        </button>
      )}
    </div>
  );
};
