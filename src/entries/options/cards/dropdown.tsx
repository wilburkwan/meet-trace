import { CaretDownIcon } from "@phosphor-icons/react";

type SelectOption = {
  id: string;
  name: string;
};

type SelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[] | SelectOption[];
};

export function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div className="rounded-xl border border-(--ms-app-border) bg-(--ms-app-surface) p-6">
      <label className="mb-3 block text-lg leading-5 font-medium text-(--ms-app-text-emphasis)">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full cursor-pointer appearance-none rounded-lg border border-(--ms-app-field-border) bg-(--ms-app-canvas) px-4 pr-12 text-sm text-(--ms-app-text) outline-none hover:border-(--ms-app-field-hover) focus:border-(--ms-primary)"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>{option.name}</option>
          ))}
        </select>
        <CaretDownIcon className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2" />
      </div>
    </div>
  );
}
