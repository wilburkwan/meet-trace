import { useState } from "react";
import {
  CopySimpleIcon,
  FileCsvIcon,
  FileTextIcon,
  ShareIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { useI18n } from "@/ui-kit/i18n-provider";
import { GroupedSection, ListRow, NavBar, NavIconButton, PopoverMenu, SegmentedControl } from "../kit";
import { CaptionTranscript } from "./caption-transcript";
import { ChatMessageList } from "./chat-bubbles";
import { MeetingNotes } from "./notes-view";
import { SessionTitle } from "./session-title";
import type { MeetingSession } from "./records";
import { useSessionDetail } from "./use-meeting-view";

type Tab = "captions" | "chat" | "notes";

type Props = {
  session: MeetingSession;
  onBack: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
};

/** One meeting: title, captions / chat / notes tabs, export and copy actions. */
export const SessionDetail = ({ session, onBack, onDelete, onRename }: Props) => {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("captions");
  const { title, subtitle, hasContent, exportAs, copyTranscript, copySummaryPrompt } =
    useSessionDetail(session);

  const tabs = [
    { value: "captions", label: `${t("history.tabCaptions")} ${session.captions.length}` },
    { value: "chat", label: `${t("history.tabChat")} ${session.chatMessages?.length ?? 0}` },
    { value: "notes", label: t("history.tabNotes") },
  ] as const;

  return (
    <>
      <NavBar
        title={title}
        backLabel={t("history.back")}
        onBack={onBack}
        trailing={
          <>
            <NavIconButton
              label={t("overlay.copyAll")}
              icon={<CopySimpleIcon className="size-5.5" />}
              disabled={!hasContent}
              onClick={copyTranscript}
            />
            <NavIconButton
              label={t("history.copyPrompt")}
              icon={<SparkleIcon className="size-5.5" />}
              disabled={!hasContent}
              onClick={copySummaryPrompt}
            />
            <PopoverMenu
              ariaLabel={t("history.export")}
              trigger={<ShareIcon className="size-5.5" />}
              items={[
                { id: "csv", label: "CSV", icon: <FileCsvIcon className="size-4.5" />, onSelect: () => exportAs("csv") },
                { id: "txt", label: "TXT", icon: <FileTextIcon className="size-4.5" />, onSelect: () => exportAs("txt") },
              ]}
            />
          </>
        }
      />
      <SessionTitle title={title} subtitle={subtitle} currentTitle={session.title} onRename={onRename} />
      <SegmentedControl value={tab} options={tabs} onChange={setTab} />

      {tab === "captions" && <CaptionTranscript captions={session.captions} />}
      {tab === "chat" && <ChatMessageList messages={session.chatMessages ?? []} />}
      {tab === "notes" && <MeetingNotes notes={session.notes} />}

      <GroupedSection>
        <ListRow title={<span className="block text-center">{t("history.deleteMeeting")}</span>} destructive onClick={onDelete} />
      </GroupedSection>
    </>
  );
};
