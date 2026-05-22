import { Rect } from "@mirohq/websdk-types";
import { findBoardPlacement } from "./item-placer";
import { RelativeBounds } from "./canvas-geometry";
import { getToplevelRects } from "./canvas-items";
import { gridSearch } from "./placement-strategy";

export interface FramePlacementOptions {
    width?: number | null;
    height?: number | null;
    x?: number | null;
    y?: number | null;
}

export async function getFramePlacement(frame: Rect, options: FramePlacementOptions = {}): Promise<RelativeBounds> {
    const existingItems = await getToplevelRects();
    
    let spiralOrigin: RelativeBounds = { 
        x: options.x ?? frame.x ?? 0, 
        y: options.y ?? frame.y ?? 0, 
        width: 10000, 
        height: 10000, 
        relativeTo: 'canvas_center' 
    };

    let futurePlacement = gridSearch(frame, existingItems, spiralOrigin);

    if (!futurePlacement) {
        futurePlacement = await findBoardPlacement(frame);
    }

    return futurePlacement;
}
