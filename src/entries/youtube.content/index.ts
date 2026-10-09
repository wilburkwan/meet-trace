import type { TranscriptRequest, TranscriptResponse } from "@/core/transcript";
import { startTranscriptButtons } from "./transcript-buttons";
import { readTranscript } from "./transcript-reader";

/** Answers the popup's "read transcript" request and injects quick copy buttons on YouTube video pages. */
export default defineContentScript({
  matches: ["https://*.youtube.com/*", "https://youtube.com/*"],
  runAt: "document_idle",

  main() {
    startTranscriptButtons();

    chrome.runtime.onMessage.addListener((message: TranscriptRequest, _sender, sendResponse) => {
      if (message?.action !== "ytReadTranscript") return false;
      readTranscript()
        .then(sendResponse)
        .catch((error: unknown) =>
          sendResponse({ ok: false, reason: "error", detail: String(error) } satisfies TranscriptResponse)
        );
      return true; // keep the channel open for the async answer
    });
  },
});
