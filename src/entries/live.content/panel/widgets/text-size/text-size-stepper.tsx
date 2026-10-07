import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { t } from "@live/i18n";

type Props = {
  fontSize: number;
  isDecreaseDisabled: boolean;
  isIncreaseDisabled: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
};

const controlButtonClass =
  "flex size-6 cursor-pointer items-center justify-center border-0 bg-transparent text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-25";

export const FontSizeControl = ({
  fontSize,
  isDecreaseDisabled,
  isIncreaseDisabled,
  onDecrease,
  onIncrease,
}: Props) => (
  <div
    className="flex h-7 shrink-0 items-center overflow-hidden rounded-md border border-(--ms-overlay-control-border) bg-(--ms-overlay-control)"
    aria-label={t("ui.fontSize")}
  >
    <button
      type="button"
      className={controlButtonClass}
      disabled={isDecreaseDisabled}
      aria-label={t("ui.fontSmaller")}
      title={t("ui.fontSmaller")}
      onClick={onDecrease}
    >
      <MinusIcon className="size-3" />
    </button>
    <span className="min-w-9 text-center text-[9px] font-medium tabular-nums text-white">
      {fontSize}px
    </span>
    <button
      type="button"
      className={controlButtonClass}
      disabled={isIncreaseDisabled}
      aria-label={t("ui.fontLarger")}
      title={t("ui.fontLarger")}
      onClick={onIncrease}
    >
      <PlusIcon className="size-3" />
    </button>
  </div>
);
