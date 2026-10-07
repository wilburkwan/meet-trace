import type { MessageKey } from "@/core/i18n";

/** A caption entry read from the meeting page. */
export type CaptionEntryContent = {
  speaker: string;
  text: string;
};

/**
 * Everything that depends on the meeting platform's DOM. The rest of the
 * content script (overlay, translation, history) is platform-agnostic.
 */
export type MeetingPlatform = {
  id: "meet" | "teams";
  /** Display name used in overlay hints. */
  name: string;
  /** Whether the content script should run on the current URL. */
  isMeetingPage: () => boolean;
  /** Resolves once the page is in a call, so the overlay can be mounted. */
  waitForCall: () => Promise<void>;
  findCaptionRegion: () => HTMLElement | null;
  getCaptionEntries: (region: HTMLElement) => Element[];
  readCaptionEntry: (entry: Element) => CaptionEntryContent | null;
  isMeetingEnded: () => boolean;
  getMeetingCode: () => string;
  getMeetingTitle: () => string | undefined;
  /** Meet chat capture relies on Meet-only DOM. */
  supportsChatHistory: boolean;
  /** How to turn on captions, shown while waiting for captions. */
  captionsHintKey: MessageKey;
  /**
   * Clicks the platform's "turn on captions" control when captions are off.
   * Returns true if a click was made. Absent when not supported.
   */
  enableCaptions?: () => boolean;
  /** True when the platform's caption UI is visible, even before anyone speaks. */
  captionsShowing?: () => boolean;
};
