import type { Connector, Frame, Item, StickyNote, Text } from '@mirohq/websdk-types';
import { CONNECTABLE_ITEM_TYPES, ConnectableItem, Connection, ItemType } from '@models/item';

export function getLabel(item?: Item): string {
  let label: string | undefined = undefined;

  if (item) {
    if (item.type === ItemType.StickyNote) {
      label = (item as StickyNote).content || 'Empty';
    }

    if (item.type === ItemType.Frame) {
      label = (item as Frame).title || 'No title';
    }

    if (item.type === ItemType.Text) {
      label = (item as Text).content || 'Empty';
    }

    if (item.type === ItemType.Connector) {
      const connector = item as Connector;
      label = `from ${connector.start?.item} to ${connector.end?.item}`;
    }
  }

  return label || 'No label';
}

export type ConnectionRecord = Record<Connector["id"], Connection>;

export function isConnectableItem(item: Item): item is ConnectableItem {
  return CONNECTABLE_ITEM_TYPES.includes(item.type as ItemType);
}
