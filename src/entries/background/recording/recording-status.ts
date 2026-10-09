import type { RecordingStatus } from "@/core/recording";

const STATUS_KEY = "recordingStatus";
export const IDLE: RecordingStatus = { recording: false };

const isActiveStatus = (value: unknown): value is Extract<RecordingStatus, { recording: true }> =>
  typeof value === "object" && value !== null && "recording" in value && value.recording === true;

// Session storage outlives the service worker, which Chrome stops while idle.
export const readStoredStatus = async (): Promise<RecordingStatus> => {
  const status: unknown = (await chrome.storage.session.get(STATUS_KEY))[STATUS_KEY];
  return isActiveStatus(status) ? status : IDLE;
};

/** Recording only while the recorder page is still alive. */
export const readStatus = async (): Promise<RecordingStatus> => {
  const status = await readStoredStatus();
  return status.recording && (await chrome.offscreen.hasDocument()) ? status : IDLE;
};

/** Saves the status and updates the toolbar badge. */
export const writeStatus = async (status: RecordingStatus): Promise<void> => {
  await chrome.storage.session.set({ [STATUS_KEY]: status });
  await chrome.action.setBadgeText({ text: status.recording ? "REC" : "" });
  if (status.recording) await chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
};
