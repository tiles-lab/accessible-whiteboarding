import { Frame, Rect } from "@mirohq/websdk-types";
import { ConnectableItem } from "@models/item";
import { getSpatialBounds, Position } from "./canvas-geometry";

export async function expandFrameTowardsItem(frame: Frame, item: Rect) {
    const frameBounds = getSpatialBounds(frame);
    const itemBounds = getSpatialBounds(item);
    const oldY = frame.y;
    let extraHeight = 0;

    if (itemBounds.xMin > frameBounds.xMax) {
        const extraWidth = Math.abs(itemBounds.xMax - frameBounds.xMax);
        frame.width += extraWidth;
        frame.x += extraWidth * 0.5;
    }
    if (itemBounds.xMax < frameBounds.xMin) {
        const extraWidth = Math.abs(frameBounds.xMin - itemBounds.xMin);
        frame.width += extraWidth;
        frame.x -= extraWidth * 0.5;
    }

    if (itemBounds.yMax > frameBounds.yMax) {
        extraHeight = Math.abs(itemBounds.yMax - frameBounds.yMax);
        frame.height += extraHeight;
        frame.y += extraHeight * 0.5;
        
    }
    if (itemBounds.yMin < frameBounds.yMin) {
        extraHeight = Math.abs(frameBounds.yMin - itemBounds.yMin);
        frame.height += extraHeight;
        frame.y -= extraHeight * 0.5;
    }

    console.log('frameBounds.yMin', frameBounds.yMin);
    console.log('frameBounds.yMax', frameBounds.yMax);
    console.log('itemBounds.yMin', itemBounds.yMin);
    console.log('itemBounds.yMax', itemBounds.yMax);
    console.log('extraHeight', extraHeight);
    console.log('frame.y before/after', oldY, frame.y);

    

    await frame.sync();
}

export function getSnapOffset(position: Position, item: ConnectableItem, snapTo?: string): Position {
    switch (snapTo) {
        case 'top':    return { x: position.x, y: position.y - item.height * 0.5 };
        case 'bottom': return { x: position.x, y: position.y + item.height * 0.5 };
        case 'left':   return { x: position.x - item.width * 0.5, y: position.y };
        case 'right':  return { x: position.x + item.width * 0.5, y: position.y };
        default:       return position; // auto: todo: should calculate based on direction relative to counterpart
    }
}
