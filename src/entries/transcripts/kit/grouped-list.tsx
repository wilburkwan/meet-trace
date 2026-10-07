import type { ReactNode } from "react";
import { CaretRightIcon } from "@phosphor-icons/react";

type SectionProps = {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

/** iOS "inset grouped" section: uppercase header, rounded card, footnote. */
export const GroupedSection = ({ header, footer, children }: SectionProps) => (
  <section className="mb-8">
    {header && (
      <h2 className="mb-1.5 px-4 text-[13px] tracking-wide text-(--ms-app-text-secondary) uppercase">
        {header}
      </h2>
    )}
    <div className="overflow-hidden rounded-2xl bg-(--ms-app-surface-solid)">{children}</div>
    {footer && (
      <p className="mt-1.5 px-4 text-[13px] leading-[18px] text-(--ms-app-text-secondary)">
        {footer}
      </p>
    )}
  </section>
);

type RowProps = {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  detail?: ReactNode;
  destructive?: boolean;
  showChevron?: boolean;
  onClick?: () => void;
};

/** A tappable list row with an inset hairline separator between rows. */
export const ListRow = ({
  icon,
  title,
  subtitle,
  detail,
  destructive = false,
  showChevron = false,
  onClick,
}: RowProps) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full cursor-pointer items-center gap-3 pl-4 text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.08]"
  >
    {icon}
    <span className="flex min-w-0 flex-1 items-center gap-3 border-b border-(--ms-app-border) py-3 pr-4 group-last-of-type:border-b-0">
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[17px] leading-[22px] ${
            destructive ? "text-(--ms-danger)" : ""
          }`}
        >
          {title}
        </span>
        {subtitle && (
          <span className="mt-0.5 block truncate text-[13px] leading-[18px] text-(--ms-app-text-secondary)">
            {subtitle}
          </span>
        )}
      </span>
      {detail && (
        <span className="shrink-0 text-[15px] text-(--ms-app-text-secondary)">{detail}</span>
      )}
      {showChevron && (
        <CaretRightIcon className="size-4 shrink-0 text-(--ms-app-text-secondary)/60" weight="bold" />
      )}
    </span>
  </button>
);

/** Rounded-square icon tile used at the start of rows (like iOS Settings). */
export const IconTile = ({ children, tone = "primary" }: { children: ReactNode; tone?: "primary" | "danger" | "neutral" }) => {
  const toneClass =
    tone === "danger" ? "bg-(--ms-danger)" : tone === "neutral" ? "bg-(--ms-secondary-hover)" : "bg-(--ms-primary)";
  return (
    <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-white ${toneClass}`}>
      {children}
    </span>
  );
};
