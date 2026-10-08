import { DEFAULT_CAPTION_FONT_SIZE, DEFAULT_SEGMENT_PAUSE_MS } from "@/core/constants";
import type { Settings } from "../models";

export const DEFAULT_SETTINGS: Settings = {
  sourceLanguage: "auto",
  targetLanguage: "en",
  segmentPauseMs: DEFAULT_SEGMENT_PAUSE_MS,
  segmentMode: "speaker",
  liveTranslateChars: 20,
  autoEnableCaptions: true,
  autoShowPanel: true,
  translationEnabled: false,
  isOverlayMinimized: false,
  captionFontSize: DEFAULT_CAPTION_FONT_SIZE,
};
