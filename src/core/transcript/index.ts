/** One line of a video transcript. */
export type TranscriptLine = {
  /** Start time in seconds. */
  start: number;
  text: string;
};

export type VideoTranscript = {
  title: string;
  url: string;
  lines: TranscriptLine[];
};

/** Messages between the popup and the YouTube content script. */
export type TranscriptRequest = { action: "ytReadTranscript" };
export type TranscriptResponse =
  | { ok: true; transcript: VideoTranscript }
  | { ok: false; reason: "not-video" | "no-transcript" | "timeout" | "error"; detail?: string };

/** Parses "1:02:03", "12:34" or "0:05" into seconds; null when not a timestamp. */
export const parseTimestamp = (value: string): number | null => {
  const match = value.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const [, hours = "0", minutes, seconds] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
};

const pad = (value: number, length = 2) => String(value).padStart(length, "0");

/** "01:02:03" (or "02:03" for videos under an hour). */
export const formatTimestamp = (seconds: number, withHours = seconds >= 3600): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return withHours ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

/** Plain text, one "[mm:ss] text" line per caption, with a title header. */
export const toPlainText = ({ title, url, lines }: VideoTranscript): string => {
  const withHours = (lines.at(-1)?.start ?? 0) >= 3600;
  const body = lines.map((line) => `[${formatTimestamp(line.start, withHours)}] ${line.text}`);
  return [title, url, "", ...body].join("\n");
};

const srtTime = (seconds: number): string => `${formatTimestamp(seconds, true)},000`;

// A subtitle stays up until the next one, but never longer than this.
const MAX_SUBTITLE_SECONDS = 10;

/** SubRip subtitles; each line ends when the next one starts (capped). */
export const toSrt = ({ lines }: VideoTranscript): string =>
  lines
    .map((line, index) => {
      const next = lines[index + 1]?.start ?? Infinity;
      const end = Math.max(Math.min(next, line.start + MAX_SUBTITLE_SECONDS), line.start + 1);
      return `${index + 1}\n${srtTime(line.start)} --> ${srtTime(end)}\n${line.text}\n`;
    })
    .join("\n");

/** Safe file name from a video title. */
export const toFileName = (title: string, extension: string): string =>
  `${title.replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 80) || "transcript"}.${extension}`;
