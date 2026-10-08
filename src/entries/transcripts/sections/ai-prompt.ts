import type { Translate, UiLocale } from "@/core/i18n";
import { formatFullDate, sessionTitle } from "../format";
import type { MeetingSession } from "./records";

const buildCaptionLines = (session: MeetingSession, t: Translate): string =>
  session.captions
    .map((caption) => {
      const lines = [`[${caption.time}] ${caption.speaker}: ${caption.text}`];
      if (caption.translation) {
        lines.push(`${t("history.promptTranslation")}: ${caption.translation}`);
      }
      return lines.join("\n");
    })
    .join("\n\n");

const buildChatLines = (session: MeetingSession): string =>
  (session.chatMessages ?? [])
    .map((message) => `[${message.time}] ${message.author}: ${message.text}`)
    .join("\n");

/** Summary prompt for an AI assistant, written in the UI language. */
export const buildSummaryPrompt = (session: MeetingSession, locale: UiLocale, t: Translate): string => {
  const none = t("history.promptNone");
  const formatTime = (timestamp?: number) =>
    timestamp ? formatFullDate(timestamp, locale) : t("history.promptNotRecorded");

  return t("history.summaryPrompt", {
    title: sessionTitle(session, t),
    code: session.meetingCode,
    started: formatTime(session.startTime),
    ended: formatTime(session.endTime),
    captions: buildCaptionLines(session, t) || none,
    chat: buildChatLines(session) || none,
    notes: session.notes?.trim() || none,
  });
};

/**
 * The whole meeting as plain text, in the same format as the in-meeting
 * "Copy entire transcript" button: captions, translations underneath, chat at the end.
 */
export const buildTranscriptText = (session: MeetingSession, locale: UiLocale, t: Translate): string => {
  const lines = [sessionTitle(session, t), formatFullDate(session.startTime, locale), ""];
  for (const caption of session.captions) {
    lines.push(`[${caption.time}] ${caption.speaker}: ${caption.text}`);
    if (caption.translation) lines.push(`    → ${caption.translation}`);
  }
  const chat = session.chatMessages ?? [];
  if (chat.length > 0) {
    lines.push("", `— ${t("overlay.chatHeading")} —`);
    for (const message of chat) lines.push(`[${message.time}] ${message.author}: ${message.text}`);
  }
  return lines.join("\n").trim();
};
