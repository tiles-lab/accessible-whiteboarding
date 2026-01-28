import type { Frame, Item, StickyNote, Text } from '@mirohq/websdk-types';

export function getLabel(item: Item): string {
  if (item.type === 'sticky_note') {
    return (item as StickyNote).content;
  }

  if (item.type === 'frame') {
    return (item as Frame).title;
  }

  if (item.type === 'text') {
    return (item as Text).content;
  }

  return `Unsupported ${item.type}`;
}
