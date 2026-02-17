import { Connector, Item, Tag } from "@mirohq/websdk-types";
import { HierarchyItem, ItemType } from "@models/item";
import { ItemRecord, HierarchyItemRecord, ConnectorRecord } from "@models/record";
import { ConnectionRecord } from "./items";

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

export function buildConnectionRecord(items: ItemRecord): ConnectionRecord {
  const connectors: Connector[] = Object.values(items)
    .filter((item): item is Connector => item.type === ItemType.Connector);

  const connectionMap: ConnectionRecord = connectors.reduce((acc, connector) => {

    const startId = connector.start?.item; 
    const endId = connector.end?.item; 

    const startItem = startId ? items[startId] : undefined;
    const endItem = endId ? items[endId] : undefined;

    acc[connector.id] = {
      id: connector.id,
      connector,
      startItem,
      endItem,
    };

    return acc;
  }, {} as ConnectionRecord);

  return connectionMap;
}
