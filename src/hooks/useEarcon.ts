import { isStickyNote } from '@utils/items';
import { useAudio } from './useAudio';
import { HierarchyItemType } from '@models/item';
import { EarconRegistry } from '@config/earcons';

interface UseEarconOptions {
  category: HierarchyItemType;
  enabled?: boolean;
}

export const useEarcon = ({ category, enabled }: UseEarconOptions) => {
    let audioSrc: string | undefined;

    if (isStickyNote(category)) {
        const config = EarconRegistry.sticky_note[category.style.fillColor];

        if (config.audio) {
            audioSrc = config.audio;
        }
    }
  return useAudio(audioSrc ?? '', { enabled: enabled });
};
