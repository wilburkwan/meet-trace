export { LANGUAGES } from "./language-list";

export const DEFAULT_CAPTION_FONT_SIZE = 16;

/**
 * Meeting history storage budget. Chrome's default local quota is 10 MB, so the
 * manifest requests "unlimitedStorage" and this app-level limit applies instead.
 */
export const HISTORY_QUOTA_BYTES = 25 * 1024 * 1024;

/** Silence (ms) after which the current caption segment ends and is translated. */
export const DEFAULT_SEGMENT_PAUSE_MS = 3000;
export const MIN_SEGMENT_PAUSE_MS = 1000;
export const MAX_SEGMENT_PAUSE_MS = 15000;
