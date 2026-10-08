import type { TranslationStatus } from "@live/config";

export type Caption = {
  id: number;
  speaker: string;
  text: string;
  time: string;
  translation: string;
  translationStatus: TranslationStatus;
  translationError?: string;
  lastTranslatedLength: number;
  userEdited?: boolean;
  isFinalized?: boolean;
};

export type Settings = {
  sourceLanguage: string;
  segmentPauseMs: number;
  segmentMode: "pause" | "speaker";
  liveTranslateChars: number;
  autoEnableCaptions: boolean;
  autoShowPanel: boolean;
  targetLanguage: string;
  translationEnabled: boolean;
  isOverlayMinimized: boolean;
  captionFontSize: number;
};

export type TranslateResponse = {
  success: boolean;
  translation?: string;
  error?: string;
};

export type SavedCaption = {
  speaker: string;
  text: string;
  translation?: string;
  time: string;
  timestamp: number;
};

export type SavedChatMessage = {
  id: string;
  author: string;
  time: string;
  text: string;
  timestamp: number;
};

export type MeetingSession = {
  id: string;
  meetingUrl: string;
  meetingCode: string;
  title?: string;
  startTime: number;
  endTime?: number;
  captions: SavedCaption[];
  chatMessages: SavedChatMessage[];
  notes?: string;
};
