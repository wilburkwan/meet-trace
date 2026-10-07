import { ClosedCaptioningIcon, GearSixIcon, MagnifyingGlassIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useI18n } from "@/ui-kit/i18n-provider";
import { LargeTitle, NavBar, SearchField } from "../kit";
import { DataSection } from "./data-section";
import { EmptyState } from "./empty-state";
import { SessionList } from "./meeting-list";
import { StorageCard } from "./storage-card";
import type { MeetingSession } from "./records";

type Props = {
  sessions: MeetingSession[];
  filteredSessions: MeetingSession[];
  hasLoadError: boolean;
  searchQuery: string;
  bytesUsed: number;
  quota: number;
  onSearchChange: (query: string) => void;
  onSelect: (sessionId: string) => void;
  onRetry: () => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  onClear: () => void;
};

const openSettings = () => void chrome.runtime.sendMessage({ action: "openOptions" });

/** Meeting list: search, day-grouped meetings, storage and data management. */
export const HistoryListScreen = (props: Props) => {
  const { t } = useI18n();
  const { sessions, filteredSessions, searchQuery } = props;
  const count = sessions.length;

  const renderContent = () => {
    if (props.hasLoadError) {
      return (
        <EmptyState
          icon={<WarningCircleIcon className="size-12" />}
          title={t("history.loadFailed")}
          action={
            <button type="button" onClick={props.onRetry} className="cursor-pointer rounded-full bg-(--ms-primary) px-5 py-2 text-[15px] font-semibold text-white hover:bg-(--ms-primary-hover)">
              {t("history.retry")}
            </button>
          }
        />
      );
    }
    if (filteredSessions.length === 0) {
      return searchQuery ? (
        <EmptyState icon={<MagnifyingGlassIcon className="size-12" />} title={t("history.noResultsTitle")} message={t("history.noResultsHint")} />
      ) : (
        <EmptyState icon={<ClosedCaptioningIcon className="size-12" />} title={t("history.emptyTitle")} message={t("history.emptyHint")} />
      );
    }
    return <SessionList sessions={filteredSessions} onSelect={props.onSelect} />;
  };

  return (
    <>
      <NavBar
        trailing={
          <button type="button" aria-label={t("history.settings")} title={t("history.settings")} onClick={openSettings} className="flex size-9 cursor-pointer items-center justify-center rounded-full text-(--ms-positive) hover:bg-white/8">
            <GearSixIcon className="size-5.5" />
          </button>
        }
      />
      <LargeTitle>{t("history.title")}</LargeTitle>
      <SearchField value={searchQuery} placeholder={t("history.searchPlaceholder")} onChange={props.onSearchChange} />
      {count > 0 && !searchQuery && (
        <p className="-mt-3 mb-4 px-1 text-[13px] text-(--ms-app-text-secondary)">
          {count === 1 ? t("history.countOne") : t("history.count", { count })}
        </p>
      )}
      {renderContent()}
      <StorageCard bytesUsed={props.bytesUsed} quota={props.quota} />
      <DataSection hasHistory={count > 0} onBackup={props.onBackup} onRestore={props.onRestore} onClear={props.onClear} />
    </>
  );
};
