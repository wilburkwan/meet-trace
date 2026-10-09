import { useEffect, useState } from "react";
import type { MessageKey } from "@/core/i18n";
import {
  toFileName,
  toPlainText,
  toTranscriptWithTimestamps,
  toSrt,
  type TranscriptResponse,
  type VideoTranscript,
} from "@/core/transcript";
import { useI18n } from "@/ui-kit/i18n-provider";

type State =
  | { kind: "hidden" }
  | { kind: "idle"; tabId: number }
  | { kind: "loading"; tabId: number }
  | { kind: "ready"; tabId: number; transcript: VideoTranscript }
  | { kind: "error"; tabId: number; message: string };

const isYouTubeVideo = (url?: string): boolean =>
  Boolean(url && /^https:\/\/www\.youtube\.com\/watch\?/.test(url));

const FAILURE_KEYS: Record<Exclude<TranscriptResponse, { ok: true }>["reason"], MessageKey> = {
  "not-video": "yt.notVideo",
  "no-transcript": "yt.noTranscript",
  timeout: "yt.noTranscript",
  error: "yt.failed",
};

const download = (content: string, fileName: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

/** Reads the active YouTube tab's transcript and exports it. */
export const useYouTubeTranscript = () => {
  const { t, locale } = useI18n();
  const [state, setState] = useState<State>({ kind: "hidden" });
  const [copied, setCopied] = useState<"text" | "prompt" | null>(null);

  useEffect(() => {
    chrome.tabs
      .query({ active: true, currentWindow: true })
      .then(([tab]) => {
        if (tab?.id !== undefined && isYouTubeVideo(tab.url)) setState({ kind: "idle", tabId: tab.id });
      })
      .catch(() => {});
  }, []);

  const read = async () => {
    if (state.kind === "hidden") return;
    const { tabId } = state;
    setState({ kind: "loading", tabId });
    try {
      const response: TranscriptResponse = await chrome.tabs.sendMessage(tabId, { action: "ytReadTranscript" });
      if (response.ok) return setState({ kind: "ready", tabId, transcript: response.transcript });
      const message = t(FAILURE_KEYS[response.reason], { reason: response.detail ?? response.reason });
      setState({ kind: "error", tabId, message });
    } catch {
      // No content script yet: the tab was open before the extension loaded.
      setState({ kind: "error", tabId, message: t("yt.reload") });
    }
  };

  const copy = async (which: "text" | "prompt") => {
    if (state.kind !== "ready") return;
    const text =
      which === "prompt"
        ? toTranscriptWithTimestamps(state.transcript)
        : toPlainText(state.transcript);
    const { targetLanguage } = (await chrome.runtime.sendMessage({ action: "getSettings" }))?.settings ?? {};
    const language = new Intl.DisplayNames([locale], { type: "language" }).of(targetLanguage ?? "en") ?? "English";
    await navigator.clipboard.writeText(
      which === "prompt" ? `${t("yt.promptText", { language })}\n\n${text}` : text
    );
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  };

  const exportAs = (format: "txt" | "srt") => {
    if (state.kind !== "ready") return;
    const { transcript } = state;
    if (format === "txt") download(toPlainText(transcript), toFileName(transcript.title, "txt"), "text/plain");
    else download(toSrt(transcript), toFileName(transcript.title, "srt"), "application/x-subrip");
  };

  return { state, copied, read, copy, exportAs };
};
