import { useState } from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { useI18n } from "@/ui-kit/i18n-provider";

type Props = {
  title: string;
  subtitle: string;
  currentTitle?: string;
  onRename: (title: string) => void;
};

/** Large meeting title that can be renamed inline. */
export const SessionTitle = ({ title, subtitle, currentTitle, onRename }: Props) => {
  const { t } = useI18n();
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const next = draft.trim();
    if (next !== (currentTitle ?? "")) onRename(next);
    setDraft(null);
  };

  return (
    <header className="mt-3 mb-5">
      {draft === null ? (
        <div className="group flex items-start gap-2">
          <h1 className="text-[28px] leading-[34px] font-bold tracking-[-0.02em] break-words">{title}</h1>
          <button
            type="button"
            aria-label={t("history.editTitle")}
            title={t("history.editTitle")}
            onClick={() => setDraft(currentTitle ?? "")}
            className="mt-1.5 shrink-0 cursor-pointer rounded-full p-1.5 text-(--ms-positive) opacity-60 transition-opacity group-hover:opacity-100 hover:bg-white/8"
          >
            <PencilSimpleIcon className="size-4.5" />
          </button>
        </div>
      ) : (
        <input
          autoFocus
          value={draft}
          placeholder={t("history.titlePlaceholder")}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
            if (event.key === "Escape") setDraft(null);
          }}
          className="w-full rounded-[10px] bg-(--ms-secondary) px-3 py-1.5 text-[24px] font-bold text-(--ms-app-text) focus:outline-none focus:ring-2 focus:ring-(--ms-primary)"
        />
      )}
      <p className="mt-1 text-[15px] text-(--ms-app-text-secondary)">{subtitle}</p>
    </header>
  );
};
