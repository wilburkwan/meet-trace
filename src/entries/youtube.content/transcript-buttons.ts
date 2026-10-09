import {
  UI_LANGUAGE_STORAGE_KEY,
  createTranslator,
  resolveLocale,
  type Translate,
} from "@/core/i18n";
import {
  findActiveSegmentIndex,
  toLinesOnly,
  toLinesWithTimestamps,
  type TranscriptLine,
} from "@/core/transcript";
import { findTranscriptPanel, readSegments } from "./transcript-reader";

const STORAGE_FOLLOW_KEY = "ytFollowTime";

let t: Translate = createTranslator(resolveLocale(undefined));
let followTimeEnabled = true;
let activeDropdown: HTMLElement | null = null;
let lastScrolledIndex = -1;
let cachedLines: TranscriptLine[] = [];

const ensureStyles = (): void => {
  if (document.getElementById("meet-trace-yt-style")) return;
  const style = document.createElement("style");
  style.id = "meet-trace-yt-style";
  style.textContent = `
    .meet-trace-yt-menu-trigger {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 32px !important;
      height: 32px !important;
      min-width: 32px !important;
      min-height: 32px !important;
      padding: 0 !important;
      margin: 0 4px !important;
      border: 1px solid rgba(128, 128, 128, 0.25) !important;
      border-radius: 50% !important;
      background: transparent !important;
      color: var(--yt-spec-text-primary, #0f0f0f) !important;
      cursor: pointer !important;
      flex-shrink: 0 !important;
      position: relative !important;
      z-index: 10 !important;
      transition: background-color 0.15s ease, transform 0.1s ease !important;
    }
    html[dark] .meet-trace-yt-menu-trigger,
    [dark] .meet-trace-yt-menu-trigger {
      color: #f1f1f1 !important;
      border-color: rgba(255, 255, 255, 0.2) !important;
    }
    .meet-trace-yt-menu-trigger:hover {
      background-color: var(--yt-spec-badge-chip-background, rgba(128, 128, 128, 0.18)) !important;
      transform: scale(1.05) !important;
    }
    .meet-trace-yt-menu-trigger:active {
      opacity: 0.7 !important;
      transform: scale(0.95) !important;
    }
    .meet-trace-yt-dropdown {
      position: fixed;
      min-width: 210px;
      padding: 8px 0;
      border-radius: 12px;
      background: #ffffff;
      color: #0f0f0f;
      border: 1px solid rgba(0, 0, 0, 0.12);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      z-index: 2147483647;
      font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      font-size: 14px;
      user-select: none;
    }
    html[dark] .meet-trace-yt-dropdown,
    [dark] .meet-trace-yt-dropdown {
      background: #282828 !important;
      color: #f1f1f1 !important;
      border-color: rgba(255, 255, 255, 0.15) !important;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5) !important;
    }
    .meet-trace-yt-menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      cursor: pointer;
      transition: background-color 0.12s ease;
    }
    .meet-trace-yt-menu-item:hover {
      background-color: rgba(128, 128, 128, 0.12);
    }
    .meet-trace-yt-menu-item-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    .meet-trace-yt-menu-item-text {
      flex: 1;
      white-space: nowrap;
    }
    .meet-trace-yt-check-icon {
      color: #065fd4;
    }
    html[dark] .meet-trace-yt-check-icon,
    [dark] .meet-trace-yt-check-icon {
      color: #3ea6ff !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
};

const closeDropdown = (): void => {
  if (activeDropdown) {
    activeDropdown.remove();
    activeDropdown = null;
  }
};

const getVideo = (): HTMLVideoElement | null =>
  document.querySelector<HTMLVideoElement>("video.html5-main-video") ??
  document.querySelector<HTMLVideoElement>("video");

const handleTimeUpdate = (): void => {
  if (!followTimeEnabled) return;
  const panel = findTranscriptPanel();
  if (!panel) return;

  const video = getVideo();
  if (!video || video.paused) return;

  const segments = panel.querySelectorAll(
    "transcript-segment-view-model, ytd-transcript-segment-renderer, [class*='transcript-segment']"
  );
  if (segments.length === 0) return;

  if (cachedLines.length !== segments.length) {
    cachedLines = readSegments(panel);
  }
  if (cachedLines.length === 0) return;

  const activeIndex = findActiveSegmentIndex(cachedLines, video.currentTime);
  if (activeIndex !== -1 && activeIndex !== lastScrolledIndex) {
    lastScrolledIndex = activeIndex;
    const targetSegment = segments[activeIndex];
    if (targetSegment) {
      targetSegment.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
};

const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) return false;
  // Try modern navigator.clipboard.writeText
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn("[Meet Trace] navigator.clipboard.writeText failed, using execCommand fallback:", e);
    }
  }

  // Direct textarea fallback for macOS Chrome
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error("[Meet Trace] execCommand fallback copy also failed:", err);
    return false;
  }
};

const copyTranscript = async (
  itemTextEl: HTMLElement,
  mode: "timestamp" | "text"
): Promise<void> => {
  let lines = readSegments();
  if (lines.length === 0) {
    for (let i = 0; i < 4 && lines.length === 0; i++) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      lines = readSegments();
    }
  }

  if (lines.length === 0) {
    console.warn("[Meet Trace] No transcript lines found to copy");
    const original = itemTextEl.textContent;
    itemTextEl.textContent = t("yt.noTranscript");
    setTimeout(() => {
      itemTextEl.textContent = original;
    }, 1500);
    return;
  }

  const content = mode === "timestamp" ? toLinesWithTimestamps(lines) : toLinesOnly(lines);
  const ok = await copyToClipboard(content);

  if (ok) {
    console.info(`[Meet Trace] Successfully copied ${lines.length} lines to clipboard (${mode})`);
    const original = itemTextEl.textContent;
    itemTextEl.textContent = t("yt.copied");
    setTimeout(() => {
      itemTextEl.textContent = original;
      closeDropdown();
    }, 600);
  } else {
    console.error("[Meet Trace] Failed to copy transcript to clipboard");
    const original = itemTextEl.textContent;
    itemTextEl.textContent = t("overlay.copyAllFailed");
    setTimeout(() => {
      itemTextEl.textContent = original;
    }, 1500);
  }
};

const createDropdownMenu = (triggerBtn: HTMLElement): HTMLElement => {
  const menu = document.createElement("div");
  menu.className = "meet-trace-yt-dropdown";
  menu.setAttribute("role", "menu");

  const rect = triggerBtn.getBoundingClientRect();
  menu.style.top = `${rect.bottom + 6}px`;
  menu.style.right = `${Math.max(8, window.innerWidth - rect.right)}px`;

  // Item 1: Follow Time (Toggle)
  const followItem = document.createElement("div");
  followItem.className = "meet-trace-yt-menu-item";
  followItem.setAttribute("role", "menuitem");
  followItem.setAttribute("tabindex", "0");
  followItem.setAttribute("aria-label", t("yt.followTime"));

  const followIcon = document.createElement("span");
  followIcon.className = "meet-trace-yt-menu-item-icon";
  const renderCheckIcon = () => {
    followIcon.innerHTML = followTimeEnabled
      ? `<svg class="meet-trace-yt-check-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
      : "";
  };
  renderCheckIcon();

  const followText = document.createElement("span");
  followText.className = "meet-trace-yt-menu-item-text";
  followText.textContent = t("yt.followTime");

  followItem.appendChild(followIcon);
  followItem.appendChild(followText);
  followItem.addEventListener("click", (e) => {
    e.stopPropagation();
    followTimeEnabled = !followTimeEnabled;
    renderCheckIcon();
    try {
      chrome.storage.local.set({ [STORAGE_FOLLOW_KEY]: followTimeEnabled }).catch(() => {});
    } catch {}
    if (followTimeEnabled) {
      lastScrolledIndex = -1;
      handleTimeUpdate();
    }
  });

  // Item 2: Copy with timestamps
  const tsItem = document.createElement("div");
  tsItem.className = "meet-trace-yt-menu-item";
  tsItem.setAttribute("role", "menuitem");
  tsItem.setAttribute("tabindex", "0");
  tsItem.setAttribute("aria-label", t("yt.copyWithTimestamps"));

  const tsIcon = document.createElement("span");
  tsIcon.className = "meet-trace-yt-menu-item-icon";
  tsIcon.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  const tsText = document.createElement("span");
  tsText.className = "meet-trace-yt-menu-item-text";
  tsText.textContent = t("yt.copyWithTimestamps");

  tsItem.appendChild(tsIcon);
  tsItem.appendChild(tsText);
  tsItem.addEventListener("click", (e) => {
    e.stopPropagation();
    void copyTranscript(tsText, "timestamp");
  });

  // Item 3: Copy plain text
  const textItem = document.createElement("div");
  textItem.className = "meet-trace-yt-menu-item";
  textItem.setAttribute("role", "menuitem");
  textItem.setAttribute("tabindex", "0");
  textItem.setAttribute("aria-label", t("yt.copyTextOnly"));

  const textIcon = document.createElement("span");
  textIcon.className = "meet-trace-yt-menu-item-icon";
  textIcon.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;

  const textText = document.createElement("span");
  textText.className = "meet-trace-yt-menu-item-text";
  textText.textContent = t("yt.copyTextOnly");

  textItem.appendChild(textIcon);
  textItem.appendChild(textText);
  textItem.addEventListener("click", (e) => {
    e.stopPropagation();
    void copyTranscript(textText, "text");
  });

  menu.appendChild(followItem);
  menu.appendChild(tsItem);
  menu.appendChild(textItem);

  return menu;
};

