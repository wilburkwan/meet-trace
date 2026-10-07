type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
};

/** iOS segmented control. */
export const SegmentedControl = <T extends string>({ value, options, onChange }: Props<T>) => (
  <div role="tablist" className="mb-5 grid auto-cols-fr grid-flow-col rounded-[9px] bg-(--ms-secondary) p-0.5">
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={selected}
          onClick={() => onChange(option.value)}
          className={`cursor-pointer rounded-[7px] py-1.5 text-[13px] font-medium transition-all ${
            selected
              ? "bg-(--ms-secondary-hover) text-(--ms-app-text) shadow-[0_3px_8px_rgba(0,0,0,0.25)]"
              : "text-(--ms-app-text-emphasis) hover:text-(--ms-app-text)"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
