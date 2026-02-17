import type { Connector, Frame, Item, StickyNote, Text } from '@mirohq/websdk-types';
import { Connection, ItemType } from '@models/item';
import { ItemRecord } from '@models/record';

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

export function buildConnectionRecord(items: ItemRecord): ConnectionRecord {
  const connectors: Connector[] = Object.values(items)
    .filter((item): item is Connector => item.type === ItemType.Connector);

  const connectionMap: ConnectionRecord = connectors.reduce((acc, connector) => {

    const startId = connector.start?.item; 
    const endId = connector.end?.item; 

    const startItem = startId ? items[startId] : undefined;
    const endItem = endId ? items[endId] : undefined;

    console.log("connector", connector);

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
