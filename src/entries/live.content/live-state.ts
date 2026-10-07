import type { Caption, Settings } from "@live/models";
import { DEFAULT_CAPTION_FONT_SIZE, DEFAULT_SEGMENT_PAUSE_MS } from "@/core/constants";

export const captions: Caption[] = [];

type StateListener = () => void;

const listeners = new Set<StateListener>();
let stateVersion = 0;

export function subscribe(listener: StateListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getStateVersion(): number {
  return stateVersion;
}

export function notifyStateChange(): void {
  stateVersion += 1;
  listeners.forEach((listener) => listener());
}

export let settings: Settings = {
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

export function updateSettings(newSettings: Partial<Settings>) {
  settings = { ...settings, ...newSettings };
  notifyStateChange();
}


export let captionIdCounter = 0;
export function getNextCaptionId() {
  return ++captionIdCounter;
}

export let isCCEnabled = false;
export function setCCEnabled(enabled: boolean) {
  isCCEnabled = enabled;
  notifyStateChange();
}

export let isMeetingEnded = false;
export function setMeetingEnded(ended: boolean): void {
  if (isMeetingEnded === ended) return;
  isMeetingEnded = ended;
  notifyStateChange();
}

export let isWaveActive = false;
export function setWaveActiveState(active: boolean): void {
  isWaveActive = active;
  notifyStateChange();
}


export let waveTimeout: ReturnType<typeof setTimeout> | null = null;

export function setWaveTimeout(timeout: ReturnType<typeof setTimeout> | null) {
  waveTimeout = timeout;
}
