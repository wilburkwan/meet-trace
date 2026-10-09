import { RECORDING_BITS_PER_SECOND, RECORDING_SLICE_MS } from "@/core/recording";

/** One way of turning live audio into stored slices. */
export type Capture = { format: string; stop: () => Promise<void> };

type OnSlice = (slice: Blob) => void;

// WebM/Opus is Chrome's most mature recorder format (plays in Chrome and VLC).
const MIME_TYPES = ["audio/webm;codecs=opus", "audio/mp4;codecs=mp4a.40.2"] as const;

/** Records a live stream (the tab, or the tab + mic mix) into ~10 s slices. */
export const startMediaCapture = (stream: MediaStream, onSlice: OnSlice, onError: (message: string) => void): Capture => {
  const mimeType = MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
  const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: RECORDING_BITS_PER_SECOND });
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) onSlice(event.data);
  };
  recorder.onerror = (event) => onError(String(event));
  recorder.start(RECORDING_SLICE_MS);
  return {
    format: recorder.mimeType,
    stop: async () => {
      if (recorder.state === "inactive") return;
      const stopped = new Promise((resolve) => recorder.addEventListener("stop", resolve, { once: true }));
      recorder.stop();
      await stopped;
    },
  };
};
