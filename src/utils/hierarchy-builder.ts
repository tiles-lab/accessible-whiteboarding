import type { Item, Frame } from '@mirohq/websdk-types';
import { ConnectionRecord, getLabel } from '@utils/items';
import type { HierarchyItem } from '@models/item';
import { ItemRecord, TagRecord } from '@models/record';
import { getTags } from './tags';

export function buildHierarchy(
  item: Item,
  builderOptions: {
    tagRecord: TagRecord;
    itemRecord: ItemRecord;
    connectionRecord: ConnectionRecord;
  }
): HierarchyItem<Item> {
  const { tagRecord, itemRecord } = builderOptions;

  const hierarchyItem: HierarchyItem<Item> = {
    id: item.id,
    type: item.type,
    item,
    label: getLabel(item),
    tags: getTags(item, tagRecord),
  };

  if (item.type === 'frame') {
    const children: HierarchyItem<Item>[] = (item as Frame).childrenIds.map(
      childId => {
        const childItem = itemRecord[childId];

        return buildHierarchy(childItem, builderOptions);
      }
    );

    hierarchyItem.children = children;
  }

  return hierarchyItem;
}
