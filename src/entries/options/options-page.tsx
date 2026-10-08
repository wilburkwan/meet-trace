import { AppToaster } from "@/ui-kit/toaster-host";
import { useI18n } from "@/ui-kit/i18n-provider";
import {
  AutoCaptionsCard,
  AutoPanelCard,
  LanguageSelect,
  SegmentSettings,
  ThemePicker,
  TranslationSetup,
} from "./cards";

const openHistory = () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("transcripts.html") });
};

export default function App() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-(--ms-app-canvas) text-(--ms-app-text)">
      <AppToaster />

      <div className="mx-auto max-w-2xl px-6 py-12">
        <header className="mb-8 flex items-center justify-between gap-8">
          <div>
            <h1 className="mb-2 flex items-center gap-3 text-[30px] leading-8 font-semibold">
              <img src="/logo-128.png" alt="" className="size-10" />
              {t("settings.title")}
            </h1>
            <p className="text-sm leading-5 text-(--ms-app-text-secondary)">
              {t("settings.subtitle")}
            </p>
          </div>
          <button
            onClick={openHistory}
            className="shrink-0 cursor-pointer text-sm text-white transition-colors hover:text-(--ms-positive)"
          >
            <span className="inline-flex items-center gap-1.5">
              {t("settings.viewHistory")}
            </span>
          </button>
        </header>

        <div className="space-y-6">
          <AutoPanelCard />
          <AutoCaptionsCard />
          <TranslationSetup />
          <SegmentSettings />
          <LanguageSelect />
          <ThemePicker />

        </div>
      </div>
    </main>
  );
}
