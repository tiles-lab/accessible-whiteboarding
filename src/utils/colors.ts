import { Item } from "@mirohq/websdk-types";
import { ColorConfig, StickyNoteColorConfigMap, TagColorConfigMap } from "@models/colors";
import { isStickyNote, isTag } from "./items";

export function getColorConfig(item?: Item): ColorConfig | undefined {
    if (!item) {
        return;
    }
    
    if (isTag(item)) {
        return TagColorConfigMap[item.id];
    }

    if (isStickyNote(item)) {
        const colorKey = item.style.fillColor;

        return StickyNoteColorConfigMap[colorKey];
    }

    return;
}
