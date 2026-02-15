import { Item, StickyNote, Tag } from "@mirohq/websdk-types";
import { ItemNames } from "@models/item";
import { TagRecord } from "@models/record";

export function getTags(item: Item, tagRecord: TagRecord): Tag[] | undefined {
  if (item.type === ItemNames.stickyNote) {
    return (item as StickyNote).tagIds
      .map(tagId => tagRecord[tagId])
      .filter(tag => !!tag);
  }

  return [];
}
