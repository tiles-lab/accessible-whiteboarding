import { Connector, Frame, Item, StickyNote, Tag, Text } from "@mirohq/websdk-types";
import { HierarchyItem, ItemNames } from "@models/item";
import { ItemRecord, HierarchyItemRecord, ConnectorRecord, TagRecord } from "@models/record";
import { getLabel } from "./items";
import { getTags } from "./tags";

type BuildOptions = {
  connectorRecord: ConnectorRecord,
  itemRecord: ItemRecord,
  tagRecord: TagRecord,
}

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
    item: StickyNote | Text,
    buildOptions: BuildOptions,
    visited = new Set<StickyNote['id'] | Text['id']>(),
): HierarchyItem<StickyNote | Text> {
    const { connectorRecord, itemRecord, tagRecord } = buildOptions;

    visited.add(item.id);

    const children: HierarchyItem<StickyNote | Text>[] = [];

    (item.connectorIds ?? []).forEach(connectorId => {
      const connector = connectorRecord[connectorId];
      const endId = connector?.end?.item;

      if (endId && !visited.has(endId)) {
        const childItem = itemRecord[endId];
        if (childItem?.type === ItemNames.stickyNote) {
          children.push(buildConnectorChild(childItem as StickyNote, buildOptions))
        }

        if (childItem?.type === ItemNames.text) {
          children.push(buildConnectorChild(childItem as Text, buildOptions))
        }
      }
    });

    const tags = item.type === ItemNames.stickyNote ? {
      tags: getTags(item, tagRecord)
    } : {}

    return {
      id: item.id,
      type: item.type,
      item,
      label: getLabel(item),
      ...tags,
      children: children.length ? children : undefined,
    };
  }

function buildTopLevelHierarchy (
  items: Item[],
  hierarchyItems: HierarchyItem<StickyNote | Text>[]
): HierarchyItem[] {
  const filteredItems = items.filter((item) => {
    if (item.type === ItemNames.frame
      || item.type === ItemNames.text
      || item.type === ItemNames.stickyNote
    ) {
      if (item.type === ItemNames.frame) {
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
        item: item,
        children: hierarchyItems.filter(child => {
          return item.childrenIds.includes(child.id)
        })
      }
    } else {
      return {
        ...item,
        item: item,
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
    item => item.type === ItemNames.stickyNote || item.type === ItemNames.text
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

  // Roots = sticky notes or text with no incoming edges
  const roots = connectingItemTypes.filter(connectingItem => !hasIncomingConnector.has(connectingItem.id));

  const hierarchyItems = roots.map(root => buildConnectorChild(root, { connectorRecord, itemRecord, tagRecord }));

  const topLevelItems = buildTopLevelHierarchy(items, hierarchyItems);

  return topLevelItems.map((item: Item | HierarchyItem) => {
    if (item.type === ItemNames.stickyNote) {
      return buildConnectorChild(item as StickyNote, { connectorRecord, itemRecord, tagRecord })
    }

    if (item.type === ItemNames.text) {
      return buildConnectorChild(item as Text, { connectorRecord, itemRecord, tagRecord })
    }

    return item as HierarchyItem<Frame>
  })
}
