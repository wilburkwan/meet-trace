import { MagnifyingGlassIcon, XCircleIcon } from "@phosphor-icons/react";

type Props = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

/** iOS search field: filled, rounded, with a clear button. */
export const SearchField = ({ value, placeholder, onChange }: Props) => (
  <div className="relative mb-6">
    <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4.5 -translate-y-1/2 text-(--ms-app-text-secondary)" />
    <input
      type="search"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-[10px] bg-(--ms-secondary) pr-9 pl-8.5 text-[17px] text-(--ms-app-text) placeholder:text-(--ms-app-text-secondary) focus:outline-none [&::-webkit-search-cancel-button]:hidden"
    />
    {value && (
      <button
        type="button"
        aria-label="Clear"
        onClick={() => onChange("")}
        className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-(--ms-app-text-secondary)"
      >
        <XCircleIcon className="size-4.5" weight="fill" />
      </button>
    )}
  </div>
);
