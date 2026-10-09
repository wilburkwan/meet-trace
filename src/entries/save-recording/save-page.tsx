import { CheckCircleIcon, CircleNotchIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useI18n } from "@/ui-kit/i18n-provider";
import { useSaveRecording } from "./use-save-recording";

/** Tab that saves a finished recording to Downloads and shows where it went. */
export default function App() {
  const { t } = useI18n();
  const { state, details, retry, showFile } = useSaveRecording();

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--ms-app-canvas) p-6 text-(--ms-app-text)">
      <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border border-(--ms-app-border) bg-(--ms-app-surface) p-8 text-center">
        {state.kind === "saving" && <CircleNotchIcon className="size-10 animate-spin text-(--ms-positive)" />}
        {state.kind === "done" && <CheckCircleIcon className="size-10 text-emerald-400" weight="fill" />}
        {(state.kind === "empty" || state.kind === "failed") && <WarningCircleIcon className="size-10 text-red-400" weight="fill" />}

        <h1 className="text-lg font-medium text-(--ms-app-text-emphasis)">
          {state.kind === "saving" && t("save.saving")}
          {state.kind === "done" && t("save.done")}
          {state.kind === "empty" && t("save.empty")}
          {state.kind === "failed" && t("save.failed")}
        </h1>
        {state.kind === "done" && <p className="text-sm break-all text-(--ms-app-text-secondary)">{state.filename}</p>}
        {state.kind === "failed" && <p className="text-sm break-all text-red-400">{state.reason}</p>}

        {(state.kind === "empty" || state.kind === "failed") && details && (
          <p className="text-xs break-all text-(--ms-app-text-secondary)">{details}</p>
        )}

        {state.kind === "failed" && (
          <button type="button" onClick={retry} className="mt-2 h-10 w-full cursor-pointer rounded-lg bg-(--ms-primary) text-sm font-medium text-white transition-colors hover:bg-(--ms-primary-hover)">
            {t("save.retry")}
          </button>
        )}
        {state.kind === "done" && (
          <button type="button" onClick={showFile} className="h-10 w-full cursor-pointer rounded-lg border border-(--ms-app-field-border) text-sm transition-colors hover:border-(--ms-app-field-hover)">
            {t("save.showFolder")}
          </button>
        )}
      </div>
    </main>
  );
}
