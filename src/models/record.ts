import { Connector, Item, Tag } from "@mirohq/websdk-types";
import { HierarchyItem } from "./item";

export type TagRecord = Record<Tag['id'], Tag>;
export type ItemRecord = Record<Item['id'], Item>;
export type HierarchyItemRecord = Record<HierarchyItem['id'], HierarchyItem>;
export type ConnectorRecord = Record<Connector['id'], Connector>;
