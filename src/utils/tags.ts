import { Item, StickyNote, Tag } from "@mirohq/websdk-types";
import { TagRecord } from "@models/record";

export function getTags(item: Item, tagRecord: TagRecord): Tag[] | undefined {
  if (item.type === 'sticky_note') {
    return (item as StickyNote).tagIds
      .map(tagId => tagRecord[tagId])
      .filter(tag => !!tag);
  }

  return [];
}
