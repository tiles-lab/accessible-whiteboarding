import { Item, StickyNote } from "@mirohq/websdk-types";
import { ColorConfig, StickyNoteColorConfigMap, TagColorConfigMap } from "@models/colors";
import { ItemType } from "@models/item";

export function getColorConfig(item?: Item): ColorConfig | undefined {
    if (!item) {
        return;
    }
    
    if (item.type === ItemType.Tag) {
        return TagColorConfigMap[item.id];
    }

    if (item.type === ItemType.StickyNote) {
        const colorKey = (item as StickyNote).style.fillColor;

        return StickyNoteColorConfigMap[colorKey];
    }

    return;
}
