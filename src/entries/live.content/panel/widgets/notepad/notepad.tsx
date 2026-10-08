import { useNotesPanel } from "./use-notepad";
import { t } from "@live/i18n";

export const NotesPanel = () => {
  const { notes, handleChange } = useNotesPanel();

  return (
    <aside className="flex w-[32%] min-w-44 shrink-0 flex-col border-l border-(--ms-overlay-border)">
      <h2 className="px-4 pt-3 pb-2 text-xs font-semibold text-white">{t("ui.notesTitle")}</h2>
      <textarea
        aria-label={t("ui.notesTitle")}
        value={notes}
        onChange={handleChange}
        placeholder={t("ui.notesPlaceholder")}
        className="ms-content-scroll min-h-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-4 pb-4 text-sm leading-5 text-(--ms-overlay-caption) outline-none placeholder:text-(--ms-overlay-muted)"
      />
    </aside>
  );
};
