import type { MeetingSession } from "./sections";

const BACKUP_FORMAT = "meettrace-history-backup";
// Backups exported before the rename can still be imported.
const LEGACY_BACKUP_FORMATS = ["meetsubtitle-history-backup"];

const isKnownFormat = (format: unknown): boolean =>
  format === BACKUP_FORMAT ||
  (typeof format === "string" && LEGACY_BACKUP_FORMATS.includes(format));

export const downloadHistoryBackup = (sessions: MeetingSession[]): void => {
  const exportedAt = new Date();
  const backup = {
    format: BACKUP_FORMAT,
    schemaVersion: 1,
    exportedAt: exportedAt.toISOString(),
    sessionCount: sessions.length,
    captionCount: sessions.reduce(
      (total, session) => total + session.captions.length,
      0
    ),
    chatMessageCount: sessions.reduce(
      (total, session) => total + (session.chatMessages?.length ?? 0),
      0,
    ),
    sessions,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `meettrace-backup-${exportedAt
    .toISOString()
    .replaceAll(":", "-")}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const parseHistoryBackup = async (
  file: File
): Promise<MeetingSession[]> => {
  const parsed: unknown = JSON.parse(await file.text());
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("format" in parsed) ||
    !isKnownFormat(parsed.format) ||
    !("schemaVersion" in parsed) ||
    parsed.schemaVersion !== 1 ||
    !("sessions" in parsed) ||
    !Array.isArray(parsed.sessions)
  ) {
    throw new Error("Invalid Meet Trace backup file");
  }
  return parsed.sessions;
};
