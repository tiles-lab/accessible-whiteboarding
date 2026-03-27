import { Frame, Rect } from "@mirohq/websdk-types";
import { ConnectableItem, HierarchyItemType } from "@models/item";

export type Position = {
    x: number;
    y: number;
};

export type RelativeBounds = Required<Pick<ConnectableItem, 'relativeTo' | 'x'| 'y' | 'width' | 'height'>>;

export interface Bounds {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
}

// Miro sets x,y to origin but we want 4-sided bounds in 2D space
export function getSpatialBounds(rect: Rect): Bounds {
    const midWidth = rect.width * 0.5;
    const midHeight = rect.height * 0.5;

    return {
        xMin: rect.x - midWidth,
        yMin: rect.y - midHeight,
        xMax: rect.x + midWidth,
        yMax: rect.y + midHeight,
    };
}

export function isOverlapping(a: Rect, b: Rect): boolean {
    const aa = getSpatialBounds(a);
    const bb = getSpatialBounds(b);

    const padding = 10;

    return aa.xMin < bb.xMax + padding
        && aa.xMax > bb.xMin - padding
        && aa.yMin < bb.yMax + padding
        && aa.yMax > bb.yMin - padding;
}

export function canBeContainedIn(candidateItem: RelativeBounds, frame: Frame): boolean {
    // we assume frame.relativeTo is always `canvas_center` so we calculate item position relative to its parent
    // const itemPosInCanvas = getAbsolutePosition(candidateItem);

    const itemBounds = getSpatialBounds(candidateItem);
    const frameBounds = getSpatialBounds(frame);

    return itemBounds.xMin >= frameBounds.xMin && itemBounds.xMax <= frameBounds.xMax
        && itemBounds.yMin >= frameBounds.yMin && itemBounds.yMax <= frameBounds.yMax;
}


export function getAbsolutePosition(item: RelativeBounds, relativeParent?: HierarchyItemType): Position {
    if (item.relativeTo === 'canvas_center') {
        return {
            x: item.x,
            y: item.y,
        };
    }

    else if (item.relativeTo === 'parent_top_left' && relativeParent) {
        const parentAbsolutePosition = getAbsolutePosition(relativeParent);

        // relativeTo parent_top_left is x right, y- up
        // relativeTo canvas_center is x right, y+ up
        const parentTopLeft = {
            x: parentAbsolutePosition.x - (relativeParent.width * 0.5),
            y: parentAbsolutePosition.y - (relativeParent.height * 0.5),
        }

        return {
            x: parentTopLeft.x + item.x,
            y: parentTopLeft.y + item.y,
        };
    }

    else if (item.relativeTo === 'parent_center' && relativeParent) {
        // todo, have not encountered this yes
        console.log("relative To PARENT_CENTER", item);

        const parentAbsolutePosition = getAbsolutePosition(relativeParent);

        return {
            x: parentAbsolutePosition.x + item.x,
            y: parentAbsolutePosition.y + item.y,
        };
    }

    else {
        // worst case
        return {
            x: 0,
            y: 0,
        };
    }
}