const toggleDropdown = (triggerBtn: HTMLElement, event: MouseEvent): void => {
  event.stopPropagation();
  if (activeDropdown) {
    closeDropdown();
    return;
  }
  const dropdown = createDropdownMenu(triggerBtn);
  document.body.appendChild(dropdown);
  activeDropdown = dropdown;
};

/** Finds the insertion point for the menu button: immediately to the left of the close button ('✕'). */
export const findInsertionPoint = (panel: Element): { container: Element; insertBeforeNode: Element } | null => {
  // Find close button anywhere inside panel
  const closeBtn =
    panel.querySelector('#visibility-button') ??
    panel.querySelector('button[aria-label*="關閉"], button[aria-label*="Close"]') ??
    panel.querySelector('yt-icon-button[aria-label*="關閉"], yt-icon-button[aria-label*="Close"]') ??
    panel.querySelector('#visibility-button button') ??
    panel.querySelector('ytd-engagement-panel-title-header-renderer button');

  if (closeBtn) {
    // If inside or is #visibility-button, insert before #visibility-button
    const visWrapper = closeBtn.id === "visibility-button" ? closeBtn : closeBtn.closest("#visibility-button");
    if (visWrapper?.parentElement) {
      return { container: visWrapper.parentElement, insertBeforeNode: visWrapper };
    }

    // If inside a custom element button wrapper (ytd-button-renderer or yt-icon-button)
    const buttonRenderer = closeBtn.closest('ytd-button-renderer');
    if (buttonRenderer?.parentElement) {
      return { container: buttonRenderer.parentElement, insertBeforeNode: buttonRenderer };
    }
    const iconBtn = closeBtn.closest('yt-icon-button');
    if (iconBtn?.parentElement) {
      return { container: iconBtn.parentElement, insertBeforeNode: iconBtn };
    }

    // Direct parent
    if (closeBtn.parentElement) {
      return { container: closeBtn.parentElement, insertBeforeNode: closeBtn };
    }
  }

  // Fallback: standard header container
  const header =
    panel.querySelector('ytd-engagement-panel-title-header-renderer #header') ??
    panel.querySelector('ytd-engagement-panel-title-header-renderer') ??
    panel.querySelector('[id="header"]');
  if (header) {
    return { container: header, insertBeforeNode: header.lastElementChild ?? header };
  }

  return null;
};

