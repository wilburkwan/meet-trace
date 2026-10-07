import { CaretDownIcon, TranslateIcon } from "@phosphor-icons/react";
import { LANGUAGES } from "@/core/constants";
import { useI18n } from "@/ui-kit/i18n-provider";
import { LiveTranslatePicker } from "./live-translate-picker";
import { useTranslationSetup, type ModelStatus } from "./use-translation-setup";

type LanguagePickerProps = {
  label: string;
  value: string;
  options: readonly { code: string; name: string }[];
  onChange: (value: string) => void;
};

const LanguagePicker = ({ label, value, options, onChange }: LanguagePickerProps) => (
  <label className="block min-w-0 flex-1">
    <span className="mb-1.5 block text-xs text-(--ms-app-text-secondary)">{label}</span>
    <span className="relative block">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-(--ms-app-field-border) bg-(--ms-app-canvas) pr-10 pl-3 text-sm text-(--ms-app-text) outline-none hover:border-(--ms-app-field-hover) focus:border-(--ms-primary)"
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>{option.name}</option>
        ))}
      </select>
      <CaretDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
    </span>
  </label>
);

const STATUS_TONE: Record<ModelStatus["kind"], string> = {
  checking: "bg-(--ms-app-text-secondary)",
  "browser-unsupported": "bg-(--ms-danger)",
  "same-language": "bg-(--ms-app-text-secondary)",
  auto: "bg-amber-400",
  unsupported: "bg-(--ms-danger)",
  downloadable: "bg-amber-400",
  downloading: "bg-(--ms-primary) animate-pulse",
  ready: "bg-emerald-400",
  failed: "bg-(--ms-danger)",
};

/** Translation card: meeting language, target language and model download. */
export const TranslationSetup = () => {
  const { t } = useI18n();
  const { languages, status, updateLanguages, download } = useTranslationSetup();

  const statusText: Record<ModelStatus["kind"], string> = {
    checking: t("settings.modelChecking"),
    "browser-unsupported": t("settings.browserUnsupported"),
    "same-language": t("settings.modelSame"),
    auto: t("settings.autoHint"),
    unsupported: t("settings.modelUnsupported"),
    downloadable: t("settings.modelDownloadable"),
    downloading: t("settings.modelDownloading", { percent: status.kind === "downloading" ? status.percent : 0 }),
    ready: t("settings.modelReady"),
    failed: t("settings.downloadFailed", { reason: status.kind === "failed" ? status.reason : "" }),
  };
  const canDownload = status.kind === "downloadable" || status.kind === "failed";

  return (
    <div className="rounded-xl border border-(--ms-app-border) bg-(--ms-app-surface) p-6">
      <div className="mb-5 flex gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--ms-primary) text-white">
          <TranslateIcon className="size-5.5" />
        </span>
        <div>
          <h2 className="mb-1 text-lg leading-5 font-medium text-(--ms-app-text-emphasis)">{t("settings.translationTitle")}</h2>
          <p className="text-sm leading-5 text-(--ms-app-text-secondary)">{t("settings.translationBody")}</p>
        </div>
      </div>

      {languages && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <LanguagePicker
            label={t("settings.sourceLanguage")}
            value={languages.sourceLanguage}
            options={[{ code: "auto", name: t("settings.sourceAuto") }, ...LANGUAGES]}
            onChange={(sourceLanguage) => updateLanguages({ sourceLanguage })}
          />
          <LanguagePicker
            label={t("settings.targetLanguage")}
            value={languages.targetLanguage}
            options={LANGUAGES}
            onChange={(targetLanguage) => updateLanguages({ targetLanguage })}
          />
        </div>
      )}

      <div className="flex items-center gap-3 rounded-lg bg-(--ms-app-canvas) px-4 py-3">
        <span className={`size-2.5 shrink-0 rounded-full ${STATUS_TONE[status.kind]}`} />
        <p className="flex-1 text-sm leading-5" role="status">{statusText[status.kind]}</p>
        {canDownload && (
          <button
            type="button"
            onClick={download}
            className="shrink-0 cursor-pointer rounded-lg bg-(--ms-primary) px-4 py-1.5 text-sm font-medium text-white hover:bg-(--ms-primary-hover)"
          >
            {t("settings.download")}
          </button>
        )}
      </div>

      <LiveTranslatePicker />
    </div>
  );
};
