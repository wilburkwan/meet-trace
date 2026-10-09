/** User preferences stored under chrome.storage.local "settings". */
export type Settings = {
  /** Spoken language of the meeting, or "auto" to detect per caption. */
  sourceLanguage: string;
  targetLanguage: string;
  /** Silence before a caption segment ends (see DEFAULT_SEGMENT_PAUSE_MS). */
  segmentPauseMs: number;
  /** "pause": new block after a pause / ~120 chars. "speaker": one block per speaker turn, like Meet. */
  segmentMode: "pause" | "speaker";
  /** Re-translate a caption every N new characters while it is spoken (0 = only when it ends). */
  liveTranslateChars: number;
  /** Click the meeting's CC button automatically after joining (Google Meet). */
  autoEnableCaptions: boolean;
  /** Open the caption window automatically when joining a meeting. */
  autoShowPanel: boolean;
  translationEnabled: boolean;
  isOverlayMinimized: boolean;
  captionFontSize: number;
  /** Mix the user's microphone into recordings (asks for access on the settings page). */
  recordMicrophone: boolean;
};

export type MeetingSession = {
  id: string;
  meetingUrl: string;
  meetingCode: string;
  startTime: number;
  endTime?: number;
  captions: Array<{
    speaker: string;
    text: string;
    translation?: string;
    time: string;
    timestamp: number;
  }>;
  chatMessages?: Array<{
    id: string;
    author: string;
    time: string;
    text: string;
    timestamp: number;
  }>;
  notes?: string;
};
