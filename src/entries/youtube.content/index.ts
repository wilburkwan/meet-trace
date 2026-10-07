import type { TranscriptRequest, TranscriptResponse } from "@/core/transcript";
import { readTranscript } from "./transcript-reader";

/** Answers the popup's "read transcript" request on YouTube video pages. */
export default defineContentScript({
  matches: ["https://www.youtube.com/*"],
  runAt: "document_idle",

  main() {
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
