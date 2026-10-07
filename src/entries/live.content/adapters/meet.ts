import type { MeetingPlatform } from "./platform-contract";

const CAPTION_REGION_SELECTOR = '[role="region"].vNKgIf.UDinHf';
const CAPTION_ENTRY_SELECTOR = ".nMcdL";
const SPEAKER_SELECTOR = ".NWpY1d";
const TEXT_SELECTOR = ".ygicle";
const MEETING_ENDED_SELECTOR = '[data-call-ended="true"]';
const MEETING_TITLE_SELECTOR =
  '[role="heading"][aria-level="1"] [jsname="NeC6gb"]';
const MEETING_CODE_PATTERN = /\/([a-z]{3}-[a-z]{4}-[a-z]{3})/;
// Meet's CC button shows this Material icon (locale-independent) while captions are off.
const CAPTIONS_OFF_ICON = "closed_caption_off";
// Fallback: the button's accessible name in common languages.
const TURN_ON_CAPTIONS_LABEL =
  /turn on captions|開啟字幕|开启字幕|字幕をオン|자막 사용|activar subtítulos|activer les sous-titres|untertitel aktivieren|ativar legendas/i;

// "Meet - Weekly sync", "Google Meet – abc-defg-hij" -> the part after the prefix.
const TAB_TITLE_PREFIX = /^\s*(?:google\s+)?meet\s*[-–—:|]\s*/i;

/** Meeting name (or code) from the browser tab title; undefined while in the lobby. */
const titleFromTab = (tabTitle: string): string | undefined => {
  if (!TAB_TITLE_PREFIX.test(tabTitle)) return undefined;
  return tabTitle.replace(TAB_TITLE_PREFIX, "").trim() || undefined;
};

/** Finds Meet's "turn on captions" button, or null if captions are already on. */
const findCaptionsOffButton = (): HTMLButtonElement | null => {
  for (const icon of document.querySelectorAll<HTMLElement>("button i, button span")) {
    if (icon.textContent?.trim() === CAPTIONS_OFF_ICON) return icon.closest("button");
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>("button[aria-label]")) {
    const label = button.getAttribute("aria-label") ?? "";
    if (TURN_ON_CAPTIONS_LABEL.test(label) && button.getAttribute("aria-pressed") !== "true") {
      return button;
    }
  }
  return null;
};

/** Google Meet (meet.google.com). */
export const meetPlatform: MeetingPlatform = {
  id: "meet",
  name: "Google Meet",

  isMeetingPage: () =>
    /\/[a-z]{3}-[a-z]{4}-[a-z]{3}($|\?)/.test(window.location.pathname) ||
    window.location.pathname === "/new",

  // Meet URLs are per-meeting, so the overlay can mount right away.
  waitForCall: () => Promise.resolve(),

  findCaptionRegion: () =>
    document.querySelector<HTMLElement>(CAPTION_REGION_SELECTOR),

  getCaptionEntries: (region) =>
    Array.from(region.querySelectorAll(CAPTION_ENTRY_SELECTOR)),

  readCaptionEntry: (entry) => {
    const textEl = entry.querySelector(TEXT_SELECTOR);
    if (!textEl) return null;
    return {
      speaker: entry.querySelector(SPEAKER_SELECTOR)?.textContent?.trim() || "Unknown",
      text: textEl.textContent?.trim() ?? "",
    };
  },

  // Uses Meet's locale-independent post-call state marker.
  isMeetingEnded: () => Boolean(document.querySelector(MEETING_ENDED_SELECTOR)),

  getMeetingCode: () =>
    window.location.pathname.match(MEETING_CODE_PATTERN)?.[1] ?? "unknown",

  getMeetingTitle: () => {
    // The tab title is "Meet - <meeting name or code>".
    const fromTab = titleFromTab(document.title);
    if (fromTab) return fromTab;

    const title = document
      .querySelector<HTMLElement>(MEETING_TITLE_SELECTOR)
      ?.textContent?.trim();
    if (title) return title;

    // Keep compatibility with older Google Meet layouts.
    const legacy = document.querySelector<HTMLElement>("[data-meeting-title]");
    return legacy?.dataset.meetingTitle?.trim() || undefined;
  },

  supportsChatHistory: true,
  captionsHintKey: "overlay.hintMeet",

  enableCaptions: () => {
    const button = findCaptionsOffButton();
    if (!button || button.disabled) return false;
    button.click();
    return true;
  },
};
