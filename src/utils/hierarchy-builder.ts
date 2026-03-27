import type { Item, Frame, StickyNote } from '@mirohq/websdk-types';
import { ConnectionRecord, getLabel, isConnectableItem, isFrame } from '@utils/items';
import { ConnectableItem, HierarchyItemMetadata, HierarchyItemType, ItemType, type HierarchyItem } from '@models/item';
import { ItemRecord, TagRecord } from '@models/record';
import { getTags } from './tags';
import { buildConnectionRecord, buildItemRecord, buildTagRecord } from './record-builder';

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
    connectionRecord: ConnectionRecord,
  }
): HierarchyItem<T> {
  const { level, tagRecord, connectionRecord } = buildOptions;

  const connections = Object.values(connectionRecord)
    .filter(connection => connection?.id === item.id ||connection.endItem?.id === item.id);

  return {
    id: item.id,
    type: item.type as ItemType,
    item,
    label: getLabel(item),
    level,
    tags: getTags(item, tagRecord),
    children,
    metadata: computeHierarchyItemMetadata(children),
    connections,
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
  const { level, tagRecord, itemRecord, connectionRecord } = builderOptions;

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

  const hierarchyItem = buildHierarchyItem(item, children, { level, tagRecord, connectionRecord });
  
  return hierarchyItem;
}

function buildConnectorChild(
    item: ConnectableItem, 
    buildOptions: {
      level: number,
      connectionRecord: ConnectionRecord, 
      itemRecord: ItemRecord,
      tagRecord: TagRecord,
    },
    visited = new Set<StickyNote['id']>(), 
): HierarchyItem<HierarchyItemType> {
    const { level, connectionRecord, itemRecord, tagRecord } = buildOptions;

    visited.add(item.id);

    const children: HierarchyItem<HierarchyItemType>[] = [];

    (item.connectorIds ?? []).forEach(connectorId => {
      const connector = connectionRecord[connectorId];
      const endId = connector?.endItem?.id;

      const childLevel = level + 1;

      if (endId && !visited.has(endId)) {
        const childItem = itemRecord[endId];

        if (isConnectableItem(childItem)) {
          const connectorChild = buildConnectorChild(childItem, {
            ...buildOptions,
            level: childLevel
          });
          children.push(connectorChild);
        }
      }
    });

    const hierarchyItem = buildHierarchyItem(item, children, { 
      level, tagRecord, connectionRecord
    });

    return hierarchyItem;
  }

export function buildConnectorHierarchy(items: Item[]): HierarchyItem<HierarchyItemType>[] {
  const itemRecord = buildItemRecord(items);
  const connectionRecord = buildConnectionRecord(itemRecord);
  const tagRecord = buildTagRecord(items);
  const buildOptions = { level: 0, connectionRecord, itemRecord, tagRecord };

  const hasIncomingConnector = new Set<Item['id']>();
  Object.values(connectionRecord).forEach(connector => {
    if (connector.endItem) {
      hasIncomingConnector.add(connector.endItem?.id);
    }
  });
  

  const hierarchyRecord = Object.fromEntries(
    items
      .filter(item => isConnectableItem(item))
      .map(item => [item.id, buildConnectorChild(item as ConnectableItem, buildOptions)])
  );

  return items
    .filter(item => {
      if (isFrame(item)) {
        return true;
      }

      if (isConnectableItem(item)) {
        return !('parentId' in item && item.parentId)
      }
      return false;
    })
    .map(item => {
      if (!isFrame(item)) {
        return hierarchyRecord[item.id];
      }

      const children = items
        .filter(child => 'parentId' in child && child.parentId === item.id && !hasIncomingConnector.has(child.id))
        .map(child => hierarchyRecord[child.id])
        .filter(Boolean);

      const hierarchyItem = buildHierarchyItem<Frame>(
        item as Frame, 
        children, 
        {
          level: 0,
          tagRecord,
          connectionRecord,
        }
      );

      return hierarchyItem;
    });
}
