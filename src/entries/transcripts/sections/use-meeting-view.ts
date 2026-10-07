import { appToast } from "@/ui-kit/notify";
import { useI18n } from "@/ui-kit/i18n-provider";
import { formatClock, formatFullDate, formatDuration, sessionTitle } from "../format";
import { exportMeetingSession, type ExportFormat } from "./file-export";
import { buildSummaryPrompt } from "./ai-prompt";
import type { MeetingSession } from "./records";

/** Derived labels and actions (export, summary) for one meeting. */
export const useSessionDetail = (session: MeetingSession) => {
  const { locale, t } = useI18n();

  const duration = formatDuration(session.startTime, session.endTime, locale);
  const timeRange = session.endTime
    ? `${formatFullDate(session.startTime, locale)} – ${formatClock(session.endTime, locale)}`
    : formatFullDate(session.startTime, locale);

  const hasContent =
    session.captions.length > 0 ||
    (session.chatMessages?.length ?? 0) > 0 ||
    Boolean(session.notes?.trim());

  const exportAs = (format: ExportFormat) => exportMeetingSession(session, "both", format);

  const copySummaryPrompt = () =>
    void navigator.clipboard
      .writeText(buildSummaryPrompt(session))
      .then(() => appToast.success(t("history.toastPromptCopied")))
      .catch(() => appToast.error(t("history.toastCopyFailed")));

  const openChatGpt = () => {
    const url = new URL("https://chatgpt.com/");
    url.searchParams.set("q", buildSummaryPrompt(session));
    void chrome.tabs.create({ url: url.toString() }).catch(() => appToast.error(t("history.toastOpenFailed")));
  };

  return {
    title: sessionTitle(session, t),
    subtitle: duration ? `${timeRange} · ${duration}` : timeRange,
    hasContent,
    exportAs,
    copySummaryPrompt,
    openChatGpt,
  };
};
