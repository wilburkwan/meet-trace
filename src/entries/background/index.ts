import { isOffscreenRequest } from "@/core/recording";
import { getSettings, saveSettings } from "./prefs";
import {
  getMeetingHistory,
  saveMeetingSession,
  deleteMeetingSession,
  updateMeetingSession,
  clearMeetingHistory,
  importMeetingHistory,
  getStorageUsage,
} from "./session-store";
import {
  getRecordingStatus,
  saveUnsavedRecordings,
  startRecording,
  stopRecording,
  stopRecordingForTab,
} from "./recording/recording-service";
import { saveLeftoverRecordings } from "./recording/save-tabs";
import { setRecordingMic } from "./recording/recording-mic";

export default defineBackground(() => {
  // A reload or browser restart ends any recording: save what was captured.
  chrome.runtime.onInstalled.addListener(() => void saveLeftoverRecordings());
  chrome.runtime.onStartup.addListener(() => void saveLeftoverRecordings());

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Requests for the offscreen recorder are answered there, not here.
    if (isOffscreenRequest(message)) return false;
    handleMessage(message, sender)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ success: false, error: String(error) });
      });

    return true;
  });
});

async function handleMessage(
  message: Record<string, unknown>,
  sender: chrome.runtime.MessageSender
): Promise<unknown> {
  switch (message.action) {
    case "getSettings":
      return getSettings();

    case "saveSettings":
      return saveSettings(message.settings as Parameters<typeof saveSettings>[0]);

    case "openOptions":
      chrome.runtime.openOptionsPage();
      return { success: true };

    case "getMeetingHistory":
      return getMeetingHistory();

    case "saveMeetingSession":
      return saveMeetingSession(message.session as Parameters<typeof saveMeetingSession>[0]);

    case "deleteMeetingSession":
      return deleteMeetingSession(message.sessionId as string);

    case "updateMeetingSession":
      return updateMeetingSession(
        message.sessionId as string,
        message.updates as Parameters<typeof updateMeetingSession>[1]
      );

    case "clearMeetingHistory":
      return clearMeetingHistory();

    case "importMeetingHistory":
      return importMeetingHistory(
        message.sessions as Parameters<typeof importMeetingHistory>[0]
      );

    case "getStorageUsage":
      return getStorageUsage();

    case "recStatus":
      return getRecordingStatus();

    case "recStart":
      return startRecording(message.tabId as number);

    case "recStop":
    case "recCaptureEnded":
      return stopRecording();

    case "recSetMic":
      return setRecordingMic(message.enabled === true);

    case "recSaveLeftovers":
      return saveUnsavedRecordings();

    case "recMeetingEnded":
      return stopRecordingForTab(sender.tab?.id);

    default:
      return { success: false, error: "Unknown action" };
  }
}
