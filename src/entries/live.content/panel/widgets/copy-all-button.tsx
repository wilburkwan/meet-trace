import { useState } from "react";
import { CheckIcon, CopySimpleIcon } from "@phosphor-icons/react";
import { buildTranscriptText, getCapturedCaptionCount } from "@live/session-recorder";
import { t } from "@live/i18n";
import { copyToClipboard } from "@live/utils";

const FEEDBACK_MS = 2000;

type Props = { className: string };

/** Header icon button that copies every caption of this meeting (plus chat). */
export const CopyAllButton = ({ className }: Props) => {
  const [result, setResult] = useState<"copied" | "failed" | null>(null);
  const count = getCapturedCaptionCount();

  const copyAll = async () => {
    const ok = await copyToClipboard(buildTranscriptText(t("overlay.chatHeading")));
    setResult(ok ? "copied" : "failed");
    setTimeout(() => setResult(null), FEEDBACK_MS);
  };

  const label =
    result === "copied"
      ? t("overlay.copyAllDone", { count })
      : result === "failed"
        ? t("overlay.copyAllFailed")
        : `${t("overlay.copyAll")} (${count})`;

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={count === 0}
      onClick={() => void copyAll()}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-35 ${
        result === "copied" ? "text-emerald-400" : result === "failed" ? "text-red-400" : "text-white"
      }`}
    >
      {result === "copied" ? <CheckIcon className="size-5" weight="bold" /> : <CopySimpleIcon className="size-5" />}
    </button>
  );
};
