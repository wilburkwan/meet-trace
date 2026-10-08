import type { ReactNode } from "react";

type Props = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

/** Round icon button for the nav bar, styled like the popover menu triggers. */
export const NavIconButton = ({ label, icon, onClick, disabled = false }: Props) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    className="flex size-9 cursor-pointer items-center justify-center rounded-full text-(--ms-positive) transition-colors hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-35"
  >
    {icon}
  </button>
);
