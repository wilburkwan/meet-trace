import {
  captions,
  settings,
  isCCEnabled,
  isMeetingEnded,
  setCCEnabled,
  setMeetingEnded,
} from "@live/live-state";
import { finalizeCaption } from "@live/line-store";
import { updateCaptionStream } from "@live/line-stream";
import {
  findTrackedCaptionStream,
  refreshTrackedCaptionStreams,
  setTrackedCaptionStream,
} from "@live/entry-tracker";
import { isMeetingEndedPage, stopRecordingOnMeetingEnd } from "@live/call-status";
import { getPlatform } from "@live/adapters";
import { MAX_SEGMENT_PAUSE_MS, MIN_SEGMENT_PAUSE_MS } from "@/core/constants";

let currentCaptionRegion: HTMLElement | null = null;

const elementLastText = new WeakMap<Element, string>();

const elementLastSpeaker = new WeakMap<Element, string>();

const finalizationTimers = new Map<number, ReturnType<typeof setTimeout>>();

/** Silence before a segment ends, as configured on the settings page. */
const getSegmentPause = (): number =>
  Math.min(Math.max(settings.segmentPauseMs, MIN_SEGMENT_PAUSE_MS), MAX_SEGMENT_PAUSE_MS);

function processCaption(entry: Element): void {
  const content = getPlatform().readCaptionEntry(entry);
  if (!content) {
    return;
  }

  const { speaker, text } = content;

  if (!text || text.length < 2) {
    return;
  }

  const lastText = elementLastText.get(entry);
  const lastSpeaker = elementLastSpeaker.get(entry);

  if (lastText === text && lastSpeaker === speaker) {
    return;
  }

  elementLastText.set(entry, text);
  elementLastSpeaker.set(entry, speaker);

  const previousState = findTrackedCaptionStream(entry, speaker, text);

  if (!previousState) {
    finalizePendingCaptions();
  }

  const update = updateCaptionStream(previousState, speaker, text);
  setTrackedCaptionStream(entry, update.state);

  update.finalizedCaptionIds.forEach(cancelFinalization);
  if (update.activeCaptionId !== null) {
    scheduleFinalization(update.activeCaptionId);
  }
}

function scheduleFinalization(captionId: number): void {
  cancelFinalization(captionId);

  const timer = setTimeout(() => {
    finalizationTimers.delete(captionId);

    const caption = captions.find((c) => c.id === captionId);
    if (caption) {
      finalizeCaption(captionId);
    }
  }, getSegmentPause());

  finalizationTimers.set(captionId, timer);
}

function finalizePendingCaptions(): void {
  const pendingIds = Array.from(finalizationTimers.keys());
  for (const captionId of pendingIds) {
    cancelFinalization(captionId);
    finalizeCaption(captionId);
  }
}

function cancelFinalization(captionId: number): void {
  const timer = finalizationTimers.get(captionId);
  if (timer) {
    clearTimeout(timer);
    finalizationTimers.delete(captionId);
  }
}

function extractCaptions(): void {
  const platform = getPlatform();
  const captionRegion = platform.findCaptionRegion();
  if (!captionRegion) {
    return;
  }

  const captionEntries = platform.getCaptionEntries(captionRegion);

  if (captionEntries.length === 0) {
    return;
  }

  refreshTrackedCaptionStreams(new Set(captionEntries));
  captionEntries.forEach(processCaption);
}

export function startObserver(): void {
  let observer: MutationObserver | null = null;
  let extractTimeout: ReturnType<typeof setTimeout> | null = null;

  function debouncedExtract(): void {
    if (extractTimeout) clearTimeout(extractTimeout);
    extractTimeout = setTimeout(() => {
      extractCaptions();
    }, 100);
  }

  function observeCaptionRegion(): void {
    const captionRegion = getPlatform().findCaptionRegion();
    const hasMeetingEnded = isMeetingEndedPage();

    if (hasMeetingEnded) {
      if (!isMeetingEnded) {
        setMeetingEnded(true);
        stopRecordingOnMeetingEnd();
      }
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      currentCaptionRegion = null;
      finalizePendingCaptions();
      if (isCCEnabled) setCCEnabled(false);
      return;
    }

    if (isMeetingEnded) setMeetingEnded(false);

    const needsReobserve =
      captionRegion &&
      (!currentCaptionRegion ||
        captionRegion !== currentCaptionRegion ||
        !document.body.contains(currentCaptionRegion));

    if (needsReobserve && captionRegion) {
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      currentCaptionRegion = captionRegion;

      if (!isCCEnabled) {
        setCCEnabled(true);
      }

      observer = new MutationObserver(debouncedExtract);
      observer.observe(captionRegion, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      extractCaptions();
    }

    if (!captionRegion && currentCaptionRegion) {
      currentCaptionRegion = null;
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      finalizePendingCaptions();
      setCCEnabled(false);
    }

    // Captions switched on but nobody has spoken yet (e.g. Teams' empty caption
    // window): show "ready" instead of "captions are off".
    if (!captionRegion && !currentCaptionRegion) {
      const showing = Boolean(getPlatform().captionsShowing?.());
      if (showing !== isCCEnabled) setCCEnabled(showing);
    }
  }

  setInterval(observeCaptionRegion, 2000);
  observeCaptionRegion();
}