export const injectTranscriptButtons = (): boolean => {
  const panel = findTranscriptPanel();
  if (!panel) return false;

  // If button is already injected in this panel, ensure it is still connected
  const existing = panel.querySelector(".meet-trace-yt-menu-trigger");
  if (existing && existing.isConnected) return true;

  ensureStyles();

  const target = findInsertionPoint(panel);
  if (!target) return false;

  const triggerBtn = document.createElement("button");
  triggerBtn.type = "button";
  triggerBtn.className = "meet-trace-yt-menu-trigger";
  triggerBtn.setAttribute("aria-label", t("yt.title"));
  triggerBtn.title = t("yt.title");
  triggerBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
  `;

  triggerBtn.addEventListener("click", (e) => toggleDropdown(triggerBtn, e));

  target.container.insertBefore(triggerBtn, target.insertBeforeNode);
  console.info("[Meet Trace] Successfully injected transcript options menu into header");
  return true;
};

export const startTranscriptButtons = (): void => {
  console.info("[Meet Trace] YouTube transcript module started on", location.href);

  try {
    chrome.storage.local
      .get([UI_LANGUAGE_STORAGE_KEY, STORAGE_FOLLOW_KEY])
      .then((res) => {
        t = createTranslator(resolveLocale(res[UI_LANGUAGE_STORAGE_KEY]));
        if (typeof res[STORAGE_FOLLOW_KEY] === "boolean") {
          followTimeEnabled = res[STORAGE_FOLLOW_KEY];
        }
      })
      .catch(() => {});

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local") {
        if (UI_LANGUAGE_STORAGE_KEY in changes) {
          t = createTranslator(resolveLocale(changes[UI_LANGUAGE_STORAGE_KEY].newValue));
        }
        if (STORAGE_FOLLOW_KEY in changes && typeof changes[STORAGE_FOLLOW_KEY].newValue === "boolean") {
          followTimeEnabled = changes[STORAGE_FOLLOW_KEY].newValue;
        }
      }
    });
  } catch {}

  // Dismiss dropdown on window click / scroll / esc
  window.addEventListener(
    "click",
    (e) => {
      if (!activeDropdown) return;
      const target = e.target as Node | null;
      // Do not close if click was inside activeDropdown
      if (target && activeDropdown.contains(target)) return;
      // Do not close if clicking the trigger button (toggleDropdown handles it)
      if (target && (target as Element).closest?.(".meet-trace-yt-menu-trigger")) return;
      closeDropdown();
    },
    true
  );

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });

  // Video timeupdate for Follow Time
  const bindVideo = () => {
    const video = getVideo();
    if (!video) return;
    video.removeEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("timeupdate", handleTimeUpdate);
  };

  let timer: ReturnType<typeof setTimeout> | null = null;
  const queueInject = () => {
    bindVideo();
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      injectTranscriptButtons();
    }, 100);
  };

  // Immediate attempt
  queueInject();

  // Periodic polling every 800ms to guarantee injection regardless of DOM event quirks
  setInterval(() => {
    if (location.pathname === "/watch") {
      queueInject();
    }
  }, 800);

  // Trigger on user clicks anywhere (e.g. clicking "Show transcript" button)
  document.addEventListener("click", () => queueInject(), true);

  // YouTube navigation events
  window.addEventListener("yt-navigate-finish", () => {
    cachedLines = [];
    lastScrolledIndex = -1;
    closeDropdown();
    queueInject();
  });
  window.addEventListener("yt-page-data-updated", queueInject);

  // Full mutation observer without restrictive attribute filter
  const observer = new MutationObserver(queueInject);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};
