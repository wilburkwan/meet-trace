import { parseTimestamp, type TranscriptLine, type TranscriptResponse } from "@/core/transcript";

const PANEL_SELECTOR =
  'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"]';
// YouTube has shipped several transcript layouts; try each.
const SEGMENT_SELECTORS = ["ytd-transcript-segment-renderer", "transcript-segment-view-model"];
const OPEN_BUTTON_SELECTORS = [
  "ytd-video-description-transcript-section-renderer button",
  'button[aria-label="Show transcript"]',
];
const EXPAND_DESCRIPTION_SELECTORS = ["#description-inline-expander #expand", "tp-yt-paper-button#expand"];
const POLL_MS = 250;
const TIMEOUT_MS = 12_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const query = <T extends Element>(selectors: string[]): T | null => {
  for (const selector of selectors) {
    const element = document.querySelector<T>(selector);
    if (element) return element;
  }
  return null;
};

/** Reads time + text from one segment, whichever layout YouTube uses. */
const readSegment = (segment: Element): TranscriptLine | null => {
  const timeText =
    segment.querySelector(".segment-timestamp, [class*='Timestamp'], [class*='timestamp']")?.textContent ?? "";
  let start = parseTimestamp(timeText);
  let text =
    segment.querySelector(".segment-text, [class*='SegmentText'], yt-formatted-string")?.textContent?.trim() ?? "";

  // Fallback: first line of the segment is the time, the rest is the text.
  if (start === null || !text) {
    const [first = "", ...rest] = (segment instanceof HTMLElement ? segment.innerText : segment.textContent ?? "")
      .split("\n")
      .map((part) => part.trim())
      .filter(Boolean);
    start = parseTimestamp(first);
    text = rest.join(" ");
  }
  return start === null || !text ? null : { start, text: text.replace(/\s+/g, " ") };
};

const readSegments = (): TranscriptLine[] => {
  const panel = document.querySelector(PANEL_SELECTOR) ?? document;
  for (const selector of SEGMENT_SELECTORS) {
    const segments = panel.querySelectorAll(selector);
    if (segments.length > 0) {
      return Array.from(segments, readSegment).filter((line): line is TranscriptLine => line !== null);
    }
  }
  return [];
};

/** Opens the "Show transcript" panel (expanding the description first). */
const openTranscriptPanel = async (): Promise<boolean> => {
  let button = query<HTMLElement>(OPEN_BUTTON_SELECTORS);
  if (!button) {
    query<HTMLElement>(EXPAND_DESCRIPTION_SELECTORS)?.click();
    await sleep(400);
    button = query<HTMLElement>(OPEN_BUTTON_SELECTORS);
  }
  if (!button) return false;
  button.click();
  return true;
};

const videoTitle = (): string =>
  document.querySelector("ytd-watch-metadata h1, h1.ytd-watch-metadata")?.textContent?.trim() ||
  document.title.replace(/\s*-\s*YouTube\s*$/, "");

/** Opens (if needed) and reads the whole transcript of the current video. */
export const readTranscript = async (): Promise<TranscriptResponse> => {
  const url = new URL(location.href);
  const videoId = url.searchParams.get("v");
  if (url.pathname !== "/watch" || !videoId) return { ok: false, reason: "not-video" };

  if (readSegments().length === 0 && !(await openTranscriptPanel())) {
    return { ok: false, reason: "no-transcript" };
  }

  const deadline = Date.now() + TIMEOUT_MS;
  let lines = readSegments();
  while (lines.length === 0 && Date.now() < deadline) {
    await sleep(POLL_MS);
    lines = readSegments();
  }
  if (lines.length === 0) return { ok: false, reason: "timeout" };

  return {
    ok: true,
    transcript: { title: videoTitle(), url: `https://www.youtube.com/watch?v=${videoId}`, lines },
  };
};
