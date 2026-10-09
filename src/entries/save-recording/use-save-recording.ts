import { useCallback, useEffect, useRef, useState } from "react";
import { recordingFilename } from "@/core/recording";
import { deleteRecordingDb, readChunks } from "@/core/recording-db";
import { downloadAndWait } from "@/core/recording-download";

export type SaveState =
  | { kind: "saving" }
  | { kind: "done"; filename: string; downloadId: number }
  | { kind: "empty" }
  | { kind: "failed"; reason: string };

// Long enough to read the message before an empty tab closes itself.
const CLOSE_DELAY_MS = 2000;

const extensionFor = (mimeType: string): string =>
  mimeType.startsWith("audio/mpeg") ? "mp3" : mimeType.startsWith("audio/mp4") ? "m4a" : "webm";

const closeTab = () => {
  void chrome.tabs.getCurrent().then((tab) => {
    if (tab?.id !== undefined) void chrome.tabs.remove(tab.id);
  });
};

/** Joins the recording's slices into one file and saves it to Downloads. */
const saveRecording = async (dbName: string): Promise<SaveState> => {
  const chunks = await readChunks(dbName);
  if (chunks.length === 0) {
    await deleteRecordingDb(dbName);
    return { kind: "empty" };
  }
  const type = chunks[0].type || "audio/webm";
  const filename = `${recordingFilename(dbName)}.${extensionFor(type)}`;
  const url = URL.createObjectURL(new Blob(chunks, { type }));
  try {
    const downloadId = await downloadAndWait(url, filename);
    await deleteRecordingDb(dbName); // only once the file is safely on disk
    return { kind: "done", filename, downloadId };
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const useSaveRecording = () => {
  const [state, setState] = useState<SaveState>({ kind: "saving" });
  const started = useRef(false);
  const params = new URLSearchParams(location.search);
  const dbName = params.get("db");
  const details = params.get("details");

  const save = useCallback(() => {
    if (!dbName) return setState({ kind: "empty" });
    setState({ kind: "saving" });
    saveRecording(dbName)
      .then((result) => {
        setState(result);
        // A saved file stays on screen so the user sees where it went.
        if (result.kind === "empty" && !details) setTimeout(closeTab, CLOSE_DELAY_MS);
      })
      .catch((error: unknown) => setState({ kind: "failed", reason: error instanceof Error ? error.message : String(error) }));
  }, [dbName, details]);

  useEffect(() => {
    if (started.current) return; // StrictMode runs effects twice in development
    started.current = true;
    save();
  }, [save]);

  const showFile = () => {
    if (state.kind === "done") chrome.downloads.show(state.downloadId);
  };

  return { state, details, retry: save, showFile };
};
