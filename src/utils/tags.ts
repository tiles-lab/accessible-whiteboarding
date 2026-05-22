import { Item, StickyNote, Tag } from "@mirohq/websdk-types";
import { ItemType } from "@models/item";
import { TagRecord } from "@models/record";

export function getTags(item: Item, tagRecord: TagRecord): Tag[] | undefined {
  if (item.type === ItemType.StickyNote) {
    return (item as StickyNote).tagIds
      .map(tagId => tagRecord[tagId])
      .filter(tag => !!tag);
  }

  return [];
}
