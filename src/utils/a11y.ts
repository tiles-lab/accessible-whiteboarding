import { HierarchyItem, HierarchyItemType } from "@models/item";
import { isStickyNote } from "./items";
import { EarconRegistry } from "@config/earcons";
import { StickyNoteColor } from "@mirohq/websdk-types";

export function getA11yLabelledBy(hierarchyItem: HierarchyItem): string {
    let parts: string[] = [`heading`, 'metadata-tree'];

    if (isStickyNote(hierarchyItem.item)) {
        parts.push(`metadata-color`);
        parts.push(`metadata-tags`);
    }

    return parts.map(part => `${hierarchyItem.id}-${part}`).join(" ");
}

export interface EarconOptions {
  category?: HierarchyItemType;
  color?: string;
}

export function getEarcon({ category, color }: EarconOptions): string | undefined {
    let audioSrc: string | undefined;

    if (isStickyNote(category)) {
        const config = EarconRegistry.sticky_note[category.style.fillColor];

        if (config?.audio) {
            audioSrc = config.audio;
        }
    } else if (color) {
        const config = EarconRegistry.sticky_note[color as StickyNoteColor];

        if (config?.audio) {
            audioSrc = config.audio;
        }
    }

    return audioSrc;
}
