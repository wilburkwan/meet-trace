import type { OffscreenRequest, OffscreenResponse } from "@/core/recording";

type OffscreenCommand = OffscreenRequest["type"];

const OFFSCREEN_PATH = "offscreen.html";

/** Opens the hidden recorder page (service workers can't capture audio). */
export const ensureOffscreen = async (): Promise<void> => {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_PATH,
    reasons: [chrome.offscreen.Reason.USER_MEDIA],
    justification: "Record meeting audio the user started from the toolbar.",
  });
};

export const closeOffscreen = async (): Promise<void> => {
  if (await chrome.offscreen.hasDocument()) await chrome.offscreen.closeDocument();
};

export const sendToOffscreen = async (
  type: OffscreenCommand,
  extra: Partial<{ streamId: string; withMic: boolean; dbName: string; enabled: boolean }> = {}
): Promise<Extract<OffscreenResponse, { success: true }>> => {
  const response: OffscreenResponse | undefined = await chrome.runtime.sendMessage({ ...extra, target: "offscreen", type });
  if (!response) throw new Error("Recorder did not respond");
  if (!response.success) throw new Error(response.error);
  return response;
};
