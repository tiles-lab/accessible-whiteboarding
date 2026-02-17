import type { Item, Frame, StickyNote, Text } from '@mirohq/websdk-types';
import { ConnectionRecord, getLabel, isConnectableItem } from '@utils/items';
import { ConnectableItem, ItemType, type HierarchyItem } from '@models/item';
import { ConnectorRecord, ItemRecord, TagRecord } from '@models/record';
import { getTags } from './tags';
import { buildConnectorRecord, buildItemRecord, buildTagRecord } from './record-builder';

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

  const treeChildCount = children.length + children.reduce((acc, child) => {
    acc += (child.metadata?.treeChildCount ?? 0);
    return acc;
  }, 0);

  const treeConnectionHeight = children.length === 0
      ? 0
      : 1 + children.reduce((acc, child) =>
          Math.max(child.metadata?.treeConnectionHeight ?? 0, acc), 0
        );

  const hierarchyItem: HierarchyItem<Item> = {
    id: item.id,
    type: item.type,
    item,
    label: getLabel(item),
    level,
    tags: getTags(item, tagRecord),
    children,
    metadata: {
      treeChildCount,
      treeConnectionHeight,
    }
  };
  

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

    const treeChildCount = children.length + children.reduce((acc, child) => {
        acc += (child.metadata?.treeChildCount ?? 0);
        return acc;
      }, 0);

    const treeConnectionHeight = children.length === 0
      ? 0
      : 1 + children.reduce((acc, child) =>
          Math.max(child.metadata?.treeConnectionHeight ?? 0, acc), 0
        );

    return {
      id: item.id,
      type: item.type,
      item,
      label: getLabel(item),
      level,
      tags: getTags(item, tagRecord),
      children: children.length ? children : undefined,
      metadata: {
        treeChildCount,
        treeConnectionHeight,
      }
    };
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
      .filter(item => [ItemType.StickyNote, ItemType.Text].includes(item.type as ItemType))
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

      const treeChildCount = children.length + children.reduce((acc, child) => {
        acc += (child.metadata?.treeChildCount ?? 0);
        return acc;
      }, 0);

      const treeConnectionHeight = children.length === 0
      ? 0
      : 1 + children.reduce((acc, child) =>
          Math.max(child.metadata?.treeConnectionHeight ?? 0, acc), 0
        );
      

      return {
        id: item.id,
        type: item.type,
        item,
        label: getLabel(item),
        level: 0,
        tags: getTags(item, tagRecord),
        children,
        metadata: {
          treeChildCount,
          treeConnectionHeight,
        }
      } as HierarchyItem<Frame>;
    });
}
