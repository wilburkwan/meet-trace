import { RECORDING_DB_PREFIX, RECORDING_FOLDER, fileStamp } from "@/core/recording";
import { listRecordingDbs } from "@/core/recording-db";

// Databases handed to a save page recently: the automatic leftover scan skips
// them so a recording that is still being saved isn't saved twice.
const RECENT_SAVE_MS = 60_000;
const recentlySaved = new Set<string>();

/** Names the file after the meeting code, Teams, or the website (e.g. "youtube.com"). */
const sourceName = (tabUrl: string | undefined): string => {
  const meetCode = tabUrl?.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/)?.[1];
  if (meetCode) return meetCode;
  try {
    const host = new URL(tabUrl ?? "").hostname.replace(/^www\./, "");
    return /(^|\.)teams\.(microsoft|live|cloud\.microsoft)/.test(host) ? "Teams" : host;
  } catch {
    return "Recording";
  }
};

/** Database name for a new recording, e.g. "meet-trace-rec:Meet Trace/abc-defg-hij_2026-10-10_14-05". */
export const recordingDbName = (tabUrl: string | undefined, startedAt: number): string =>
  `${RECORDING_DB_PREFIX}${RECORDING_FOLDER}/${sourceName(tabUrl)}_${fileStamp(startedAt)}`;

/**
 * Opens a tab that turns the recording into a file in Downloads and shows
 * where it went (or what went wrong). Recovered recordings open in the background.
 */
export const openSaveTab = async (dbName: string, active = true, details?: string): Promise<void> => {
  recentlySaved.add(dbName);
  setTimeout(() => recentlySaved.delete(dbName), RECENT_SAVE_MS);
  const params = new URLSearchParams({ db: dbName });
  if (details) params.set("details", details); // shown if nothing could be saved
  const url = chrome.runtime.getURL(`save-recording.html?${params}`);
  await chrome.tabs.create({ url, active });
};

/**
 * Saves recordings left behind by a crash or an earlier failed save. `force`
 * (the popup's Save button) also retries ones handed over moments ago.
 */
export const saveLeftoverRecordings = async (force = false, exclude?: string): Promise<void> => {
  for (const dbName of await listRecordingDbs()) {
    if (dbName === exclude || (!force && recentlySaved.has(dbName))) continue;
    await openSaveTab(dbName, force);
  }
};
