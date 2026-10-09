import type { RecordingResponse } from "@/core/recording";
import { saveSettings } from "../prefs";
import { sendToOffscreen } from "./offscreen-client";
import { readStatus, writeStatus } from "./recording-status";

/**
 * Switches the user's mic in or out of the running recording (popup switch).
 * The choice also becomes the default for the next recording.
 */
export const setRecordingMic = async (enabled: boolean): Promise<RecordingResponse> => {
  const status = await readStatus();
  if (!status.recording) return { success: false, error: "Not recording" };
  const { micOn = false } = await sendToOffscreen("setMic", { enabled });
  const next = { ...status, micOn };
  await writeStatus(next);
  if (micOn === enabled) await saveSettings({ recordMicrophone: enabled });
  return { success: true, status: next, micFailed: enabled && !micOn };
};
