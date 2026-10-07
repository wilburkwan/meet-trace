import type { ContentScriptContext } from "wxt/utils/content-script-context";
import { createOverlay } from "@live/panel";
import { startObserver } from "@live/caption-watcher";
import { loadSettings, startSettingsSync } from "@live/prefs-sync";
import {
  initMeetingSession,
  updateSessionEndTime,
} from "@live/session-recorder";
import { getPlatform } from "@live/adapters";
import { startI18nSync } from "@live/i18n";
import { startAutoCaptions } from "@live/auto-captions";
import { settings } from "@live/live-state";
import type { PanelRequest, PanelStatus } from "@/core/panel-messages";
import "@live/panel/panel.css";

export default defineContentScript({
  matches: [
    "https://meet.google.com/*",
    "https://teams.live.com/*",
    "https://teams.microsoft.com/*",
    "https://teams.cloud.microsoft/*",
  ],
  runAt: "document_start",
  cssInjectionMode: "ui",

  main(ctx) {
    if (!getPlatform().isMeetingPage()) {
      return;
    }

    // Prevent double injection
    if (document.querySelector('meta[name="meettrace-injected"]')) {
      return;
    }

    const meta = document.createElement("meta");
    meta.name = "meettrace-injected";
    meta.content = "true";
    (document.head || document.documentElement).appendChild(meta);

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => init(ctx), { once: true });
    } else {
      setTimeout(() => init(ctx), 1000);
    }
  },
});

let activation: Promise<void> | null = null;

/** Starts capturing in this meeting: overlay, caption observer, history. Runs once. */
const activate = (ctx: ContentScriptContext): Promise<void> => {
  activation ??= (async () => {
    await getPlatform().waitForCall();
    await createOverlay(ctx);
    startSettingsSync(ctx);
    startObserver();
    startAutoCaptions(ctx);
    initMeetingSession();
    window.addEventListener("beforeunload", () => {
      updateSessionEndTime();
    });
  })();
  return activation;
};

/** Lets the toolbar popup check and start Meet Trace in this meeting. */
const listenForPopup = (ctx: ContentScriptContext): void => {
  const listener = (
    message: PanelRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (status: PanelStatus) => void
  ) => {
    if (message?.action === "msPanelStatus") {
      sendResponse({ active: activation !== null });
      return false;
    }
    if (message?.action === "msPanelStart") {
      void activate(ctx);
      sendResponse({ active: true });
      return false;
    }
    return false;
  };
  chrome.runtime.onMessage.addListener(listener);
  ctx.onInvalidated(() => chrome.runtime.onMessage.removeListener(listener));
};

const init = async (ctx: ContentScriptContext): Promise<void> => {
  listenForPopup(ctx);
  await startI18nSync();
  await loadSettings();
  // "Open Meet Trace automatically" off: wait for the popup's Start button.
  if (settings.autoShowPanel) await activate(ctx);
};
