import { parseTimestamp, stripLeadingTimestamp, type TranscriptLine, type TranscriptResponse } from "@/core/transcript";

export const PANEL_SELECTOR =
  'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"]';

// YouTube has shipped several transcript layouts; try each.
export const SEGMENT_SELECTORS = [
  "transcript-segment-view-model",
  "ytd-transcript-segment-renderer",
  "[class*='transcript-segment']",
  "ytd-transcript-search-panel-renderer [role='button']",
  "ytd-transcript-search-panel-renderer .yt-spec-button-shape-next",
  "ytd-transcript-body-renderer > *",
];

const OPEN_BUTTON_SELECTORS = [
  "ytd-video-description-transcript-section-renderer button",
  'button[aria-label="Show transcript"]',
  'button[aria-label*="轉錄"]',
  'button[aria-label*="逐字"]',
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

export const isPanelVisible = (el: Element): boolean => {
  if (el.getAttribute("visibility") === "ENGAGEMENT_PANEL_VISIBILITY_HIDDEN") return false;
  const style = window.getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden";
};

/** Finds the transcript panel element using multiple selectors and content-based heuristics. */
export const findTranscriptPanel = (): Element | null => {
  // 1. Direct search textarea or input inside transcript panel
  const searchEl = document.querySelector(
    'textarea[placeholder*="轉錄"], textarea[placeholder*="逐字"], textarea[placeholder*="transcript"], ' +
    'input[placeholder*="轉錄"], input[placeholder*="逐字"], input[placeholder*="transcript"], ' +
    '[aria-label*="搜尋轉錄稿"], [aria-label*="轉錄稿"], [aria-label*="Transcript"]'
  );
  if (searchEl) {
    const parent = searchEl.closest(
      'ytd-engagement-panel-section-list-renderer, [target-id], #panels, ytd-transcript-search-panel-renderer, ytd-transcript-renderer'
    );
    if (parent && isPanelVisible(parent)) return parent;
  }

  // 2. Transcript segment elements (present when transcript is active/open)
  const segment = document.querySelector(
    'transcript-segment-view-model, ytd-transcript-segment-renderer, [class*="segment-timestamp"], [class*="segment-text"]'
  );
  if (segment) {
    const parent = segment.closest(
      'ytd-engagement-panel-section-list-renderer, [target-id], #panels, ytd-transcript-renderer'
    );
    if (parent && isPanelVisible(parent)) return parent;
  }

  // 3. Searchable transcript target-id
  const byTarget =
    document.querySelector('ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"]') ??
    document.querySelector('[target-id="engagement-panel-searchable-transcript"]') ??
    document.querySelector('ytd-engagement-panel-section-list-renderer[target-id*="transcript"]') ??
    document.querySelector('[target-id*="transcript"]');
  if (byTarget && isPanelVisible(byTarget)) return byTarget;

  // 4. Any visible engagement panel whose title or tab says "字幕記錄", "轉錄稿", "逐字稿", or "Transcript"
  const panels = Array.from(document.querySelectorAll('ytd-engagement-panel-section-list-renderer'));
  for (const p of panels) {
    if (!isPanelVisible(p)) continue;
    const text = p.textContent ?? "";
    if (
      text.includes("字幕記錄") ||
      text.includes("轉錄稿") ||
      text.includes("逐字稿") ||
      text.includes("Transcript")
    ) {
      return p;
    }
  }

  // 5. Fallback without visibility check
  if (byTarget) return byTarget;
  if (searchEl) {
    const parent = searchEl.closest('ytd-engagement-panel-section-list-renderer, [target-id], #panels');
    if (parent) return parent;
  }
  if (segment) {
    const parent = segment.closest('ytd-engagement-panel-section-list-renderer, [target-id], #panels');
    if (parent) return parent;
  }

  return null;
};

/** Reads time + text from one segment, whichever layout YouTube uses. */
export const readSegment = (segment: Element): TranscriptLine | null => {
  // Strategy 1: Explicit timestamp and text elements
  const timeEl = segment.querySelector(
    ".segment-timestamp, [class*='Timestamp'], [class*='timestamp'], [class*='time-text']"
  );
  let textEl = segment.querySelector(
    ".segment-text, [class*='SegmentText'], [class*='segment-text']"
  );
  if (!textEl && timeEl) {
    const candidates = Array.from(
      segment.querySelectorAll("yt-formatted-string, .yt-core-attributed-string")
    );
    textEl = candidates.find((el) => el !== timeEl && !timeEl.contains(el)) ?? null;
  }

  const timeText = timeEl?.textContent ?? "";
  const start = parseTimestamp(timeText);
  let text = textEl?.textContent?.trim() ?? "";

  if (start !== null && text) {
    const cleanTime = timeText.replace(/[\u200e\u200f\u202a-\u202e\ufeff]/g, "").trim();
    if (cleanTime && text.startsWith(cleanTime)) {
      text = text.slice(cleanTime.length).trim();
    }
    const cleanText = stripLeadingTimestamp(text.replace(/\s+/g, " "));
    if (cleanText) {
      return { start, text: cleanText };
    }
  }

  // Strategy 2: Leaf elements inspection (e.g. transcript-segment-view-model with yt-core-attributed-string children)
  const leaves = Array.from(segment.querySelectorAll("*")).filter(
    (el) => el.children.length === 0 && (el.textContent?.trim().length ?? 0) > 0
  );
  if (leaves.length >= 2) {
    const timeIndex = leaves.findIndex((leaf) => parseTimestamp(leaf.textContent?.trim() ?? "") !== null);
    if (timeIndex !== -1) {
      const parsedStart = parseTimestamp(leaves[timeIndex].textContent?.trim() ?? "");
      if (parsedStart !== null) {
        const textParts = leaves
          .filter((_, idx) => idx !== timeIndex)
          .map((c) => c.textContent?.trim() ?? "")
          .filter(Boolean);
        const restText = textParts.join(" ");
        const cleanText = stripLeadingTimestamp(restText.replace(/\s+/g, " "));
        if (cleanText) {
          return { start: parsedStart, text: cleanText };
        }
      }
    }
  }

  // Strategy 3: Raw text extraction with regex matching
  const raw = (segment instanceof HTMLElement ? segment.innerText : segment.textContent ?? "")
    .replace(/[\u200e\u200f\u202a-\u202e\ufeff]/g, "")
    .trim();

  const m = raw.match(/(?:(?:\d+:)+\d{2})/);
  if (m && m.index !== undefined) {
    const timeStr = m[0];
    const startSec = parseTimestamp(timeStr);
    if (startSec !== null) {
      const textPart = (raw.slice(0, m.index) + " " + raw.slice(m.index + timeStr.length))
        .replace(/\s+/g, " ")
        .trim();
      const cleanText = stripLeadingTimestamp(textPart);
      if (cleanText) {
        return { start: startSec, text: cleanText };
      }
    }
  }

  // Strategy 4: Chinese timestamp format fallback
  const zh = raw.match(/(?:(?:\d+)\s*小時)?\s*(?:(?:\d+)\s*分(?:鐘)?)?\s*(?:\d+)\s*秒/);
  if (zh && zh.index !== undefined && zh[0]) {
    const startSec = parseTimestamp(zh[0]);
    if (startSec !== null) {
      const textPart = (raw.slice(0, zh.index) + " " + raw.slice(zh.index + zh[0].length))
        .replace(/\s+/g, " ")
        .trim();
      const cleanText = stripLeadingTimestamp(textPart);
      if (cleanText) {
        return { start: startSec, text: cleanText };
      }
    }
  }

  return null;
};

export const readSegments = (searchRoot?: Element | null): TranscriptLine[] => {
  const panel = searchRoot ?? findTranscriptPanel() ?? document;
  for (const selector of SEGMENT_SELECTORS) {
    const segments = panel.querySelectorAll(selector);
    if (segments.length > 0) {
      const results = Array.from(segments, readSegment).filter(
        (line): line is TranscriptLine => line !== null
      );
      if (results.length > 0) {
        return results;
      }
    }
  }

  // Fallback to searching the entire document if panel search had 0 results
  if (panel !== document) {
    for (const selector of SEGMENT_SELECTORS) {
      const segments = document.querySelectorAll(selector);
      if (segments.length > 0) {
        const results = Array.from(segments, readSegment).filter(
          (line): line is TranscriptLine => line !== null
        );
        if (results.length > 0) {
          return results;
        }
      }
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
