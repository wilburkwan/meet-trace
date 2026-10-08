import { useI18n } from "@/ui-kit/i18n-provider";
import { EmptyState } from "./empty-state";
import type { SavedChatMessage } from "./records";

type Props = { messages: SavedChatMessage[] };

type MessageGroup = { id: string; author: string; time: string; messages: SavedChatMessage[] };

// Meet labels the local user's messages as "You".
const OWN_AUTHOR = "You";

const sameMinute = (a: string, b: string): boolean =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

/** Consecutive messages by the same author in the same minute form one group. */
const groupMessages = (messages: SavedChatMessage[]): MessageGroup[] =>
  messages.reduce<MessageGroup[]>((groups, message) => {
    const last = groups.at(-1);
    if (last && last.author === message.author && sameMinute(last.time, message.time)) {
      last.messages.push(message);
    } else {
      groups.push({ id: message.id, author: message.author, time: message.time, messages: [message] });
    }
    return groups;
  }, []);

/** Meeting chat rendered as iMessage-style bubbles. */
export const ChatMessageList = ({ messages }: Props) => {
  const { t } = useI18n();
  if (messages.length === 0) return <EmptyState icon={null} title={t("history.noChat")} />;

  return (
    <ol className="mb-8 flex flex-col gap-4">
      {groupMessages(messages).map((group) => {
        const isOwn = group.author === OWN_AUTHOR;
        return (
          <li key={group.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
            <span className="mb-1 px-3 text-[12px] text-(--ms-app-text-secondary)">
              {isOwn ? t("history.you") : group.author} · {group.time}
            </span>
            <div className={`flex max-w-[78%] flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}>
              {group.messages.map((message) => (
                <p
                  key={message.id}
                  className={`w-fit max-w-full rounded-[18px] px-3.5 py-2 text-[15px] leading-5 break-words whitespace-pre-wrap ${
                    isOwn ? "bg-(--ms-primary) text-white" : "bg-(--ms-secondary) text-(--ms-app-text)"
                  }`}
                >
                  {message.text}
                </p>
              ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
