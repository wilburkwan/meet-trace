/** Recording state kept by the background (in session storage, so it outlives the worker). */
export type RecordingStatus =
  | { recording: false }
  | { recording: true; tabId: number; startedAt: number; micOn: boolean; dbName: string };

/** Popup / content script → background. */
export type RecordingRequest =
  | { action: "recStatus" }
  | { action: "recStart"; tabId: number }
  | { action: "recStop" }
  | { action: "recMeetingEnded" }
  | { action: "recSetMic"; enabled: boolean }
  | { action: "recSaveLeftovers" };

export type RecordingResponse =
  | { success: true; status: RecordingStatus; micFailed?: boolean }
  | { success: false; error: string };

/** Background → offscreen document. */
export type OffscreenRequest =
  | { target: "offscreen"; type: "start"; streamId: string; withMic: boolean; dbName: string }
  | { target: "offscreen"; type: "stop" }
  | { target: "offscreen"; type: "setMic"; enabled: boolean };

export type OffscreenResponse =
  | { success: true; micOn?: boolean; details?: string }
  | { success: false; error: string };

/** Offscreen → background: the captured tab went away (closed or navigated). */
export type OffscreenEvent = { action: "recCaptureEnded" };

/** Opus is close to the original sound at this bitrate: about 43 MB per hour. */
export const RECORDING_BITS_PER_SECOND = 96_000;
/** Each slice is written to disk, so a long meeting never piles up in memory. */
export const RECORDING_SLICE_MS = 10_000;
/** Folder inside the user's Downloads folder. */
export const RECORDING_FOLDER = "Meet Trace";

// Each recording has its own database named after its file, so leftovers
// from a crash can be saved later under the right name.
export const RECORDING_DB_PREFIX = "meet-trace-rec:";
/** Database used by 1.3.0 builds before recordings were saved from a page. */
export const LEGACY_RECORDING_DB = "meet-trace-recording";

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * "2026-10-10_14-05-33": sorts by date in Finder / Explorer. Seconds keep two
 * recordings made within one minute apart (each has its own database).
 */
export const fileStamp = (time: number): string => {
  const date = new Date(time);
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `${day}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
};

/** Path under Downloads (without extension) for a recording database. */
export const recordingFilename = (dbName: string): string =>
  dbName.startsWith(RECORDING_DB_PREFIX)
    ? dbName.slice(RECORDING_DB_PREFIX.length)
    : `${RECORDING_FOLDER}/Recovered_${fileStamp(Date.now())}`;

export const isRecordingDb = (name: string | undefined): name is string =>
  Boolean(name && (name.startsWith(RECORDING_DB_PREFIX) || name === LEGACY_RECORDING_DB));

export const isOffscreenRequest = (message: unknown): message is OffscreenRequest =>
  typeof message === "object" && message !== null && "target" in message && message.target === "offscreen";
