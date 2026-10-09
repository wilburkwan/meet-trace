import type { Caption } from "@live/models";
import { captions, settings } from "@live/live-state";
import { MAX_AUTO_TRANSLATE_DISTANCE } from "@live/config";
import { downloadModelFromClick, prepareTranslatorFromClick } from "@live/chrome-translator";
import { enqueueNearbyCaptions } from "@live/translate-scheduler";

// Recent captions give the language detector enough text to work with.
const SAMPLE_CAPTIONS = 5;

const retryFailedCaptions = (): void => enqueueNearbyCaptions(MAX_AUTO_TRANSLATE_DISTANCE, true);

/** Downloads the missing model from a click, then retries failed captions. */
export const downloadModelAndRetry = async (
  caption: Caption,
  onProgress: (percent: number) => void
): Promise<void> => {
  await downloadModelFromClick(caption.text, settings.sourceLanguage, settings.targetLanguage, onProgress);
  retryFailedCaptions();
};

/** Toggle or language picker click: start the download right away. */
export const prepareModelFromClick = (targetLanguage = settings.targetLanguage): void => {
  const sample = captions.slice(-SAMPLE_CAPTIONS).map((caption) => caption.text).join(" ");
  prepareTranslatorFromClick(settings.sourceLanguage, targetLanguage, sample)
    .then(retryFailedCaptions)
    .catch(() => {});
};
