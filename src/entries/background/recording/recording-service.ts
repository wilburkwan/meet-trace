import type { RecordingResponse, RecordingStatus } from "@/core/recording";
import { getSettings } from "../prefs";
import { closeOffscreen, ensureOffscreen, sendToOffscreen } from "./offscreen-client";
import { IDLE, readStatus, readStoredStatus, writeStatus } from "./recording-status";
import { openSaveTab, recordingDbName, saveLeftoverRecordings } from "./save-tabs";

/** Popup "Save" button: saves every unsaved recording except the one in progress. */
export const saveUnsavedRecordings = async (): Promise<RecordingResponse> => {
  const status = await readStatus();
  await saveLeftoverRecordings(true, status.recording ? status.dbName : undefined);
  return { success: true, status };
};

export const getRecordingStatus = async (): Promise<RecordingResponse> => ({ success: true, status: await readStatus() });

const begin = async (tabId: number): Promise<RecordingResponse> => {
  const tab = await chrome.tabs.get(tabId);
  const startedAt = Date.now();

  // A recording cut short by a crash (or a failed save) is saved first.
  await saveLeftoverRecordings();
  await ensureOffscreen();
  const dbName = recordingDbName(tab.url, startedAt);

  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tabId });
  const withMic = (await getSettings()).settings.recordMicrophone;
  const { micOn = false } = await sendToOffscreen("start", { streamId, withMic, dbName });
  const status: RecordingStatus = { recording: true, tabId, startedAt, micOn, dbName };
  await writeStatus(status);
  return { success: true, status, micFailed: withMic && !micOn };
};

export const startRecording = async (tabId: number): Promise<RecordingResponse> => {
  if ((await readStatus()).recording) return { success: false, error: "Already recording" };
  try {
    return await begin(tabId);
  } catch (error) {
    await closeOffscreen();
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

let stopping: Promise<RecordingResponse> | null = null;

const stop = async (): Promise<RecordingResponse> => {
  // Stored status: a recorder page Chrome closed still has slices to save.
  const status = await readStoredStatus();
  if (status.recording) {
    // Even if the recorder already stopped, whatever it wrote gets saved.
    const details = await sendToOffscreen("stop")
      .then((response) => response.details)
      .catch((error: unknown) => `stop: ${error instanceof Error ? error.message : String(error)}`);
    await writeStatus(IDLE);
    await closeOffscreen();
    await openSaveTab(status.dbName, true, details);
  }
  return { success: true, status: IDLE };
};

/** Stops and saves; concurrent calls (button + tab closed) share one save. */
export const stopRecording = (): Promise<RecordingResponse> => {
  stopping ??= stop().finally(() => {
    stopping = null;
  });
  return stopping;
};

/** Meeting ended or tab closed: stop only if it's the tab being recorded. */
export const stopRecordingForTab = async (tabId: number | undefined): Promise<RecordingResponse> => {
  const status = await readStatus();
  return status.recording && status.tabId === tabId ? stopRecording() : { success: true, status };
};
