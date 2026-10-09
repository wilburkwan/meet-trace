import type { Caption } from "@live/models";
import {
  ArrowsClockwiseIcon,
  CheckIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { t } from "@live/i18n";
import { TranslationEditor } from "../translation-input";
import { ModelDownloadButton } from "./model-download-button";
import type { CopyTarget, TranslationTone } from "./use-line-row";

/** Where a segment sits in a same-speaker block ("single" = not grouped). */
export type BlockPosition = "single" | "first" | "middle" | "last";

type Props = {
  caption: Caption;
  position: BlockPosition;
  isTranslationEnabled: boolean;
  isEditing: boolean;
  copiedTarget: CopyTarget | null;
  translationText: string;
  translationTone: TranslationTone;
  isLoading: boolean;
  isReloadVisible: boolean;
  onCancelEditing: () => void;
  onCopyOriginal: () => void;
  onCopyTranslation: () => void;
  onManualTranslate: () => void;
  onRetranslate: () => void;
  onSaveTranslation: (value: string) => void;
  onStartEditing: () => void;
};

const actionClass =
  "cursor-pointer rounded border-0 bg-transparent px-1.5 py-0.5 text-xs text-slate-500 transition hover:bg-white/10 hover:text-white";

// Shared hover highlight for a sentence and its translation.
const PAIR_HIGHLIGHT = "group-hover/pair:bg-(--ms-primary)/25";

const translationToneClass: Record<TranslationTone, string> = {
  default: "text-(--ms-overlay-translation) italic",
  refining: "text-(--ms-positive) italic",
  error: "text-red-400 not-italic",
};

const POSITION_CLASS: Record<BlockPosition, string> = {
  single: "border-b py-2",
  first: "pt-2 pb-0.5",
  middle: "py-0.5",
  last: "border-b pt-0.5 pb-2",
};

export const CaptionItem = ({
  caption,
  position,
  isTranslationEnabled,
  isEditing,
  copiedTarget,
  translationText,
  translationTone,
  isLoading,
  isReloadVisible,
  onCancelEditing,
  onCopyOriginal,
  onCopyTranslation,
  onManualTranslate,
  onRetranslate,
  onSaveTranslation,
  onStartEditing,
}: Props) => (
  <article
    data-caption-id={caption.id}
    className={`ms-caption-enter relative flex flex-col gap-1 border-(--ms-overlay-border) px-2 last:border-b-0 ${POSITION_CLASS[position]}`}
  >
    {/* Speaker and time share one compact line (once per speaker block) */}
    {(position === "single" || position === "first") && (
    <div className="flex items-baseline gap-2 leading-4">
      <span className="truncate text-[11px] font-semibold text-(--ms-positive)">{caption.speaker}</span>
      <time className="shrink-0 text-[10px] text-slate-500 tabular-nums">{caption.time}</time>
      {isTranslationEnabled && (
        <button
          type="button"
          className={`${actionClass} ml-auto text-(--ms-overlay-translation)`}
          title={t("ui.translate")}
          onClick={onManualTranslate}
        >
          {t("ui.translate")}
        </button>
      )}
    </div>
    )}

    <div
      // group/pair: hovering either line highlights the original and its translation together
      className="group/pair flex flex-col gap-0.5"
    >
      <button
        type="button"
        title={t("ui.copyHint")}
        onDoubleClick={onCopyOriginal}
        className={`-mx-1 cursor-pointer rounded border-0 bg-transparent px-1 py-0 text-left leading-[1.45] text-zinc-200 transition-colors ${PAIR_HIGHLIGHT} ${
          copiedTarget === "original" ? "bg-green-400/15" : ""
        }`}
      >
        {caption.text}
      </button>

      {isTranslationEnabled && (
        // Translation sits under the original, marked by a thin accent bar
        <div className="flex items-start gap-1 border-l-2 border-(--ms-overlay-translation)/40 pl-2">
          {isEditing ? (
            <TranslationEditor
              initialValue={caption.translation}
              onSave={onSaveTranslation}
              onCancel={onCancelEditing}
            />
          ) : (
            <button
              type="button"
              title={caption.translationError || t("ui.editHint")}
              onClick={onStartEditing}
              onDoubleClick={onCopyTranslation}
              className={`-mx-1 min-w-0 flex-1 cursor-pointer rounded border-0 bg-transparent px-1 py-0 text-left leading-[1.45] transition-colors ${PAIR_HIGHLIGHT} ${
                translationToneClass[translationTone]
              } ${copiedTarget === "translation" ? "bg-green-400/15" : ""}`}
            >
              {translationText}
              {isLoading && <span className="ms-dots">...</span>}
              {translationTone === "error" && (
                <WarningCircleIcon className="ml-1 inline size-3.5" />
              )}
            </button>
          )}

          {caption.needsModel && translationTone === "error" && !isEditing && (
            <ModelDownloadButton caption={caption} />
          )}

          {isReloadVisible && (
            <button
              type="button"
            className={`${actionClass} flex size-6 items-center justify-center text-(--ms-positive)`}
              title={t("ui.retranslate")}
              onClick={onRetranslate}
            >
              <ArrowsClockwiseIcon className="size-3.5" />
            </button>
          )}
        </div>
      )}
    </div>

    {copiedTarget && (
      <span className="ms-copy-pop pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-md bg-black/85 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-green-400">
        <CheckIcon className="mr-1 inline size-3.5" /> {t("ui.copied")}
      </span>
    )}
  </article>
);
