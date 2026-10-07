import { ClosedCaptioningIcon, TranslateIcon } from "@phosphor-icons/react";
import { useI18n } from "@/ui-kit/i18n-provider";
import { MeetingSection } from "./meeting/meeting-section";
import { YouTubeSection } from "./youtube/youtube-section";

export default function App() {
  const { t } = useI18n();
  const openSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <main className="flex w-79.5 flex-col gap-5 bg-(--ms-app-canvas) p-5 text-(--ms-app-text) shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <header className="flex flex-col gap-0.5">
        <h1 className="flex items-center gap-2 text-2xl leading-7 font-semibold">
          <img src="/logo-48.png" alt="" className="size-8 rounded-lg" />
          Meet Trace
        </h1>
        <p className="text-xs leading-4.5 text-(--ms-app-text-secondary)">
          {t("popup.subtitle")}
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <MeetingSection />
        <YouTubeSection />

        <section className="rounded-lg bg-(--ms-app-surface) p-3.5">
          <div className="flex items-start gap-3">
            <ClosedCaptioningIcon className="mt-0.5 size-6 shrink-0" weight="regular" />
            <div>
              <h2 className="mb-1 text-lg leading-5 font-medium">{t("popup.getCaptions")}</h2>
              <p className="text-xs leading-4.5 text-(--ms-app-text-secondary)">
                {t("popup.captionsStep")}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-(--ms-app-surface) p-3.5">
          <div className="flex items-start gap-3">
            <TranslateIcon className="mt-0.5 size-6 shrink-0" weight="regular" />
            <div>
              <h2 className="mb-1.5 text-lg leading-5 font-medium">{t("popup.getTranslations")}</h2>
              <ol className="list-inside list-decimal space-y-1.5 text-xs leading-4.5 text-(--ms-app-text-secondary)">
                <li>{t("popup.translationStep1")}</li>
                <li>{t("popup.translationStep2")}</li>
              </ol>
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={openSettings}
          className="flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-(--ms-primary) text-sm font-medium transition-colors hover:bg-(--ms-primary-hover)"
        >
          <span>{t("popup.openSettings")}</span>
        </button>
        <button
          onClick={() =>
            chrome.tabs.create({ url: chrome.runtime.getURL("transcripts.html") })
          }
          className="flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-(--ms-secondary) text-sm font-medium transition-colors hover:bg-(--ms-secondary-hover)"
        >
          <span>{t("popup.viewHistory")}</span>
        </button>
      </div>
    </main>
  );
}
