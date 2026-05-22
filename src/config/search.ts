import { ItemType, ItemTypeConfig, ItemTypeConfigMap } from "@models/item";

export type ItemTypeFilterOption = { type: ItemType } & ItemTypeConfig;
export const ITEM_TYPE_FILTER_OPTIONS: ItemTypeFilterOption[] = [
    ItemType.StickyNote,
    ItemType.Frame,
    ItemType.Text,
]
.map(itemType => ({
    type: itemType,
    ...ItemTypeConfigMap[itemType]
}));

export const ALL_ITEM_TYPES = 'all_types';
export const ALL_ITEM_TYPES_FILTER_OPTION = {
    type: ALL_ITEM_TYPES,
    displayLabel: 'All types',
}
