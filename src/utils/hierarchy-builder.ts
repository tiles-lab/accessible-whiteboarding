import type { Item, Frame, StickyNote } from '@mirohq/websdk-types';
import { ConnectionRecord, getLabel, isConnectableItem } from '@utils/items';
import { ConnectableItem, HierarchyItemMetadata, ItemType, type HierarchyItem } from '@models/item';
import { ConnectorRecord, ItemRecord, TagRecord } from '@models/record';
import { getTags } from './tags';
import { buildConnectorRecord, buildItemRecord, buildTagRecord } from './record-builder';
import { getColorConfig } from './colors';

function computeHierarchyItemMetadata(children: HierarchyItem[]): HierarchyItemMetadata {
  const treeChildCount = children.length + children.reduce((acc, child) => {
    return acc + (child.metadata?.treeChildCount ?? 0);
  }, 0);

  const treeConnectionHeight = children.length === 0
    ? 0
    : 1 + children.reduce((acc, child) =>
        Math.max(child.metadata?.treeConnectionHeight ?? 0, acc), 0
      );

  return { 
    treeChildCount, 
    treeConnectionHeight,
  };
}

export function buildHierarchyItem<T extends Item>(
  item: T,
  children: HierarchyItem[],
  buildOptions: {
    level: number,
    tagRecord: TagRecord,
  }
): HierarchyItem<T> {
  const { level, tagRecord } = buildOptions;

  return {
    id: item.id,
    type: item.type as ItemType,
    item,
    label: getLabel(item),
    level,
    tags: getTags(item, tagRecord),
    children,
    metadata: computeHierarchyItemMetadata(children),
  };
}

export function buildHierarchy(
  item: Item,
  builderOptions: {
    level: number;
    tagRecord: TagRecord;
    itemRecord: ItemRecord;
    connectionRecord: ConnectionRecord;
  }
): HierarchyItem<Item> {
  const { level, tagRecord, itemRecord } = builderOptions;

  let children: HierarchyItem[] = [];
  if (item.type === ItemType.Frame) {
    children = (item as Frame).childrenIds.map(
      childId => {
        const childItem = itemRecord[childId];

        return buildHierarchy(childItem, { 
          ...builderOptions, 
          level: level + 1
        });
      }
    );
  }

  const hierarchyItem = buildHierarchyItem(item, children, { level, tagRecord });
  
  return hierarchyItem;
}

function buildConnectorChild(
    item: ConnectableItem, 
    buildOptions: {
      level: number,
      connectorRecord: ConnectorRecord, 
      itemRecord: ItemRecord,
      tagRecord: TagRecord,
    },
    visited = new Set<StickyNote['id']>(), 
): HierarchyItem<ConnectableItem> {
    const { level, connectorRecord, itemRecord, tagRecord } = buildOptions;

    visited.add(item.id);

    const children: HierarchyItem<ConnectableItem>[] = [];

    (item.connectorIds ?? []).forEach(connectorId => {
      const connector = connectorRecord[connectorId];
      const endId = connector?.end?.item;

      const childLevel = level + 1;

      if (endId && !visited.has(endId)) {
        const childItem = itemRecord[endId];
        if (isConnectableItem(childItem)) {
          children.push(buildConnectorChild(childItem, {
            ...buildOptions,
            level: childLevel
          }))
        }
      }
    });

    const hierarchyItem = buildHierarchyItem(item, children, { 
      level, tagRecord
    });

    return hierarchyItem;
  }

export function buildConnectorHierarchy(items: Item[]): HierarchyItem<ConnectableItem>[] {
  const connectorRecord = buildConnectorRecord(items);
  const itemRecord = buildItemRecord(items);
  const tagRecord = buildTagRecord(items);
  const buildOptions = { level: 0, connectorRecord, itemRecord, tagRecord };

  const hasIncomingConnector = new Set<Item['id']>();
  Object.values(connectorRecord).forEach(connector => {
    if (connector.end?.item) {
      hasIncomingConnector.add(connector.end.item);
    }
  });
  

  const hierarchyRecord = Object.fromEntries(
    items
      .filter(item => isConnectableItem(item))
      .map(item => [item.id, buildConnectorChild(item as ConnectableItem, buildOptions)])
  );

  return items
    .filter(item => {
      if (item.type === ItemType.Frame) {
        return true;
      }

      if ([ItemType.StickyNote, ItemType.Text].includes(item.type as ItemType)) {
        return !('parentId' in item && item.parentId)
      }
      return false;
    })
    .map(item => {
      if (item.type !== ItemType.Frame) {
        return hierarchyRecord[item.id];
      }

      const children = items
        .filter(child => 'parentId' in child && child.parentId === item.id && !hasIncomingConnector.has(child.id))
        .map(child => hierarchyRecord[child.id])
        .filter(Boolean);

      const hierarchyItem = buildHierarchyItem<Frame>(item as Frame, children, {
        level: 0,
        tagRecord,
      });

      return hierarchyItem;
    });
}
