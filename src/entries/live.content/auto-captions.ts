import type { ContentScriptContext } from "wxt/utils/content-script-context";
import { getPlatform } from "@live/adapters";
import { isCCEnabled, notifyStateChange, settings } from "@live/live-state";

const POLL_INTERVAL = 1000;
// After a click, give Meet time to show captions before trying again.
const RETRY_DELAY = 4000;
const MAX_CLICKS = 5;
// Signing in or waiting in the lobby can take a while; keep waiting for the call.
const WAIT_FOR_CALL_MS = 15 * 60 * 1000;

export type AutoCaptionsStatus =
  | { kind: "off" } // feature disabled, unsupported, or captions already on
  | { kind: "waiting-for-call" }
  | { kind: "trying"; attempt: number }
  | { kind: "gave-up" };

let status: AutoCaptionsStatus = { kind: "off" };
let stopLoop: (() => void) | null = null;

const setStatus = (next: AutoCaptionsStatus): void => {
  status = next;
  notifyStateChange(); // refresh the overlay notice
};

export const getAutoCaptionsStatus = (): AutoCaptionsStatus => status;

const captionsAreOn = (): boolean => {
  const platform = getPlatform();
  return isCCEnabled || platform.findCaptionRegion() !== null || Boolean(platform.captionsShowing?.());
};

/**
 * Clicks the platform's CC button until captions show up. Time spent signing
 * in or in the lobby (no CC button yet) doesn't count against the retries.
 * Meet's button only matches while captions are off, so a click can never
 * turn captions off again.
 */
const runLoop = (ctx: ContentScriptContext | null): void => {
  const { enableCaptions } = getPlatform();
  if (!enableCaptions) return;

  stopLoop?.();
  let clicks = 0;
  let lastClickAt = 0;
  const startedAt = Date.now();
  setStatus({ kind: "waiting-for-call" });

  const timer = setInterval(() => {
    const finish = (next: AutoCaptionsStatus) => {
      clearInterval(timer);
      stopLoop = null;
      setStatus(next);
    };

    if (captionsAreOn()) return finish({ kind: "off" });
    if (Date.now() - lastClickAt < RETRY_DELAY) return;
    if (clicks >= MAX_CLICKS) return finish({ kind: "gave-up" });

    if (enableCaptions()) {
      clicks += 1;
      lastClickAt = Date.now();
      setStatus({ kind: "trying", attempt: clicks });
    } else if (clicks === 0 && Date.now() - startedAt > WAIT_FOR_CALL_MS) {
      finish({ kind: "gave-up" });
    }
  }, POLL_INTERVAL);

  stopLoop = () => clearInterval(timer);
  ctx?.onInvalidated(() => clearInterval(timer));
};

/** Starts automatic captions after joining, if enabled in settings. */
export const startAutoCaptions = (ctx: ContentScriptContext): void => {
  if (settings.autoEnableCaptions) runLoop(ctx);
};

/** "Turn on captions for me" button: try again right now (user click). */
export const retryAutoCaptions = (): void => {
  getPlatform().enableCaptions?.();
  runLoop(null);
};
