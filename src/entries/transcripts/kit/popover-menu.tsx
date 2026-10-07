import type { ReactNode } from "react";
import { usePopover } from "./use-popover";

export type PopoverMenuItem = {
  id: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
};

type Props = {
  trigger: ReactNode;
  ariaLabel: string;
  items: readonly PopoverMenuItem[];
  disabled?: boolean;
};

/** iOS context-menu style popover attached to a nav bar button. */
export const PopoverMenu = ({ trigger, ariaLabel, items, disabled = false }: Props) => {
  const { containerRef, isOpen, toggle, close } = usePopover();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        title={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={toggle}
        className="flex size-9 cursor-pointer items-center justify-center rounded-full text-(--ms-positive) transition-colors hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-35"
      >
        {trigger}
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute top-full right-0 z-30 mt-1.5 w-60 overflow-hidden rounded-[13px] bg-(--ms-app-surface-solid)/95 shadow-[0_12px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/8 backdrop-blur-xl"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                item.onSelect();
              }}
              className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-(--ms-app-border) px-4 py-2.5 text-left text-[15px] last:border-b-0 hover:bg-white/8"
            >
              {item.label}
              <span className="text-(--ms-app-text-emphasis)">{item.icon}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
