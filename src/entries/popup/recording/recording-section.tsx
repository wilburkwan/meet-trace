import { useEffect, useState } from "react";
import { RecordIcon } from "@phosphor-icons/react";
import { useI18n } from "@/ui-kit/i18n-provider";
import { RecordingControl } from "./recording-control";

// Chrome can capture ordinary web pages, not its own chrome:// pages or the Web Store.
const isCapturableUrl = (url?: string): boolean =>
  Boolean(url && /^https?:\/\//.test(url) && !url.startsWith("https://chromewebstore.google.com"));

/** Popup card for recording the current tab (any website) and the user's mic. */
export const RecordingSection = () => {
  const { t } = useI18n();
  const [tabId, setTabId] = useState<number | null>(null);

  useEffect(() => {
    void chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id !== undefined && isCapturableUrl(tab.url)) setTabId(tab.id);
    });
  }, []);

  if (tabId === null) return null;

  return (
    <section className="rounded-lg bg-(--ms-app-surface) p-3.5">
      <div className="mb-3 flex items-center gap-2">
        <RecordIcon className="size-6 shrink-0 text-red-500" weight="fill" />
        <h2 className="text-lg leading-5 font-medium">{t("settings.recordingTitle")}</h2>
      </div>
      <RecordingControl tabId={tabId} />
    </section>
  );
};
