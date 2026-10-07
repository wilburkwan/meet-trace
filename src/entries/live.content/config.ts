import { DEFAULT_CAPTION_FONT_SIZE } from "@/core/constants";

export { LANGUAGES } from "@/core/constants";

export const MAX_CAPTIONS = 200;

// Keep long-running speech readable without relying on a source language.
// Roughly equivalent to 500-600/700-900 English characters or 120/180 CJK
// characters, depending on word and whitespace density.
export const CAPTION_SEGMENT_SOFT_TOKEN_LIMIT = 120;
export const CAPTION_SEGMENT_HARD_TOKEN_LIMIT = 180;

// Smart translation scheduling
// Max simultaneous translation requests (controls throughput & rate-limit risk)
export const TRANSLATION_CONCURRENCY = 3;
// When turning translation ON, only auto-translate captions within this many
// pixels of the overlay viewport. Anything farther is skipped (manual only).
export const MAX_AUTO_TRANSLATE_DISTANCE = 1500;
// When scrolling, prefetch captions this close to the viewport.
export const SCROLL_PREFETCH_MARGIN = 300;
export const CAPTION_FONT_SIZES = [
  14,
  DEFAULT_CAPTION_FONT_SIZE,
  18,
  24,
  30,
] as const;
// Lifecycle of a caption translation shown in the panel.
export const TranslationStatus = {
  Pending: "pending",
  Translating: "translating",
  Refining: "refining",
  Semantic: "semantic",
  Error: "error",
} as const;

export type TranslationStatus =
  (typeof TranslationStatus)[keyof typeof TranslationStatus];
