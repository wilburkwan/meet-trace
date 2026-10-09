import type { Caption, TranslateResponse } from "@live/models";
import { captions, settings, notifyStateChange } from "@live/live-state";
import { scrollToBottomIfNeeded } from "@live/panel/panel-runtime";
import {
  updateCaptionInHistory,
  saveCaptionsDebounced,
} from "@live/session-recorder";
import { TranslationStatus } from "@live/config";
import { translateWithChrome } from "@live/chrome-translator";

const pendingTranslations = new Set<number>();

function refreshCaption(): void {
  notifyStateChange();
  scrollToBottomIfNeeded();
}

export async function translateCaption(
  captionObj: Caption,
  force = false,
): Promise<void> {
  if (pendingTranslations.has(captionObj.id)) {
    return;
  }

  if (!force && !settings.translationEnabled) {
    return;
  }

  if (!captionObj.text || captionObj.text.trim().length === 0) {
    return;
  }

  const textToTranslate = captionObj.text;
  const captionId = captionObj.id;

  try {
    pendingTranslations.add(captionId);
    captionObj.translationStatus = TranslationStatus.Translating;
    refreshCaption();

    // Translated on-device by Chrome's built-in Translator API.
    const response: TranslateResponse = await translateWithChrome(
      textToTranslate,
      settings.sourceLanguage,
      settings.targetLanguage
    );

    const stillExistsInUI = captions.find((c) => c.id === captionId);

    if (response?.success && response.translation) {
      updateCaptionInHistory(captionId, { translation: response.translation });
      saveCaptionsDebounced();

      if (stillExistsInUI) {
        captionObj.lastTranslatedLength = textToTranslate.length;
        captionObj.translation = response.translation;
        captionObj.needsModel = false;
        captionObj.translationStatus = TranslationStatus.Semantic;
        refreshCaption();
      }
    } else if (stillExistsInUI) {
      captionObj.translationStatus = TranslationStatus.Error;
      captionObj.translationError = response?.error || "Translation failed";
      captionObj.needsModel = Boolean(response?.needsModel);
      refreshCaption();
    }
  } catch (e) {
    captionObj.translationStatus = TranslationStatus.Error;
    captionObj.translationError = String(e);
    refreshCaption();
  } finally {
    pendingTranslations.delete(captionId);
  }
}

export function retranslateCaption(captionObj: Caption): void {
  captionObj.translationStatus = TranslationStatus.Pending;
  captionObj.isFinalized = false;
  translateCaption(captionObj);
}

export function manualTranslate(captionObj: Caption): void {
  translateCaption(captionObj, true);
}
