import type {
  AppCard,
  BaseItem,
  Card,
  Embed,
  Shape,
  StickyNote,
  Tag,
  Image,
  Text,
  Preview,
  Item,
  Connector,
} from '@mirohq/websdk-types';

// Miro does not provide a type for Item types so we're defining it
export type ItemType =
  | 'frame'
  | 'sticky_note'
  | 'text'
  | 'stamp'
  | 'connector'
  | 'tag'
  | 'embed'
  | 'shape'
  | 'group';

export interface ItemTypeConfig {
  displayLabel: string;
}

export const ItemTypeConfigMap: Record<ItemType, ItemTypeConfig> = {
  frame: { displayLabel: 'Frame' },
  sticky_note: { displayLabel: 'Sticky Note' },
  text: { displayLabel: 'Text' },
  stamp: { displayLabel: 'Stamp' },
  connector: { displayLabel: 'Connector' },
  tag: { displayLabel: 'Tag' },
  embed: { displayLabel: 'Embed' },
  group: { displayLabel: 'Group' },
  shape: { displayLabel: 'Shape' },
};

export interface Connection {
  id: Connector["id"];
  connector: Connector;
  startItem?: Item;
  endItem?: Item;
}

export interface HierarchyItem<T extends Item = Item> {
  id: BaseItem['id'];
  type: BaseItem['type'];
  item?: T;
  label: string;
  tags?: Tag[];
  children?: HierarchyItem[];
  connections?: Connection[]
}

export type TopLevelItem =
  | StickyNote
  | Card
  | AppCard
  | Image
  | Text
  | Shape
  | Embed
  | Preview;
