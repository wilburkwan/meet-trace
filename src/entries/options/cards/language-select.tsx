import { UI_LANGUAGE_OPTIONS, toPreference } from "@/core/i18n";
import { useI18n } from "@/ui-kit/i18n-provider";
import { Select } from "./dropdown";

/** Interface language picker; applies and persists immediately. */
export const LanguageSelect = () => {
  const { preference, setPreference, t } = useI18n();

  const options = [
    { id: "auto", name: t("settings.languageAuto") },
    ...UI_LANGUAGE_OPTIONS,
  ];

  return (
    <Select
      label={t("settings.interfaceLanguage")}
      value={preference}
      onChange={(value) => setPreference(toPreference(value))}
      options={options}
    />
  );
};
