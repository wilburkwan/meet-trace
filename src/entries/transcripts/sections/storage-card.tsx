import { useI18n } from "@/ui-kit/i18n-provider";
import { STORAGE_WARNING_RATIO } from "../limits";
import { formatBytes } from "../format";
import { GroupedSection } from "../kit";

type Props = {
  bytesUsed: number;
  quota: number;
};

/** iOS Settings-style storage meter with a contextual footnote. */
export const StorageCard = ({ bytesUsed, quota }: Props) => {
  const { t } = useI18n();
  const ratio = quota > 0 ? Math.min(bytesUsed / quota, 1) : 0;
  const isFull = ratio >= 0.99;
  const isWarning = ratio >= STORAGE_WARNING_RATIO;
  const barClass = isFull ? "bg-(--ms-danger)" : isWarning ? "bg-amber-400" : "bg-(--ms-primary)";
  const footer = isFull
    ? t("history.storageFull")
    : isWarning
      ? t("history.storageAlmostFull")
      : undefined;

  return (
    <GroupedSection header={t("history.storage")} footer={footer}>
      <div className="px-4 py-3.5">
        <div className="mb-2.5 flex items-baseline justify-between text-[15px]">
          <span>{t("history.storageUsed", { used: formatBytes(bytesUsed), quota: formatBytes(quota) })}</span>
          <span className="text-(--ms-app-text-secondary)">{Math.round(ratio * 100)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-(--ms-secondary)">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${barClass}`}
            style={{ width: `${Math.max(ratio * 100, ratio > 0 ? 1 : 0)}%` }}
          />
        </div>
      </div>
    </GroupedSection>
  );
};
