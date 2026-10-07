import { useI18n } from "@/ui-kit/i18n-provider";
import { GroupedSection } from "../kit";
import { EmptyState } from "./empty-state";
import type { SavedCaption } from "./records";

type Props = { captions: SavedCaption[] };

/** Captions as a single column: speaker, original text, then translation. */
export const CaptionTranscript = ({ captions }: Props) => {
  const { t } = useI18n();
  if (captions.length === 0) return <EmptyState icon={null} title={t("history.noCaptions")} />;

  return (
    <GroupedSection>
      <ol>
        {captions.map((caption, index) => (
          <li key={`${caption.timestamp}-${index}`} className="border-b border-(--ms-app-border) px-4 py-3 last:border-b-0">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="truncate text-[13px] font-semibold text-(--ms-positive)">{caption.speaker}</span>
              <time className="shrink-0 text-[12px] text-(--ms-app-text-secondary) tabular-nums">{caption.time}</time>
            </div>
            <p className="text-[15px] leading-[22px] text-(--ms-app-text)">{caption.text}</p>
            {caption.translation && (
              <p className="mt-1.5 border-l-2 border-(--ms-primary)/60 pl-2.5 text-[15px] leading-[22px] text-(--ms-app-text-emphasis)">
                {caption.translation}
              </p>
            )}
          </li>
        ))}
      </ol>
    </GroupedSection>
  );
};
