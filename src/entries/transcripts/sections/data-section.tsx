import { useRef } from "react";
import { DownloadSimpleIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { useI18n } from "@/ui-kit/i18n-provider";
import { GroupedSection, IconTile, ListRow } from "../kit";

type Props = {
  hasHistory: boolean;
  onBackup: () => void;
  onRestore: (file: File) => void;
  onClear: () => void;
};

/** Backup, restore and delete-all rows. */
export const DataSection = ({ hasHistory, onBackup, onRestore, onClear }: Props) => {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <GroupedSection header={t("history.data")}>
      {hasHistory && (
        <ListRow
          icon={<IconTile><DownloadSimpleIcon className="size-4.5" weight="bold" /></IconTile>}
          title={t("history.backup")}
          onClick={onBackup}
        />
      )}
      <ListRow
        icon={<IconTile tone="neutral"><UploadSimpleIcon className="size-4.5" weight="bold" /></IconTile>}
        title={t("history.restore")}
        onClick={() => fileInputRef.current?.click()}
      />
      {hasHistory && (
        <ListRow
          icon={<IconTile tone="danger"><TrashIcon className="size-4.5" weight="bold" /></IconTile>}
          title={t("history.clearAll")}
          destructive
          onClick={onClear}
        />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onRestore(file);
          event.target.value = "";
        }}
      />
    </GroupedSection>
  );
};
