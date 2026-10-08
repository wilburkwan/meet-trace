import type { Caption } from "@live/models";
import { CaptionItem, type BlockPosition } from "./line-row";
import { useCaptionItem } from "./use-line-row";

type Props = {
  caption: Caption;
  position: BlockPosition;
  isTranslationEnabled: boolean;
};

export const CaptionItemContainer = ({
  caption,
  position,
  isTranslationEnabled,
}: Props) => {
  const {
    isEditing,
    copiedTarget,
    translationText,
    translationTone,
    isLoading,
    isReloadVisible,
    handleCancelEditing,
    handleCopyOriginal,
    handleCopyTranslation,
    handleManualTranslate,
    handleRetranslate,
    handleSaveTranslation,
    handleStartEditing,
  } = useCaptionItem(caption);

  return (
    <CaptionItem
      caption={caption}
      position={position}
      isTranslationEnabled={isTranslationEnabled}
      isEditing={isEditing}
      copiedTarget={copiedTarget}
      translationText={translationText}
      translationTone={translationTone}
      isLoading={isLoading}
      isReloadVisible={isReloadVisible}
      onCancelEditing={handleCancelEditing}
      onCopyOriginal={handleCopyOriginal}
      onCopyTranslation={handleCopyTranslation}
      onManualTranslate={handleManualTranslate}
      onRetranslate={handleRetranslate}
      onSaveTranslation={handleSaveTranslation}
      onStartEditing={handleStartEditing}
    />
  );
};
