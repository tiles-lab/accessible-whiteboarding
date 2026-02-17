import { Connector, Frame, Item, StickyNote, Tag, Text } from "@mirohq/websdk-types";
import { ConnectableItem, HierarchyItem, ItemType } from "@models/item";
import { ItemRecord, HierarchyItemRecord, ConnectorRecord, TagRecord } from "@models/record";
import { getLabel } from "./items";
import { getTags } from "./tags";

export function buildTagRecord(items: Item[]) {
    return items
      .filter(item => item.type === 'tag')
      .reduce(
        (acc, item) => {
          if (item.type === 'tag') {
            acc[item.id] = item as Tag;
          }

          return acc;
        },
        {} as Record<Tag['id'], Tag>
      );
}

export function buildItemRecord(items: Item[]) {
    return items.reduce((acc, item) => {
        acc[item.id] = item;

        return acc;
    },
    {} as ItemRecord
    );
}

export function buildHierarchyItemRecord(hierarchyItems: HierarchyItem[]): HierarchyItemRecord {
    return hierarchyItems.reduce((acc, hierarchyItem) => {
        acc[hierarchyItem.id] = hierarchyItem;
        return acc;
    }, {} as HierarchyItemRecord);
}

export function buildConnectorRecord(items: Item[]): ConnectorRecord {
    const record = items
        .filter((item): item is Connector => item.type == "connector")
        .reduce((acc, connector) => {
            acc[connector.id] = connector;
            return acc;
        }, {} as ConnectorRecord);

    return record;
}

function buildConnectorChild(
    item: ConnectableItem, 
    buildOptions: {
        connectorRecord: ConnectorRecord, 
        itemRecord: ItemRecord,
        tagRecord: TagRecord,
    },
    visited = new Set<StickyNote['id']>(), 
): HierarchyItem<ConnectableItem> {
    const { connectorRecord, itemRecord, tagRecord } = buildOptions;

    visited.add(item.id);

    const children: HierarchyItem<ConnectableItem>[] = [];

    (item.connectorIds ?? []).forEach(connectorId => {
      const connector = connectorRecord[connectorId];
      const endId = connector?.end?.item;

      if (endId && !visited.has(endId)) {
        const childItem = itemRecord[endId];
        if (childItem?.type === ItemType.StickyNote) {
          children.push(buildConnectorChild(childItem as StickyNote, buildOptions))
        }

        if (childItem?.type === ItemType.Text) {
          children.push(buildConnectorChild(childItem as Text, buildOptions))
        }
      }
    });

    return {
      id: item.id,
      type: 'sticky_note',
      item,
      label: getLabel(item),
      tags: getTags(item, tagRecord),
      children: children.length ? children : undefined,
    };
  }

function buildTopLevelHierarchy (
  items: Item[],
  hierarchyItems: HierarchyItem<ConnectableItem>[]
): HierarchyItem[] {
  const filteredItems = items.filter((item) => {
    if (item.type === ItemType.Frame
      || item.type === ItemType.Text
      || item.type === ItemType.StickyNote
    ) {
      if (item.type === ItemType.Frame) {
        return true
      }

      if ('parentId' in item && hierarchyItems.find(hierarchyItem => hierarchyItem.id === item.id)) {
        return !item.parentId
      }
    }

    return false
  })

  return filteredItems.map((item) => {
    if ('childrenIds' in item) {
      return {
        ...item,
        label: getLabel(item),
        children: hierarchyItems.filter(child => {
          return item.childrenIds.includes(child.id)
        })
      }
    } else {
      return {
        ...item,
        label: getLabel(item)
      }
    }
  })
}

export function buildConnectorHierarchy(
  items: Item[]
): HierarchyItem<StickyNote | Frame | Text>[] {
  // Sticky notes, text, items that can connect to other items
  const connectingItemTypes = items.filter(
    item => item.type === ItemType.StickyNote || item.type === ItemType.Text
  ) as (StickyNote | Text)[];
  const connectorRecord = buildConnectorRecord(items);
  const itemRecord = buildItemRecord(items);
  const tagRecord = buildTagRecord(items);

  // Find items with incoming connector
  const hasIncomingConnector = new Set<Item['id']>();
  Object.values(connectorRecord).forEach(connector => {
    if (connector.end?.item) {
      hasIncomingConnector.add(connector.end.item);
    }
  });

  // Roots = sticky notes with no incoming edges
  const roots = connectingItemTypes.filter(item => !hasIncomingConnector.has(item.id));

  const hierarchyItems = roots.map(root => buildConnectorChild(root, { connectorRecord, itemRecord, tagRecord }));

  const topLevelItems = buildTopLevelHierarchy(items, hierarchyItems);

  return topLevelItems.map((item: Item | HierarchyItem) => {
    if (item.type === ItemType.StickyNote) {
      return buildConnectorChild(item as StickyNote, { connectorRecord, itemRecord, tagRecord })
    }

    if (item.type === ItemType.Text) {
      return buildConnectorChild(item as Text, { connectorRecord, itemRecord, tagRecord })
    }

    return item as HierarchyItem<Frame>
  })
}
