import { useEffect, useState } from "react";
import { WarningCircleIcon } from "@phosphor-icons/react";
import type { RecordingRequest, RecordingStatus } from "@/core/recording";
import { listRecordingDbs } from "@/core/recording-db";
import { useI18n } from "@/ui-kit/i18n-provider";

type Props = { status: RecordingStatus };

/**
 * Safety net: recordings whose save tab never appeared (or was closed early)
 * stay on disk until saved; this lists them with a Save button.
 */
export const UnsavedNotice = ({ status }: Props) => {
  const { t } = useI18n();
  const [count, setCount] = useState(0);
  const activeDb = status.recording ? status.dbName : null;

  useEffect(() => {
    void listRecordingDbs()
      .then((names) => setCount(names.filter((name) => name !== activeDb).length))
      .catch(() => setCount(0));
  }, [activeDb]);

  if (count === 0) return null;

  const saveAll = () => {
    const request: RecordingRequest = { action: "recSaveLeftovers" };
    void chrome.runtime.sendMessage(request);
    setCount(0);
  };

  return (
    <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-400/10 px-3 py-2">
      <WarningCircleIcon className="size-4.5 shrink-0 text-amber-400" weight="fill" />
      <span className="flex-1 text-xs leading-4.5">{t("popup.unsavedRecordings", { count })}</span>
      <button
        type="button"
        onClick={saveAll}
        className="shrink-0 cursor-pointer rounded-md bg-(--ms-primary) px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-(--ms-primary-hover)"
      >
        {t("popup.saveNow")}
      </button>
    </div>
  );
};
