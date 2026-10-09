import { useEffect, useState } from "react";
import { CheckCircleIcon, PlayIcon, VideoCameraIcon } from "@phosphor-icons/react";
import { isMeetingTabUrl, type PanelStatus } from "@/core/panel-messages";
import { useI18n } from "@/ui-kit/i18n-provider";

type State =
  | { kind: "hidden" }
  | { kind: "inactive"; tabId: number }
  | { kind: "active"; tabId: number }
  | { kind: "unreachable" };

/** Popup card on a meeting tab: shows whether Meet Trace runs there and starts it. */
export const MeetingSection = () => {
  const { t } = useI18n();
  const [state, setState] = useState<State>({ kind: "hidden" });

  useEffect(() => {
    void (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id === undefined || !isMeetingTabUrl(tab.url)) return;
      try {
        const status: PanelStatus = await chrome.tabs.sendMessage(tab.id, { action: "msPanelStatus" });
        setState(status.active ? { kind: "active", tabId: tab.id } : { kind: "inactive", tabId: tab.id });
      } catch {
        setState({ kind: "unreachable" }); // tab opened before the extension loaded
      }
    })();
  }, []);

  if (state.kind === "hidden") return null;

  const start = async () => {
    if (state.kind !== "inactive") return;
    await chrome.tabs.sendMessage(state.tabId, { action: "msPanelStart" });
    setState({ kind: "active", tabId: state.tabId });
    window.close(); // let the user see the caption window on the page
  };

  return (
    <section className="rounded-lg bg-(--ms-app-surface) p-3.5">
      <div className="mb-2 flex items-center gap-2">
        <VideoCameraIcon className="size-6 shrink-0 text-(--ms-positive)" weight="fill" />
        <h2 className="text-lg leading-5 font-medium">{t("popup.meetingTitle")}</h2>
      </div>
      {state.kind === "active" ? (
        <p className="flex items-center gap-1.5 text-xs leading-4.5 text-(--ms-app-text-secondary)">
          <CheckCircleIcon className="size-4 shrink-0 text-emerald-400" weight="fill" />
          {t("popup.panelActive")}
        </p>
      ) : state.kind === "unreachable" ? (
        <p className="text-xs leading-4.5 text-(--ms-app-text-secondary)">{t("popup.reloadMeeting")}</p>
      ) : (
        <>
          <p className="mb-3 text-xs leading-4.5 text-(--ms-app-text-secondary)">{t("popup.panelInactive")}</p>
          <button
            type="button"
            onClick={() => void start()}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-(--ms-primary) text-sm font-medium text-white transition-colors hover:bg-(--ms-primary-hover)"
          >
            <PlayIcon className="size-4" weight="fill" />
            {t("popup.startHere")}
          </button>
        </>
      )}
    </section>
  );
};
