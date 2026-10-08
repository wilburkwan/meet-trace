import { useEffect, useState } from "react";
import { HISTORY_QUOTA_BYTES } from "@/core/constants";
import { appToast } from "@/ui-kit/notify";
import { useI18n } from "@/ui-kit/i18n-provider";
import type { MeetingSession } from "./sections";
import { STORAGE_WARNING_RATIO } from "./limits";
import { downloadHistoryBackup, parseHistoryBackup } from "./backup-file";
import { fetchMeetingHistory, fetchStorageInfo, requestHistoryImport } from "./bridge";
import type { StorageInfo } from "./bridge";

/** Loads meeting history and storage usage; handles backup and restore. */
export const useHistoryStorage = () => {
  const { t } = useI18n();
  const [sessions, setSessions] = useState<MeetingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    bytesUsed: 0,
    quota: HISTORY_QUOTA_BYTES,
  });

  const loadHistory = async () => {
    setIsLoading(true);
    setHasLoadError(false);
    try {
      setSessions(await fetchMeetingHistory());
    } catch {
      setHasLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await fetchStorageInfo();
      setStorageInfo(info);
      if (info.quota > 0 && info.bytesUsed / info.quota >= STORAGE_WARNING_RATIO) {
        appToast.warning(t("history.toastStorageWarning"), { id: "storage-warning" });
      }
    } catch {
      // History stays usable when storage metrics are unavailable.
    }
  };

  const exportAllHistory = async () => {
    try {
      downloadHistoryBackup(await fetchMeetingHistory());
      appToast.success(t("history.toastBackedUp"));
    } catch {
      appToast.error(t("history.toastBackupFailed"));
    }
  };

  const restoreHistoryBackup = async (file: File) => {
    try {
      await requestHistoryImport(await parseHistoryBackup(file));
      await Promise.all([loadHistory(), loadStorageInfo()]);
      appToast.success(t("history.toastRestored"));
    } catch {
      appToast.error(t("history.toastRestoreFailed"));
    }
  };

  useEffect(() => {
    void loadHistory();
    void loadStorageInfo();
  }, []);

  return {
    sessions,
    setSessions,
    isLoading,
    hasLoadError,
    storageInfo,
    loadHistory,
    loadStorageInfo,
    exportAllHistory,
    restoreHistoryBackup,
  };
};
