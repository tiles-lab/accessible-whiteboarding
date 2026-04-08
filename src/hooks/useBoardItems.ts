import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Item } from '@mirohq/websdk-types';
import { BOARD_UPDATE_CHANNEL } from '@utils/board-sync';

const POLL_INTERVAL_MS = 5000;

export function useBoardItems(fallbackItems: Item[]): Item[] {
  const [items, setItems] = useState<Item[]>([]);
  const focusedIdRef = useRef<string | null>(null);

  // Initial load — fall back to sample data if Miro doesn't respond within 50ms
  useEffect(() => {
    const timer = setTimeout(() => setItems(fallbackItems), 50);

    miro.board
      .get()
      .then((boardItems) => {
        clearTimeout(timer);
        setItems(boardItems);
      })
      .catch(() => clearTimeout(timer));

    return () => clearTimeout(timer);
  }, []);

  const refresh = useCallback(async () => {
    focusedIdRef.current = (document.activeElement as HTMLElement)?.id || null;
    const newItems = await miro.board.get().catch(() => null);
    if (newItems) setItems(newItems);
  }, []);

  // Poll Miro for updates at a regular interval
  useEffect(() => {
    const intervalId = setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [refresh]);

  // Refresh immediately when a panel action (edit, add, move) completes
  useEffect(() => {
    const channel = new BroadcastChannel(BOARD_UPDATE_CHANNEL);
    channel.onmessage = () => void refresh();
    return () => channel.close();
  }, [refresh]);

  // Miro native events cover item creation and deletion
  useEffect(() => {
    miro.board.ui.on('items:create', (event) => {
      setItems((prev) => [...prev, ...event.items]);
    });
    miro.board.ui.on('items:delete', (event) => {
      setItems((prev) => prev.filter((item) => item.id !== event.items?.[0]?.id));
    });
  }, []);

  // Restore focus to the previously focused element after a refresh-triggered re-render
  useLayoutEffect(() => {
    if (!focusedIdRef.current) return;
    document.getElementById(focusedIdRef.current)?.focus();
    focusedIdRef.current = null;
  });

  return items;
}
