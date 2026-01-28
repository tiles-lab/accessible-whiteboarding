import type { Item, Frame, StickyNote, Tag } from '@mirohq/websdk-types';
import { getLabel } from '@utils/items';
import type { HierarchyItem } from '@models/item';

export type TagRecord = Record<Tag['id'], Tag>;
export type ItemRecord = Record<Item['id'], Item>;

function getTags(item: Item, tagRecord: TagRecord): Tag[] | undefined {
  if (item.type === 'sticky_note') {
    return (item as StickyNote).tagIds
      .map(tagId => tagRecord[tagId])
      .filter(tag => !!tag);
  }

  return [];
}

export function buildHierarchy(
  item: Item,
  builderOptions: {
    tagRecord: TagRecord;
    itemRecord: ItemRecord;
  }
): HierarchyItem<Item> {
  const { tagRecord, itemRecord } = builderOptions;

  const hierarchyItem: HierarchyItem<Item> = {
    id: item.id,
    type: item.type,
    data: item,
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
