import type { Caption } from "@live/models";
import { t } from "@live/i18n";
import { CaptionItemContainer, type BlockPosition } from "./line-row";
import { CaptionsOffNotice } from "./captions-off-notice";

type Props = {
  captions: Caption[];
  isCCEnabled: boolean;
  isMeetingEnded: boolean;
  isTranslationEnabled: boolean;
  /** Show a speaker's consecutive segments as one block (like Google Meet). */
  groupBySpeaker: boolean;
};

/** Position of each caption inside its run of same-speaker captions. */
const blockPosition = (captions: Caption[], index: number, group: boolean): BlockPosition => {
  if (!group) return "single";
  const speaker = captions[index].speaker;
  const samePrev = captions[index - 1]?.speaker === speaker;
  const sameNext = captions[index + 1]?.speaker === speaker;
  if (samePrev && sameNext) return "middle";
  if (samePrev) return "last";
  if (sameNext) return "first";
  return "single";
};

export const CaptionList = ({
  captions,
  isCCEnabled,
  isMeetingEnded,
  isTranslationEnabled,
  groupBySpeaker,
}: Props) => {
  if (captions.length === 0) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-2 px-3.5 py-2 text-center text-(--ms-overlay-text-primary,#fff)">
        {isMeetingEnded ? (
          <>
            <p className="text-[13px] leading-5">{t("overlay.endedTitle")}</p>
            <p className="text-xs leading-4.5">{t("overlay.endedBody")}</p>
          </>
        ) : isCCEnabled ? (
          <>
            <p className="text-[13px] leading-5">{t("overlay.readyTitle")}</p>
            <p className="text-xs leading-4.5">{t("overlay.readyBody")}</p>
          </>
        ) : (
          <CaptionsOffNotice />
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${groupBySpeaker ? "" : "gap-3"}`}>
      {captions.map((caption, index) => (
        <CaptionItemContainer
          key={caption.id}
          caption={caption}
          position={blockPosition(captions, index, groupBySpeaker)}
          isTranslationEnabled={isTranslationEnabled}
        />
      ))}
    </div>
  );
};
