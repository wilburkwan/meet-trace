import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
};

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

/** Provides an iOS-style alert for destructive confirmations. */
export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(value: boolean) => void>(() => {});

  const confirm = useCallback<Confirm>(
    (next) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOptions(next);
      }),
    []
  );

  const close = (result: boolean) => {
    resolver.current(result);
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => close(false)}
          onKeyDown={(event) => event.key === "Escape" && close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ms-confirm-title"
            onClick={(event) => event.stopPropagation()}
            className="w-72 overflow-hidden rounded-[14px] bg-(--ms-app-surface-solid)/95 text-center shadow-2xl backdrop-blur-xl"
          >
            <div className="px-4 pt-5 pb-4">
              <h2 id="ms-confirm-title" className="text-[17px] font-semibold">{options.title}</h2>
              <p className="mt-1 text-[13px] leading-[18px] text-(--ms-app-text-emphasis)">
                {options.message}
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-(--ms-app-border) text-[17px]">
              <button
                type="button"
                autoFocus
                onClick={() => close(false)}
                className="cursor-pointer border-r border-(--ms-app-border) py-2.5 text-(--ms-positive) hover:bg-white/5"
              >
                {options.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className="cursor-pointer py-2.5 font-semibold text-(--ms-danger) hover:bg-white/5"
              >
                {options.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

/** Returns a promise-based confirm(); resolves true when the user confirms. */
export const useConfirm = (): Confirm => {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used within ConfirmProvider");
  return confirm;
};
