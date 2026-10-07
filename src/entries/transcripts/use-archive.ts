import { useMemo, useState } from "react";
import { appToast } from "@/ui-kit/notify";
import { useI18n } from "@/ui-kit/i18n-provider";
import type { MeetingSession } from "./sections";
import { requestHistoryClear, requestSessionDelete, requestTitleUpdate } from "./bridge";
import { useConfirm } from "./kit";
import { useHistoryStorage } from "./use-archive-data";

const matchesQuery = (session: MeetingSession, query: string): boolean =>
  session.meetingCode.toLowerCase().includes(query) ||
  Boolean(session.title?.toLowerCase().includes(query)) ||
  session.captions.some(
    (caption) =>
      caption.speaker.toLowerCase().includes(query) ||
      caption.text.toLowerCase().includes(query) ||
      Boolean(caption.translation?.toLowerCase().includes(query))
  );

/** State and actions for the meeting history screen. */
export const useHistory = () => {
  const { t } = useI18n();
  const confirm = useConfirm();
  const storage = useHistoryStorage();
  const { sessions, setSessions, loadStorageInfo } = storage;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedSession = sessions.find((session) => session.id === selectedId) ?? null;

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query ? sessions.filter((session) => matchesQuery(session, query)) : sessions;
  }, [sessions, searchQuery]);

  const deleteSession = async (sessionId: string) => {
    const confirmed = await confirm({
      title: t("history.deleteConfirmTitle"),
      message: t("history.deleteConfirmBody"),
      confirmLabel: t("history.delete"),
      cancelLabel: t("history.cancel"),
    });
    if (!confirmed) return;
    try {
      await requestSessionDelete(sessionId);
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));
      if (selectedId === sessionId) setSelectedId(null);
      appToast.success(t("history.toastDeleted"));
      void loadStorageInfo();
    } catch {
      appToast.error(t("history.toastDeleteFailed"));
    }
  };

  const clearAllHistory = async () => {
    const confirmed = await confirm({
      title: t("history.clearConfirmTitle"),
      message: t("history.clearConfirmBody"),
      confirmLabel: t("history.delete"),
      cancelLabel: t("history.cancel"),
    });
    if (!confirmed) return;
    try {
      await requestHistoryClear();
      setSessions([]);
      setSelectedId(null);
      appToast.success(t("history.toastCleared"));
      void loadStorageInfo();
    } catch {
      appToast.error(t("history.toastClearFailed"));
    }
  };

  const renameSession = async (sessionId: string, title: string) => {
    try {
      await requestTitleUpdate(sessionId, title);
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, title: title || undefined } : session
        )
      );
      appToast.success(t("history.toastRenamed"));
    } catch {
      appToast.error(t("history.toastRenameFailed"));
    }
  };

  return {
    ...storage,
    selectedSession,
    selectSession: setSelectedId,
    searchQuery,
    setSearchQuery,
    filteredSessions,
    deleteSession,
    clearAllHistory,
    renameSession,
  };
};
