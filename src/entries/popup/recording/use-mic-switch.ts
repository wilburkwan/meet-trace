import { useEffect, useState } from "react";
import type { RecordingRequest, RecordingResponse, RecordingStatus } from "@/core/recording";

const send = (request: RecordingRequest): Promise<RecordingResponse> => chrome.runtime.sendMessage(request);

/** The popup can't show Chrome's permission prompt; the settings page can. */
const isMicAllowed = async (): Promise<boolean> => {
  try {
    return (await navigator.permissions.query({ name: "microphone" })).state === "granted";
  } catch {
    return false;
  }
};

/**
 * "Record my mic" switch: before recording it sets the default, while
 * recording it switches the mic in or out right away.
 */
export const useMicSwitch = (status: RecordingStatus, onStatus: (status: RecordingStatus) => void) => {
  const [preferred, setPreferred] = useState<boolean | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isDenied, setIsDenied] = useState(false);

  // On by default, but only shown as on once Chrome has granted mic access.
  useEffect(() => {
    void Promise.all([chrome.runtime.sendMessage({ action: "getSettings" }), isMicAllowed()]).then(
      ([response, allowed]) => setPreferred(Boolean(response?.settings?.recordMicrophone) && allowed)
    );
  }, []);

  const isOn = status.recording ? status.micOn : Boolean(preferred);

  const toggle = async () => {
    const next = !isOn;
    if (next && !(await isMicAllowed())) {
      chrome.runtime.openOptionsPage(); // turn it on there once to grant access
      return;
    }
    setIsBusy(true);
    if (status.recording) {
      const response = await send({ action: "recSetMic", enabled: next }).catch(() => null);
      if (response?.success) onStatus(response.status);
      setIsDenied(!response?.success || Boolean(response.micFailed));
    } else {
      await chrome.runtime.sendMessage({ action: "saveSettings", settings: { recordMicrophone: next } });
      setPreferred(next);
    }
    setIsBusy(false);
  };

  return { isOn, isReady: status.recording || preferred !== null, isBusy, isDenied, toggle };
};
