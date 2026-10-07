import { useId, type ReactNode } from "react";
import type { MessageKey } from "@/core/i18n";
import { useI18n } from "@/ui-kit/i18n-provider";
import { useStoredSetting } from "./use-stored-setting";

type Props = {
  icon: ReactNode;
  settingKey: string;
  titleKey: MessageKey;
  bodyKey: MessageKey;
};

/** Settings card with an iOS-style on/off switch bound to one stored setting. */
export const SettingToggleCard = ({ icon, settingKey, titleKey, bodyKey }: Props) => {
  const { t } = useI18n();
  const titleId = useId();
  const [enabled, setEnabled] = useStoredSetting<boolean>(settingKey);

  return (
    <div className="flex items-start gap-4 rounded-xl border border-(--ms-app-border) bg-(--ms-app-surface) p-6">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--ms-primary) text-white">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h2 id={titleId} className="mb-1 text-lg leading-5 font-medium text-(--ms-app-text-emphasis)">
          {t(titleKey)}
        </h2>
        <p className="text-sm leading-5 text-(--ms-app-text-secondary)">{t(bodyKey)}</p>
      </div>
      {enabled !== null && (
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-labelledby={titleId}
          onClick={() => setEnabled(!enabled)}
          className={`relative mt-1 h-7.5 w-12.5 shrink-0 cursor-pointer rounded-full transition-colors ${
            enabled ? "bg-(--ms-primary)" : "bg-(--ms-app-field-border)"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0 size-6.5 rounded-full bg-white shadow-md transition-transform ${
              enabled ? "translate-x-5.5" : "translate-x-0.5"
            }`}
          />
        </button>
      )}
    </div>
  );
};
