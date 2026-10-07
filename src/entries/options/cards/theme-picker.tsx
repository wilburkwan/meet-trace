import { CheckIcon } from "@phosphor-icons/react";
import { THEME_IDS, THEME_SWATCHES } from "@/core/theme";
import { useI18n } from "@/ui-kit/i18n-provider";
import { useTheme } from "@/ui-kit/theme-provider";

/** Colour theme picker; applies and persists immediately. */
export const ThemePicker = () => {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <div className="rounded-xl border border-(--ms-app-border) bg-(--ms-app-surface) p-6">
      <h2 className="mb-3 text-lg leading-5 font-medium text-(--ms-app-text-emphasis)">
        {t("settings.theme")}
      </h2>
      <div role="radiogroup" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {THEME_IDS.map((id) => {
          const [background, accent] = THEME_SWATCHES[id];
          const selected = id === theme;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(id)}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                selected
                  ? "border-(--ms-primary) bg-(--ms-app-canvas)"
                  : "border-(--ms-app-field-border) hover:border-(--ms-app-field-hover)"
              }`}
            >
              <span
                className="relative size-6 shrink-0 overflow-hidden rounded-full border border-white/20"
                style={{ background: `linear-gradient(135deg, ${background} 50%, ${accent} 50%)` }}
              />
              <span className="flex-1 truncate text-left whitespace-nowrap">{t(`theme.${id}`)}</span>
              {selected && <CheckIcon className="size-4 text-(--ms-positive)" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
