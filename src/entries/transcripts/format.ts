import type { Translate, UiLocale } from "@/core/i18n";
import type { MeetingSession } from "./sections/records";

const isSameDay = (a: Date, b: Date): boolean => a.toDateString() === b.toDateString();

/** "Today" / "Yesterday" / "Mon, Oct 6" in the UI language. */
export const formatDayLabel = (timestamp: number, locale: UiLocale, t: Translate): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, today)) return t("history.today");
  if (isSameDay(date, yesterday)) return t("history.yesterday");
  return date.toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
};

export const formatClock = (timestamp: number, locale: UiLocale): string =>
  new Date(timestamp).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatFullDate = (timestamp: number, locale: UiLocale): string =>
  new Date(timestamp).toLocaleString(locale, {
    dateStyle: "full",
    timeStyle: "short",
  });

/** Compact, localized duration, e.g. "1 h 20 min" / "1 小時 20 分鐘". */
export const formatDuration = (start: number, end: number | undefined, locale: UiLocale): string => {
  if (!end || end <= start) return "";
  const minutes = Math.max(1, Math.round((end - start) / 60000));
  const hours = Math.floor(minutes / 60);
  const unit = (value: number, name: "hour" | "minute") =>
    new Intl.NumberFormat(locale, { style: "unit", unit: name, unitDisplay: "short" }).format(value);
  const rest = minutes % 60;
  if (!hours) return unit(rest, "minute");
  return rest ? `${unit(hours, "hour")} ${unit(rest, "minute")}` : unit(hours, "hour");
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const sessionTitle = (session: MeetingSession, t: Translate): string =>
  session.title || t("history.untitled", { code: session.meetingCode });
