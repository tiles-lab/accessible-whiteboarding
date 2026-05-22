import { useAudio } from './useAudio';
import { EarconOptions, getEarcon } from '@utils/a11y';

interface UseEarconOptions extends EarconOptions {
  enabled?: boolean; 
}

export const useEarcon = ({ category, color, enabled }: UseEarconOptions) => {
  const audioSrc = getEarcon({ category, color });

  return useAudio(audioSrc ?? '', { enabled: enabled });
};
