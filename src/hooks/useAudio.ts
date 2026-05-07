import { useRef, useEffect, useCallback } from 'react';

interface UseAudioOptions {
  enabled?: boolean;
}

export const useAudio = (
  src: string,
  { enabled = true }: UseAudioOptions = {}
) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldPlay = enabled && !!src;

  useEffect(() => {
    if (!shouldPlay) {
        return;
    }

    const init = () => {
      audioRef.current = new Audio(src);
    };

    window.addEventListener('keydown', init, { once: false });

    return () => window.removeEventListener('keydown', init);
  }, [src, shouldPlay]);

  const play = useCallback(() => {
    if (!shouldPlay) {
        return;
    }

    audioRef.current?.play().catch(() => {});
  }, [shouldPlay]);

  return { onFocus: play };
};
