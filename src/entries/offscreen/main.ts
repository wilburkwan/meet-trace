import { isOffscreenRequest, type OffscreenEvent, type OffscreenRequest, type OffscreenResponse } from "@/core/recording";
import { setMic, startRecording, stopRecording } from "./recorder";

const notifyCaptureEnded = () => {
  const event: OffscreenEvent = { action: "recCaptureEnded" };
  void chrome.runtime.sendMessage(event);
};

// Only records: the slices are saved to a file by the save-recording page,
// which can download its own blob URL (this hidden page cannot).
const handle = async (request: OffscreenRequest): Promise<OffscreenResponse> => {
  switch (request.type) {
    case "start":
      return {
        success: true,
        ...(await startRecording(request.streamId, request.withMic, request.dbName, notifyCaptureEnded)),
      };
    case "setMic":
      return { success: true, micOn: await setMic(request.enabled) };
    case "stop":
      return { success: true, details: await stopRecording() };
  }
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!isOffscreenRequest(message)) return false;
  handle(message)
    .then(sendResponse)
    .catch((error: unknown) => sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) }));
  return true;
});
