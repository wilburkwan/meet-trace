import { enableTeamsCaptions, teamsCallToolbarVisible, teamsCaptionsShowing } from "./teams-captions";
import type { MeetingPlatform } from "./platform-contract";

// Teams (new web client) live captions, e.g.
// .fui-ChatMessageCompact > [data-tid="author"] + [data-tid="closed-caption-text"]
const CAPTION_TEXT_SELECTOR = '[data-tid="closed-caption-text"]';
const AUTHOR_SELECTOR = '[data-tid="author"]';
const CAPTION_ENTRY_SELECTOR = ".fui-ChatMessageCompact";
// Known wrappers first; otherwise derive the region from the virtual list.
const CAPTION_REGION_SELECTORS = [
  '[data-tid="closed-caption-v2-window-wrapper"]',
  '[data-tid="closed-captions-renderer"]',
];
const VIRTUAL_LIST_MARKER = '[data-testid="virtual-list-loader"]';
// Best-effort markers that a call UI is on screen (Teams changes these often).
const IN_CALL_SELECTORS = [
  '[data-tid="hangup-main-btn"]',
  "#hangup-button",
  '[data-tid="call-hangup"]',
];
const CALL_POLL_INTERVAL = 2000;

/** Finds the caption list by walking up from a caption to its virtual list. */
const findRegionFromCaption = (): HTMLElement | null => {
  let node = document.querySelector(CAPTION_TEXT_SELECTOR)?.parentElement ?? null;
  while (node && node !== document.body) {
    if (node.querySelector(VIRTUAL_LIST_MARKER)) return node;
    node = node.parentElement;
  }
  return null;
};

const findCaptionRegion = (): HTMLElement | null => {
  for (const selector of CAPTION_REGION_SELECTORS) {
    const region = document.querySelector<HTMLElement>(selector);
    if (region?.querySelector(CAPTION_TEXT_SELECTOR)) return region;
  }
  return findRegionFromCaption();
};

const isInCall = (): boolean =>
  Boolean(findCaptionRegion()) ||
  teamsCallToolbarVisible() ||
  IN_CALL_SELECTORS.some((selector) => document.querySelector(selector));

/** Microsoft Teams web (teams.live.com / teams.microsoft.com). */
export const teamsPlatform: MeetingPlatform = {
  id: "teams",
  name: "Microsoft Teams",

  // Teams is a single-page app: meetings don't have their own page load.
  isMeetingPage: () => true,

  // Avoid showing the overlay on chat/calendar pages: wait for a call.
  waitForCall: () =>
    new Promise((resolve) => {
      if (isInCall()) return resolve();
      const timer = setInterval(() => {
        if (!isInCall()) return;
        clearInterval(timer);
        resolve();
      }, CALL_POLL_INTERVAL);
    }),

  findCaptionRegion,

  getCaptionEntries: (region) =>
    Array.from(region.querySelectorAll(CAPTION_TEXT_SELECTOR))
      .map((text) => text.closest(CAPTION_ENTRY_SELECTOR) ?? text.parentElement)
      .filter((entry): entry is Element => entry !== null),

  readCaptionEntry: (entry) => {
    // Read only the caption span; other extensions may inject siblings.
    const textEl = entry.querySelector(CAPTION_TEXT_SELECTOR);
    if (!textEl) return null;
    return {
      speaker: entry.querySelector(AUTHOR_SELECTOR)?.textContent?.trim() || "Unknown",
      text: textEl.textContent?.trim() ?? "",
    };
  },

  // No reliable end-of-call marker yet; the session ends on page unload.
  isMeetingEnded: () => false,

  getMeetingCode: () => {
    const meetingId = window.location.href.match(/\/meet\/([\w-]+)/)?.[1];
    return meetingId ? `teams-${meetingId}` : "teams";
  },

  getMeetingTitle: () =>
    document.title.replace(/\s*\|\s*Microsoft Teams\s*$/i, "").trim() || undefined,

  supportsChatHistory: false,
  captionsHintKey: "overlay.hintTeams",
  enableCaptions: enableTeamsCaptions,
  captionsShowing: teamsCaptionsShowing,
};
