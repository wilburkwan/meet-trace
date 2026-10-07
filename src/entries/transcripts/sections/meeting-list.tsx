import { useEffect, useRef, useState } from "react";
import { VideoCameraIcon } from "@phosphor-icons/react";
import { useI18n } from "@/ui-kit/i18n-provider";
import { formatClock, formatDayLabel, formatDuration, sessionTitle } from "../format";
import { GroupedSection, IconTile, ListRow } from "../kit";
import type { MeetingSession } from "./records";

const PAGE_SIZE = 20;

type Props = {
  sessions: MeetingSession[];
  onSelect: (sessionId: string) => void;
};

/** Meetings grouped by day as inset-grouped lists, loaded progressively. */
export const SessionList = ({ sessions, onSelect }: Props) => {
  const { locale, t } = useI18n();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = visibleCount < sessions.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sessions]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount((count) => count + PAGE_SIZE);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  const groups = new Map<string, MeetingSession[]>();
  for (const session of sessions.slice(0, visibleCount)) {
    const day = formatDayLabel(session.startTime, locale, t);
    groups.set(day, [...(groups.get(day) ?? []), session]);
  }

  const describe = (session: MeetingSession): string => {
    const parts = [formatClock(session.startTime, locale)];
    const duration = formatDuration(session.startTime, session.endTime, locale);
    if (duration) parts.push(duration);
    const captionCount = session.captions.length;
    parts.push(
      captionCount === 1
        ? t("history.captionCountOne")
        : t("history.captionCount", { count: captionCount })
    );
    const chatCount = session.chatMessages?.length ?? 0;
    if (chatCount > 0) parts.push(t("history.chatCount", { count: chatCount }));
    return parts.join(" · ");
  };

  return (
    <>
      {Array.from(groups, ([day, daySessions]) => (
        <GroupedSection key={day} header={day}>
          {daySessions.map((session) => (
            <ListRow
              key={session.id}
              icon={
                <IconTile>
                  <VideoCameraIcon className="size-4.5" weight="fill" />
                </IconTile>
              }
              title={sessionTitle(session, t)}
              subtitle={describe(session)}
              showChevron
              onClick={() => onSelect(session.id)}
            />
          ))}
        </GroupedSection>
      ))}
      {hasMore && (
        <div ref={sentinelRef} className="pb-8 text-center text-[13px] text-(--ms-app-text-secondary)">
          {t("history.loadMore")}
        </div>
      )}
    </>
  );
};
