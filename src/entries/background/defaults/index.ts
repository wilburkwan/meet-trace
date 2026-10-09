import { DEFAULT_CAPTION_FONT_SIZE, DEFAULT_SEGMENT_PAUSE_MS } from "@/core/constants";
import type { Settings } from "../models";
import { systemTargetLanguage } from "./system-language";

export const DEFAULT_SETTINGS: Settings = {
  sourceLanguage: "auto",
  // Most people translate into their own language: the browser's.
  targetLanguage: systemTargetLanguage(),
  segmentPauseMs: DEFAULT_SEGMENT_PAUSE_MS,
  segmentMode: "speaker",
  liveTranslateChars: 20,
  autoEnableCaptions: true,
  autoShowPanel: true,
  translationEnabled: false,
  isOverlayMinimized: false,
  captionFontSize: DEFAULT_CAPTION_FONT_SIZE,
  recordMicrophone: true,
};
