import { useState } from "react";
import type { Caption } from "@live/models";
import { downloadModelAndRetry } from "@live/model-download";
import { t } from "@live/i18n";

type Props = { caption: Caption };

type DownloadState =
  | { kind: "idle" }
  | { kind: "downloading"; percent: number }
  | { kind: "failed"; reason: string };

/** Inline "Download" action shown next to a missing-model error. */
export const ModelDownloadButton = ({ caption }: Props) => {
  const [state, setState] = useState<DownloadState>({ kind: "idle" });

  // Not awaited before the download starts: Chrome needs the click's gesture.
  const handleClick = () => {
    setState({ kind: "downloading", percent: 0 });
    downloadModelAndRetry(caption, (percent) => setState({ kind: "downloading", percent }))
      .then(() => setState({ kind: "idle" }))
      .catch((error: unknown) =>
        setState({ kind: "failed", reason: error instanceof Error ? error.message : String(error) })
      );
  };

  if (state.kind === "downloading") {
    return (
      <span className="text-xs text-(--ms-overlay-translation) not-italic">
        {t("settings.modelDownloading", { percent: state.percent })}
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 flex-wrap items-center gap-2 not-italic">
      <button
        type="button"
        onClick={handleClick}
        className="cursor-pointer rounded-md border-0 bg-(--ms-primary) px-2.5 py-0.5 text-xs font-medium text-white transition-colors hover:bg-(--ms-primary-hover)"
      >
        {t("settings.download")}
      </button>
      {state.kind === "failed" && (
        <span className="text-xs text-red-400">{t("settings.downloadFailed", { reason: state.reason })}</span>
      )}
    </span>
  );
};
