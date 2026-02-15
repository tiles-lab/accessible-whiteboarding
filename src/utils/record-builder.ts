import { Connector, Item, StickyNote, Tag } from "@mirohq/websdk-types";
import { HierarchyItem, ItemNames } from "@models/item";
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
    item: StickyNote, 
    buildOptions: {
        connectorRecord: ConnectorRecord, 
        itemRecord: ItemRecord,
        tagRecord: TagRecord,
    },
    visited = new Set<StickyNote['id']>(), 
): HierarchyItem<StickyNote> {
    const { connectorRecord, itemRecord, tagRecord } = buildOptions;

    visited.add(item.id);

    const children: HierarchyItem<StickyNote>[] = [];

    (item.connectorIds ?? []).forEach(connectorId => {
      const connector = connectorRecord[connectorId];
      const endId = connector?.end?.item;

      if (endId && !visited.has(endId)) {
        const childItem = itemRecord[endId];
        if (childItem?.type === ItemNames.stickyNote) {
          children.push(buildConnectorChild(childItem as StickyNote, buildOptions))
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

export function buildConnectorHierarchy(
  items: Item[]
): HierarchyItem<StickyNote>[] {
  const stickyNotes = items.filter(
    (item): item is StickyNote => item.type === 'sticky_note'
  );
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
  const roots = stickyNotes.filter(note => !hasIncomingConnector.has(note.id));

  const hierarchyItems = roots.map(root => buildConnectorChild(root, { connectorRecord, itemRecord, tagRecord }));

  return hierarchyItems;
}
