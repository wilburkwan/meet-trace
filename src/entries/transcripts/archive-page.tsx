import { useEffect } from "react";
import { AppToaster } from "@/ui-kit/toaster-host";
import { useI18n } from "@/ui-kit/i18n-provider";
import { HistoryListScreen, SessionDetail } from "./sections";
import { useHistory } from "./use-archive";

/** Meeting history: a list screen and a detail screen, iOS navigation style. */
export default function App() {
  const { t } = useI18n();
  const history = useHistory();
  const { selectedSession } = history;

  useEffect(() => {
    document.title = t("history.pageTitle");
  }, [t]);

  // Start each screen at the top, like a navigation push/pop.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [selectedSession?.id]);

  return (
    <main className="min-h-screen bg-(--ms-app-canvas) text-(--ms-app-text)">
      <AppToaster position="bottom-center" />
      <div className="mx-auto w-full max-w-170 px-5 pb-10">
        {history.isLoading ? (
          <div className="flex min-h-screen items-center justify-center text-(--ms-app-text-secondary)">
            {t("common.loading")}
          </div>
        ) : selectedSession ? (
          <SessionDetail
            key={selectedSession.id}
            session={selectedSession}
            onBack={() => history.selectSession(null)}
            onDelete={() => void history.deleteSession(selectedSession.id)}
            onRename={(title) => void history.renameSession(selectedSession.id, title)}
          />
        ) : (
          <HistoryListScreen
            sessions={history.sessions}
            filteredSessions={history.filteredSessions}
            hasLoadError={history.hasLoadError}
            searchQuery={history.searchQuery}
            bytesUsed={history.storageInfo.bytesUsed}
            quota={history.storageInfo.quota}
            onSearchChange={history.setSearchQuery}
            onSelect={history.selectSession}
            onRetry={() => void history.loadHistory()}
            onBackup={() => void history.exportAllHistory()}
            onRestore={(file) => void history.restoreHistoryBackup(file)}
            onClear={() => void history.clearAllHistory()}
          />
        )}
      </div>
    </main>
  );
}
