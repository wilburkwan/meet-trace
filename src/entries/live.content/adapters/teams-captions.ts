// Turning on Teams live captions: first the Alt+Shift+C shortcut (once), then the
// menu path More → Language and speech → Show live captions, one step per call.

const MORE_BUTTON_SELECTORS = [
  "#callingButtons-showMoreBtn",
  'button[data-tid="more-button"]',
  'button[data-tid="callingButtons-showMoreBtn"]',
];
const LANGUAGE_MENU_SELECTORS = ["#LanguageSpeechMenuControl-id", '[data-tid="LanguageSpeechMenuControl-id"]'];
const CAPTIONS_ITEM_SELECTORS = ["#closed-captions-button", '[data-tid="closed-captions-button"]'];
// Wrappers Teams shows while captions are on (even before anyone speaks).
const CAPTIONS_WINDOW_SELECTORS = [
  '[data-tid="closed-caption-v2-window-wrapper"]',
  '[data-tid="closed-captions-renderer"]',
  '[data-tid="closed-caption-text"]',
];

const MORE_LABEL = /^(more|more actions|其他|更多|その他|더 보기|más|plus|mehr|altro|meer|więcej|daha fazla|ещё|більше)\b/i;
const LANGUAGE_LABEL =
  /language and speech|語言和語音|语言和语音|言語と音声|언어 및 음성|idioma y voz|langue et voix|sprache und sprach|lingua e voce|taal en spraak/i;
const CAPTIONS_LABEL =
  /live captions|即時輔助字幕|即时字幕|实时字幕|ライブ キャプション|라이브 캡션|subtítulos en directo|sous-titres en direct|liveuntertitel|sottotitoli in tempo reale/i;
// The same item reads "Hide …" once captions are on: never click that one.
const HIDE_LABEL = /hide|turn off|隱藏|關閉|隐藏|关闭|非表示|オフ|숨기기|끄기|ocultar|masquer|ausblenden|nascondi|verbergen/i;

const labelOf = (element: Element): string =>
  `${element.getAttribute("aria-label") ?? ""} ${element.textContent ?? ""}`.trim();

const find = (selectors: string[], label: RegExp, scope = "button, [role='menuitem'], [role='menuitemcheckbox']") => {
  for (const selector of selectors) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) return element;
  }
  return Array.from(document.querySelectorAll<HTMLElement>(scope)).find((element) =>
    label.test(labelOf(element))
  ) ?? null;
};

/** True while Teams' caption window is on screen. */
export const teamsCaptionsShowing = (): boolean =>
  CAPTIONS_WINDOW_SELECTORS.some((selector) => document.querySelector(selector));

/** The call toolbar is present (we're in a call, not the lobby). */
export const teamsCallToolbarVisible = (): boolean =>
  find(MORE_BUTTON_SELECTORS, MORE_LABEL, "button[aria-label]") !== null;

let shortcutTried = false;

const pressShortcut = (): void => {
  const init = { key: "C", code: "KeyC", keyCode: 67, altKey: true, shiftKey: true, bubbles: true, cancelable: true };
  const target = document.activeElement ?? document.body;
  target.dispatchEvent(new KeyboardEvent("keydown", init));
  target.dispatchEvent(new KeyboardEvent("keyup", init));
};

/**
 * Performs the next step towards turning captions on. Returns true when an
 * attempt to switch captions on was made (shortcut or the final menu item).
 */
export const enableTeamsCaptions = (): boolean => {
  if (teamsCaptionsShowing() || !teamsCallToolbarVisible()) return false;

  if (!shortcutTried) {
    shortcutTried = true;
    pressShortcut();
    return true;
  }

  const captionsItem = find(CAPTIONS_ITEM_SELECTORS, CAPTIONS_LABEL, "[role='menuitem'], [role='menuitemcheckbox']");
  if (captionsItem) {
    if (HIDE_LABEL.test(labelOf(captionsItem))) return false; // already on
    captionsItem.click();
    return true;
  }

  const languageItem = find(LANGUAGE_MENU_SELECTORS, LANGUAGE_LABEL, "[role='menuitem']");
  if (languageItem) {
    languageItem.click();
    return false;
  }

  find(MORE_BUTTON_SELECTORS, MORE_LABEL, "button[aria-label]")?.click();
  return false;
};
