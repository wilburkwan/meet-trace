import type {
  Caption,
  MeetingSession,
  SavedCaption,
  SavedChatMessage,
} from "@live/models";
import { debounce } from "@live/utils";
import { showErrorToast } from "@live/panel/common";
import { getPlatform } from "@live/adapters";
import { settings } from "@live/live-state";

let currentSession: MeetingSession | null = null;

const allCaptions = new Map<number, SavedCaption>();
const allChatMessages = new Map<string, SavedChatMessage>();
let meetingNotes = "";
let isSaveFailureNotified = false;

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

const getMeetingCodeFromUrl = (): string => getPlatform().getMeetingCode();

/** Reads the visible meeting title from the current platform's layout. */
const getMeetingTitle = (): string | undefined => getPlatform().getMeetingTitle();

export const initMeetingSession = (): void => {
  if (currentSession) return;

  currentSession = {
    id: generateId(),
    meetingUrl: window.location.href,
    meetingCode: getMeetingCodeFromUrl(),
    startTime: Date.now(),
    captions: [],
    chatMessages: [],
  };
};

export const addChatMessageToHistory = (message: SavedChatMessage): void => {
  allChatMessages.set(message.id, message);
  saveCaptionsDebounced();
};

/** Stores the user's notes for the current meeting and schedules a save. */
export const updateMeetingNotes = (notes: string): void => {
  meetingNotes = notes;
  saveCaptionsDebounced();
};

export const getMeetingNotes = (): string => meetingNotes;

export const addCaptionToHistory = (caption: Caption): void => {
  const saved: SavedCaption = {
    speaker: caption.speaker,
    text: caption.text,
    translation: caption.translation || undefined,
    time: caption.time,
    timestamp: Date.now(),
  };
  allCaptions.set(caption.id, saved);
};

export const updateCaptionInHistory = (
  captionId: number,
  updates: Partial<Pick<SavedCaption, "text" | "translation">>,
): void => {
  const existing = allCaptions.get(captionId);
  if (existing) {
    if (updates.text !== undefined) existing.text = updates.text;
    if (updates.translation !== undefined)
      existing.translation = updates.translation;
  }
};

const saveToStorage = async (): Promise<void> => {
  const hasContent =
    allCaptions.size > 0 ||
    allChatMessages.size > 0 ||
    meetingNotes !== "" ||
    Boolean(currentSession?.notes);
  if (!currentSession || !hasContent) return;

  if (!currentSession.title) {
    currentSession.title = getMeetingTitle();
  }

  currentSession.captions = Array.from(allCaptions.values());
  currentSession.chatMessages = Array.from(allChatMessages.values()).sort(
    (first, second) => first.timestamp - second.timestamp,
  );
  currentSession.notes = meetingNotes;
  currentSession.endTime = Date.now();

  try {
    const response = await chrome.runtime.sendMessage({
      action: "saveMeetingSession",
      session: currentSession,
    });
    if (!response?.success) throw new Error(response?.error);
    isSaveFailureNotified = false;
  } catch {
    if (isSaveFailureNotified) return;
    isSaveFailureNotified = true;
    showErrorToast(
      "Meeting history couldn't be saved. Your existing history is safe."
    );
  }
};

export const saveCaptionsDebounced = debounce(saveToStorage, 500);

type CaptionBlock = { time: string; speaker: string; text: string; translation: string };

// Chinese/Japanese/Korean text and full-width punctuation are written without spaces.
const NO_SPACE_SCRIPT = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u3000-\u303f\uff00-\uffef]/u;

/** Joins two pieces of text, adding a space only between space-separated scripts. */
const joinText = (left: string, right: string): string => {
  if (!left) return right;
  if (!right) return left;
  const needsSpace = !NO_SPACE_SCRIPT.test(left.at(-1) ?? "") || !NO_SPACE_SCRIPT.test(right[0]);
  return needsSpace ? `${left} ${right}` : `${left}${right}`;
};

/** In "speaker" mode, joins a speaker's consecutive segments into one block. */
const groupCaptions = (captions: SavedCaption[], bySpeaker: boolean): CaptionBlock[] =>
  captions.reduce<CaptionBlock[]>((blocks, caption) => {
    const last = blocks.at(-1);
    if (bySpeaker && last && last.speaker === caption.speaker) {
      last.text = joinText(last.text, caption.text);
      last.translation = joinText(last.translation, caption.translation ?? "");
    } else {
      blocks.push({
        time: caption.time,
        speaker: caption.speaker,
        text: caption.text,
        translation: caption.translation ?? "",
      });
    }
    return blocks;
  }, []);

/** Number of captions captured in this meeting (not just those on screen). */
export const getCapturedCaptionCount = (): number => allCaptions.size;

/**
 * The whole meeting as plain text for pasting into an LLM:
 * "[time] Speaker: text", translations indented underneath, chat at the end.
 */
export const buildTranscriptText = (chatHeading: string): string => {
  const title = currentSession?.title ?? getMeetingTitle() ?? currentSession?.meetingCode ?? "";
  const lines = [title, new Date(currentSession?.startTime ?? Date.now()).toLocaleString(), ""];
  const captions = Array.from(allCaptions.values()).sort((a, b) => a.timestamp - b.timestamp);
  for (const block of groupCaptions(captions, settings.segmentMode === "speaker")) {
    lines.push(`[${block.time}] ${block.speaker}: ${block.text}`);
    if (block.translation) lines.push(`    → ${block.translation}`);
  }
  const chat = Array.from(allChatMessages.values()).sort((a, b) => a.timestamp - b.timestamp);
  if (chat.length > 0) {
    lines.push("", `— ${chatHeading} —`);
    for (const message of chat) lines.push(`[${message.time}] ${message.author}: ${message.text}`);
  }
  return lines.join("\n").trim();
};

export const updateSessionEndTime = (): void => {
  if (!currentSession) return;
  currentSession.endTime = Date.now();
  saveToStorage();
};

