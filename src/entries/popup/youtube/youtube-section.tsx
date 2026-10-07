import {
  CopyIcon,
  DownloadSimpleIcon,
  SparkleIcon,
  SpinnerGapIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";
import { formatTimestamp } from "@/core/transcript";
import { useI18n } from "@/ui-kit/i18n-provider";
import { useYouTubeTranscript } from "./use-youtube-transcript";

const actionClass =
  "flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-(--ms-secondary) px-2 text-xs font-medium transition-colors hover:bg-(--ms-secondary-hover)";

/** Popup card shown on YouTube videos: read, preview, copy and download the transcript. */
export const YouTubeSection = () => {
  const { t } = useI18n();
  const { state, copied, read, copy, exportAs } = useYouTubeTranscript();
  if (state.kind === "hidden") return null;

  const lines = state.kind === "ready" ? state.transcript.lines : [];
  const withHours = (lines.at(-1)?.start ?? 0) >= 3600;

  return (
    <section className="rounded-lg bg-(--ms-app-surface) p-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <YoutubeLogoIcon className="size-6 shrink-0 text-red-500" weight="fill" />
        <h2 className="flex-1 text-lg leading-5 font-medium">{t("yt.title")}</h2>
        {state.kind === "ready" && (
          <span className="text-xs text-(--ms-app-text-secondary)">{t("yt.count", { count: lines.length })}</span>
        )}
      </div>

      {state.kind === "ready" ? (
        <>
          <ol className="mb-3 max-h-52 space-y-1 overflow-y-auto rounded-md bg-(--ms-app-canvas) p-2.5 text-xs leading-4.5">
            {lines.map((line, index) => (
              <li key={`${line.start}-${index}`} className="flex gap-2">
                <time className="shrink-0 text-(--ms-positive) tabular-nums">{formatTimestamp(line.start, withHours)}</time>
                <span>{line.text}</span>
              </li>
            ))}
          </ol>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={actionClass} onClick={() => void copy("text")}>
              <CopyIcon className="size-4" /> {copied === "text" ? t("yt.copied") : t("yt.copy")}
            </button>
            <button type="button" className={actionClass} onClick={() => void copy("prompt")}>
              <SparkleIcon className="size-4" /> {copied === "prompt" ? t("yt.copied") : t("yt.prompt")}
            </button>
            <button type="button" className={actionClass} onClick={() => exportAs("txt")}>
              <DownloadSimpleIcon className="size-4" /> {t("yt.txt")}
            </button>
            <button type="button" className={actionClass} onClick={() => exportAs("srt")}>
              <DownloadSimpleIcon className="size-4" /> {t("yt.srt")}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-3 text-xs leading-4.5 text-(--ms-app-text-secondary)">
            {state.kind === "error" ? state.message : t("yt.hint")}
          </p>
          <button
            type="button"
            disabled={state.kind === "loading"}
            onClick={() => void read()}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-(--ms-primary) text-sm font-medium text-white transition-colors hover:bg-(--ms-primary-hover) disabled:opacity-60"
          >
            {state.kind === "loading" && <SpinnerGapIcon className="size-4 animate-spin" />}
            {state.kind === "loading" ? t("yt.loading") : t("yt.load")}
          </button>
        </>
      )}
    </section>
  );
};
