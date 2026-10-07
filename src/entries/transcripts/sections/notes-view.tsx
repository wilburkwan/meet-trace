import { useI18n } from "@/ui-kit/i18n-provider";
import { GroupedSection } from "../kit";
import { EmptyState } from "./empty-state";

type Props = { notes?: string };

/** Notes typed during the meeting. */
export const MeetingNotes = ({ notes }: Props) => {
  const { t } = useI18n();
  const text = notes?.trim();
  if (!text) return <EmptyState icon={null} title={t("history.noNotes")} />;

  return (
    <GroupedSection>
      <p className="px-4 py-3.5 text-[15px] leading-6 whitespace-pre-wrap">{text}</p>
    </GroupedSection>
  );
};
