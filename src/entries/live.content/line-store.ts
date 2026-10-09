import type { Caption } from "@live/models";
import { formatClock24 } from "@/core/clock";
import { MAX_CAPTIONS, TranslationStatus } from "@live/config";
import {
  captions,
  settings,
  getNextCaptionId,
  waveTimeout,
  setWaveTimeout,
  setWaveActiveState,
  notifyStateChange,
} from "@live/live-state";
import { enqueueTranslation, requestLiveTranslation } from "@live/translate-scheduler";
import { scrollToBottomIfNeeded } from "@live/panel/panel-runtime";
import {
  saveCaptionsDebounced,
  addCaptionToHistory,
  updateCaptionInHistory,
} from "@live/session-recorder";

function setWaveActive(active: boolean): void {
  if (active) {
    setWaveActiveState(true);
    if (waveTimeout) clearTimeout(waveTimeout);
    setWaveTimeout(
      setTimeout(() => {
        setWaveActiveState(false);
      }, 3000)
    );
  } else {
    setWaveActiveState(false);
    if (waveTimeout) clearTimeout(waveTimeout);
  }
}

export function addOrUpdateCaption(
  captionId: number | null,
  speaker: string,
  text: string
): number {
  if (!text || text.trim().length === 0) {
    return captionId ?? -1;
  }

  setWaveActive(true);

  if (captionId !== null) {
    const caption = captions.find((c) => c.id === captionId);
    if (caption) {
      const textChanged = caption.text !== text;

      if (!textChanged) {
        return captionId;
      }

      caption.text = text;

      const needsRetranslate = caption.isFinalized && textChanged;
      if (needsRetranslate) {
        caption.translationStatus = TranslationStatus.Pending;
      }
      caption.isFinalized = false;

      notifyStateChange();
      scrollToBottomIfNeeded();

      updateCaptionInHistory(captionId, { text });
      saveCaptionsDebounced();
      requestLiveTranslation(caption);
      return captionId;
    }
    // Edge case: Caption no longer exists, fall through to create new
  }

  const newId = getNextCaptionId();
  const newCaption: Caption = {
    id: newId,
    speaker,
    text,
    time: formatClock24(Date.now()),
    translation: "",
    translationStatus: TranslationStatus.Pending,
    lastTranslatedLength: 0,
    isFinalized: false,
  };

  captions.push(newCaption);

  addCaptionToHistory(newCaption);

  // Keep only the most recent captions on screen (history keeps them all).
  while (captions.length > MAX_CAPTIONS) captions.shift();

  notifyStateChange();
  scrollToBottomIfNeeded();
  saveCaptionsDebounced();
  requestLiveTranslation(newCaption);

  return newId;
}

export function finalizeCaption(captionId: number): void {
  const caption = captions.find((c) => c.id === captionId);

  if (!caption) {
    return;
  }

  if (caption.isFinalized) {
    return;
  }

  caption.isFinalized = true;

  if (settings.translationEnabled) {
    // Skip when the current translation already covers the final text
    if (
      caption.translation &&
      caption.lastTranslatedLength === caption.text.length &&
      caption.translationStatus !== TranslationStatus.Error &&
      caption.translationStatus !== TranslationStatus.Pending
    ) {
      return;
    }

    if (caption.translationStatus === TranslationStatus.Translating) {
      return;
    }

    enqueueTranslation(caption.id);
  }

  saveCaptionsDebounced();
}

