import { Connector, Frame, Item, StickyNote, Tag, Text } from '@mirohq/websdk-types';
import { CONNECTABLE_ITEM_TYPES, Connection, ItemType, ItemTypeConfig, ItemTypeConfigMap, HIERARCHY_ITEM_TYPE, HierarchyItemType, ConnectableItem } from '@models/item';

export function getLabel(item?: Item): string {
  let label: string | undefined = undefined;

  if (item) {
    if (isStickyNote(item)) {
      label = item.content || 'Empty';
    }

    if (isFrame(item)) {
      label = item.title || 'No title';
    }

    if (isText(item)) {
      label = item.content || 'Empty';
    }

    if (isConnector(item)) {
      label = `from ${item.start?.item} to ${item.end?.item}`;
    }
  }

  return label || 'No label';
}

export type ConnectionRecord = Record<Connector["id"], Connection>;

export function isHierarchyItem(item?: Item): item is HierarchyItemType {
  return HIERARCHY_ITEM_TYPE.includes(item?.type as ItemType);
}

export function isConnectableItem(item?: Item): item is ConnectableItem {
  return CONNECTABLE_ITEM_TYPES.includes(item?.type as ItemType);
}

export function getItemTypeConfig(itemType: ItemType): ItemTypeConfig | undefined {
  const config = ItemTypeConfigMap[itemType];

  return config ?? itemType;
}

export function isStickyNote(item?: Item | null): item is StickyNote {
  return item?.type === ItemType.StickyNote;
}

export function isFrame(item?: Item | null): item is Frame {
  return item?.type === ItemType.Frame;
}

export function isText(item?: Item | null): item is Text {
  return item?.type === ItemType.Text;
}

export function isTag(item?: Item | null): item is Tag {
  return item?.type === ItemType.Tag;
}

export function isConnector(item?: Item | null): item is Connector {
  return item?.type === ItemType.Connector;
}
