/** Messages between the toolbar popup and the meeting content script. */
export type PanelRequest = { action: "msPanelStatus" } | { action: "msPanelStart" };
export type PanelStatus = { active: boolean };

/** Meeting pages the content script runs on (Google Meet code URLs, Teams). */
export const isMeetingTabUrl = (url?: string): boolean =>
  Boolean(
    url &&
      (/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(url) ||
        /^https:\/\/teams\.(live|microsoft)\.com\//.test(url) ||
        /^https:\/\/teams\.cloud\.microsoft\//.test(url))
  );
