import { useEffect, useState, type ReactNode } from "react";
import { CaretLeftIcon } from "@phosphor-icons/react";

type Props = {
  /** Small centred title, shown once the large title scrolls away. */
  title?: string;
  backLabel?: string;
  onBack?: () => void;
  trailing?: ReactNode;
};

// Scroll distance after which the large title is considered hidden.
const LARGE_TITLE_HEIGHT = 56;

/** True once the page has scrolled past the large title. */
const useScrolledPastTitle = (): boolean => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > LARGE_TITLE_HEIGHT);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return scrolled;
};

/** iOS-style translucent navigation bar that sticks to the top. */
export const NavBar = ({ title, backLabel, onBack, trailing }: Props) => {
  const showTitle = useScrolledPastTitle();
  return (
  <nav className="sticky top-0 z-20 -mx-5 mb-2 grid h-13 grid-cols-[1fr_auto_1fr] items-center border-b border-(--ms-app-border) bg-(--ms-app-canvas)/75 px-5 backdrop-blur-xl backdrop-saturate-150">
    <div className="justify-self-start">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 flex cursor-pointer items-center gap-0.5 rounded-lg px-1.5 py-1 text-[17px] text-(--ms-positive) transition-opacity active:opacity-50"
        >
          <CaretLeftIcon className="size-5.5" weight="bold" />
          {backLabel}
        </button>
      )}
    </div>
    <span
      className={`max-w-60 truncate text-[17px] font-semibold transition-opacity duration-200 ${
        showTitle ? "opacity-100" : "opacity-0"
      }`}
    >
      {title}
    </span>
    <div className="flex items-center gap-1 justify-self-end">{trailing}</div>
  </nav>
  );
};

/** iOS large title. */
export const LargeTitle = ({ children }: { children: ReactNode }) => (
  <h1 className="mt-3 mb-4 text-[34px] leading-10 font-bold tracking-[-0.02em]">
    {children}
  </h1>
);
