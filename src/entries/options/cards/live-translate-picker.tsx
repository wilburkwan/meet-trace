import { useI18n } from "@/ui-kit/i18n-provider";
import { useStoredSetting } from "./use-stored-setting";

// 0 = translate only when a segment ends.
const OPTIONS = [0, 10, 20, 50] as const;

/** How often to re-translate a caption while it is still being spoken. */
export const LiveTranslatePicker = () => {
  const { t } = useI18n();
  const [chars, setChars] = useStoredSetting<number>("liveTranslateChars");
  if (chars === null) return null;

  return (
    <div className="mt-4">
      <span className="mb-2 block text-sm">{t("settings.liveTranslate")}</span>
      <div className="mb-2 flex flex-wrap gap-2">
        {OPTIONS.map((option) => {
          const selected = option === chars;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => setChars(option)}
              className={`cursor-pointer rounded-full border px-3.5 py-1 text-sm transition-colors ${
                selected
                  ? "border-(--ms-primary) bg-(--ms-primary) text-white"
                  : "border-(--ms-app-field-border) hover:border-(--ms-app-field-hover)"
              }`}
            >
              {option === 0 ? t("settings.liveTranslateOff") : t("settings.liveTranslateChars", { count: option })}
            </button>
          );
        })}
      </div>
      <p className="text-xs leading-4.5 text-(--ms-app-text-secondary)">{t("settings.liveTranslateHint")}</p>
    </div>
  );
};
