import type { Frame, Item, StickyNote, Text } from '@mirohq/websdk-types';

export function getLabel(item: Item): string {
  let label: string | undefined = undefined;

  if (item.type === 'sticky_note') {
    label = (item as StickyNote).content || 'Empty';
  }

  if (item.type === 'frame') {
    label = (item as Frame).title || 'No title';
  }

  if (item.type === 'text') {
    label = (item as Text).content || 'Empty';
  }

  return label || 'No label';
}
