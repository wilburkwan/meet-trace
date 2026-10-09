// The user's microphone, mixed into the recording while switched on. When off,
// the device is released (the browser's mic indicator goes away too).
let micStream: MediaStream | null = null;
let micSource: MediaStreamAudioSourceNode | null = null;

/** Hidden pages can't show a permission prompt: skip the mic only when it is clearly blocked. */
const isMicBlocked = async (): Promise<boolean> => {
  try {
    return (await navigator.permissions.query({ name: "microphone" })).state === "denied";
  } catch {
    return false; // permission query unsupported: let getUserMedia decide
  }
};

// Without a grant Chrome may wait for a prompt this hidden page can't show.
const MIC_TIMEOUT_MS = 5000;

const withTimeout = <T,>(promise: Promise<T>): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Microphone timed out")), MIC_TIMEOUT_MS)),
  ]);

/** Connects the mic to the mix. Returns false when access isn't allowed. */
export const connectMic = async (context: AudioContext, mix: AudioNode): Promise<boolean> => {
  if (micStream) return true;
  if (await isMicBlocked()) return false;
  try {
    micStream = await withTimeout(navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }));
  } catch {
    return false;
  }
  micSource = context.createMediaStreamSource(micStream);
  micSource.connect(mix);
  return true;
};

export const disconnectMic = (): void => {
  micSource?.disconnect();
  micStream?.getTracks().forEach((track) => track.stop());
  micSource = null;
  micStream = null;
};

/** Mic track state for diagnostics. */
export const describeMic = (): string =>
  micStream?.getAudioTracks().map((track) => `mic:${track.readyState}${track.muted ? "/muted" : ""}`).join(",") ?? "mic:off";
