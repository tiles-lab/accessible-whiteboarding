import { Rect } from "@mirohq/websdk-types";
import { isOverlapping, RelativeBounds } from "./canvas-geometry";

export interface SpiralSearchOptions {
    startingRingSize?: number;
    ringMargin?: number;
    maxRingCount?: number;
}

export const SPIRAL_SEARCH_DEFAULT_OPTIONS: Required<SpiralSearchOptions> = {
    startingRingSize: 20,
    ringMargin: 20,
    maxRingCount: 10
}

// assumed all item positions are absolute
export function spiralSearch(item: Rect, existingItems: Rect[], origin: RelativeBounds, options?: SpiralSearchOptions): RelativeBounds | null {
    if (!existingItems?.length) {
        return origin;
    }

    const startingRingSize = options?.startingRingSize ?? SPIRAL_SEARCH_DEFAULT_OPTIONS.startingRingSize;
    const ringMargin = options?.ringMargin ?? SPIRAL_SEARCH_DEFAULT_OPTIONS.ringMargin;
    const maxRingCount = options?.maxRingCount ?? SPIRAL_SEARCH_DEFAULT_OPTIONS.maxRingCount;

    const ringWidth = Math.max(item.width, item.height) + ringMargin;

    let lastAttempt: RelativeBounds | null = null;
    for (let ringIndex = 0; ringIndex < maxRingCount; ringIndex++) {
        const radiusOffset = startingRingSize;
        const ringSliceCount = (ringIndex + 1) * 4 + 4;
        const radius = radiusOffset + ringWidth * (ringIndex + 1) * 1.5; // radius from origin

        // NOTE: leaving this commented for now, not sure if we want this optimization
        // const minAngularOffset = Math.atan2(
        //     Math.max(item.width, item.height),
        //     radius,
        // ); // leave space for arrows to pass through

        for (let sliceIndex = 0; sliceIndex < ringSliceCount; sliceIndex++) {
            // avoid making a grid-like alignment
            const sliceAngle = (2 * Math.PI) / ringSliceCount;
            const ringOffset = ((ringIndex + 1) % 2) * sliceAngle * 0.5;
            const angle = ringOffset + ((Math.PI / 2) - (sliceIndex / ringSliceCount) * 2 * Math.PI);

            // NOTE: leaving this commented for now, not sure if we want this optimization
            //
            // since board items can be placed manually by sighted users, we have no control
            // over whether the next ideal placement lands neatly within the slice
            // so we do an additional check to ensure enough space for arrows to pass through
            // const isBelowOffset = existingItems.some(existingItem => {
            //     const existingAngle = Math.atan2(existingItem.y - origin.y, existingItem.x - origin.x);
            //     const angleDifference = Math.abs(angle - existingAngle);
            //     const wraparound = Math.min(angleDifference, 2 * Math.PI - angleDifference);

            //     return wraparound < minAngularOffset;
            // });

            // if (isBelowOffset) {
                // skip to next slice
                // continue;
            // }

            const candidate: RelativeBounds = {
                relativeTo: 'canvas_center',
                x: origin.x + radius * Math.cos(angle),
                y: origin.y + radius * Math.sin(angle),
                width: item.width,
                height: item.height,
            };

            lastAttempt = candidate;

            const isFreeSpace = existingItems.every(existingItem => !isOverlapping(existingItem, candidate));

            if (isFreeSpace) {
                return lastAttempt;
            }
        }
    }

    // giving up
    return lastAttempt;
}
