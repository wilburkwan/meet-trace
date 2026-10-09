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

/** Parses "1:02:03", "12:34" or "0:05" into seconds; handles hidden unicode formatting chars and Chinese duration formats; null when not a timestamp. */
export const parseTimestamp = (value: string): number | null => {
  if (!value) return null;
  const cleaned = value.replace(/[\u200e\u200f\u202a-\u202e\ufeff]/g, "").trim();
  const match = cleaned.match(/^(?:(\d+):)?(\d{1,2}):(\d{2})$/);
  if (match) {
    const [, hours = "0", minutes, seconds] = match;
    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  }
  const zhMatch = cleaned.match(/^(?:(\d+)\s*小時)?\s*(?:(\d+)\s*分(?:鐘)?)?\s*(\d+)\s*秒$/);
  if (zhMatch && (zhMatch[1] || zhMatch[2] || zhMatch[3])) {
    const h = Number(zhMatch[1] || 0);
    const m = Number(zhMatch[2] || 0);
    const s = Number(zhMatch[3] || 0);
    return h * 3600 + m * 60 + s;
  }
  return null;
};

const pad = (value: number, length = 2) => String(value).padStart(length, "0");

/** "01:02:03" (or "02:03" for videos under an hour). */
export const formatTimestamp = (seconds: number, withHours = seconds >= 3600): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return withHours ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

/** Strips leading timestamps or bracketed timestamps (e.g. "0:15", "[00:15]", "(01:02:15)", "3 分鐘 40 秒") from text. */
export const stripLeadingTimestamp = (text: string): string => {
  let cleaned = text.replace(/[\u200e\u200f\u202a-\u202e\ufeff]/g, "").trim();
  const timestampRegex =
    /^[\[(（【]?\s*(?:(?:\d+:)+\d{2}|(?:\d+\s*小時\s*)?(?:\d+\s*分(?:鐘)?\s*)?\d+\s*秒|(?:\d+\s*小時\s*)?\d+\s*分(?:鐘)?|\d+\s*小時)\s*[\])）】]?\s*[-–—:]?\s*/;

  while (cleaned && timestampRegex.test(cleaned)) {
    const next = cleaned.replace(timestampRegex, "").trim();
    if (next === cleaned) break;
    cleaned = next;
  }
  return cleaned;
};

/** Plain text without timestamps, one line per caption, with a title header. */
export const toPlainText = ({ title, url, lines }: VideoTranscript): string => {
  const body = lines.map((line) => stripLeadingTimestamp(line.text)).filter(Boolean);
  return [title, url, "", ...body].join("\n");
};

/** Formats transcript with timestamps and title header for AI translation prompts. */
export const toTranscriptWithTimestamps = ({ title, url, lines }: VideoTranscript): string => {
  const withHours = (lines.at(-1)?.start ?? 0) >= 3600;
  const body = lines.map((line) => `[${formatTimestamp(line.start, withHours)}] ${stripLeadingTimestamp(line.text)}`);
  return [title, url, "", ...body].join("\n");
};

/** Formats transcript lines with timestamps ("00:15 text", or "01:00:15 text" if over an hour), one line per segment. */
export const toLinesWithTimestamps = (lines: TranscriptLine[]): string => {
  const withHours = (lines.at(-1)?.start ?? 0) >= 3600;
  return lines
    .map((line) => `${formatTimestamp(line.start, withHours)} ${stripLeadingTimestamp(line.text)}`)
    .join("\n");
};

/** Formats transcript lines as pure text without timestamps, one line per segment. */
export const toLinesOnly = (lines: TranscriptLine[]): string =>
  lines
    .map((line) => stripLeadingTimestamp(line.text))
    .filter(Boolean)
    .join("\n");


/** Finds the index of the active transcript segment corresponding to the current video time. */
export const findActiveSegmentIndex = (lines: TranscriptLine[], currentTime: number): number => {
  if (lines.length === 0) return -1;
  let low = 0;
  let high = lines.length - 1;
  let best = -1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lines[mid].start <= currentTime) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return best;
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
      return `${index + 1}\n${srtTime(line.start)} --> ${srtTime(end)}\n${stripLeadingTimestamp(line.text)}\n`;
    })
    .join("\n");

/** Safe file name from a video title. */
export const toFileName = (title: string, extension: string): string =>
  `${title.replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 80) || "transcript"}.${extension}`;
