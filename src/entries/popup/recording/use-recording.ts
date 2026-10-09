import { useEffect, useState } from "react";
import type { RecordingRequest, RecordingResponse, RecordingStatus } from "@/core/recording";

const send = (request: RecordingRequest): Promise<RecordingResponse> => chrome.runtime.sendMessage(request);

type Phase = "idle" | "starting" | "saving";

/** Recording status for the popup, plus start/stop actions for one meeting tab. */
export const useRecording = (tabId: number) => {
  const [status, setStatus] = useState<RecordingStatus | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [micFailed, setMicFailed] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    void send({ action: "recStatus" }).then((response) => response.success && setStatus(response.status));
  }, []);

  const isRecording = status?.recording === true;
  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  const run = async (next: Phase, request: RecordingRequest) => {
    setPhase(next);
    setError(null);
    const response = await send(request).catch((reason: unknown) => ({ success: false as const, error: String(reason) }));
    setPhase("idle");
    if (!response.success) return setError(response.error);
    setStatus(response.status);
    setMicFailed(Boolean(response.micFailed));
  };

  return {
    status,
    setStatus,
    phase,
    error,
    micFailed,
    elapsedMs: status?.recording ? now - status.startedAt : 0,
    isThisTab: status?.recording === true && status.tabId === tabId,
    start: () => run("starting", { action: "recStart", tabId }),
    stop: () => run("saving", { action: "recStop" }),
  };
};
