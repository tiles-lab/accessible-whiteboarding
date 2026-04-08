import { Connector, Frame, Rect } from "@mirohq/websdk-types";
import { Endpoint } from "@mirohq/websdk-types/core/features/widgets/connector";
import { ConnectableItem, HierarchyItem, HierarchyItemType } from "@models/item";
import { isConnectableItem, isConnector, isFrame, isHierarchyItem } from "./items";
import { canBeContainedIn, getAbsolutePosition, getSpatialBounds, Position, RelativeBounds } from "./canvas-geometry";
import { spiralSearch } from "./placement-strategy";
import { expandFrameTowardsItem, getSnapOffset } from "./canvas-items";

export interface ItemPlacementOptions {
    x?: number | null;
    y?: number | null;
    height?: number | null;
    width?: number | null;
    parent?: HierarchyItem | null;
    frame?: Frame;
    siblings?: HierarchyItem[];
}

export async function getItemFrameId(
    item: ConnectableItem, 
    options: { parent?: HierarchyItem, frame?: Frame } = {}
): Promise<Frame['id'] | null> {
    const { frame, parent } = options;

    if (frame?.id) {
        return frame.id;
    }

    if (isHierarchyItem(parent?.item)) {
        return isFrame(parent.item) ? parent.id : parent.item.parentId;
    }

    return item.parentId;
}

export async function placeItem(item: ConnectableItem, options: ItemPlacementOptions = {}): Promise<void> {
    const { parent } = options;

    if (isHierarchyItem(parent?.item)) {
        let frame: Frame | undefined = undefined;

        const frameId = await getItemFrameId(item, { parent, frame: options.frame });

        if (frameId) {
            frame = await miro.board.getById(frameId) as Frame;

            const futurePlacement = await findFuturePlacement(item, { 
                width: item.width, 
                height: item.height,
                parent,
                frame,
            });

            if (futurePlacement && isConnectableItem(item)) {
                const parentAbsolutePos = getAbsolutePosition(parent.item, frame);
                const parentRect = {
                    x: parentAbsolutePos.x,
                    y: parentAbsolutePos.y,
                    height: parent.item.height,
                    width: parent.item.width,
                };

                if (parent.id !== frameId) {
                    // only add connectors if parent exists and is not a frame
                    const connectorEndpoints = calculateConnectorEndpoints(parentRect, futurePlacement);

                    await miro.board.createConnector({
                        shape: 'curved',
                        start: {
                            item: parent.item.id,
                            snapTo: connectorEndpoints.start.snapTo,
                        },
                        end: {
                            item: item.id,
                            snapTo: connectorEndpoints.end.snapTo,
                        }
                    });
                }

                item.x = futurePlacement.x;
                item.y = futurePlacement.y;

                await item.sync();
                await frame.add(item);
            } else {
                // cannot add to frame, but we rearrange so it does not overlap other failed attempts

                const emptySpot = await findFramePlacement(item);
                item.x = emptySpot.x;
                item.y = emptySpot.y;
                await item.sync();
            }
        }
    }
}

export async function findFuturePlacement(item: ConnectableItem, options?: ItemPlacementOptions): Promise<RelativeBounds | null> {
    const { parent, frame } = options ?? {};

    // base case, delegate to Miro's auto-placement
    if (!frame && !parent) {
        const autoPosition = await miro.board.findEmptySpace(item);
        
        item.x = autoPosition.x;
        item.y = autoPosition.y;
        item.sync();

        return item;
    }

    // case 2: frame parent, no connectors
    if (frame) {
        const frameChildren = await frame.getChildren();

        const existingItems = frameChildren
            .filter(child => isConnectableItem(child) || isConnector(child))
            .map(child => {
                // fallback to frame center to fail gracefully
                let absolutePosition = {
                    x: frame.x,
                    y: frame.y,
                };
                
                if (isConnector(child)) {
                    const startItem = frameChildren.find(frameChild => frameChild.id === child.start?.item);
                    const endItem = frameChildren.find(frameChild => frameChild.id === child.end?.item);

                    if (isConnectableItem(startItem) && isConnectableItem(endItem)) {
                        absolutePosition = getConnectorPosition(child, startItem, endItem, frame); 
                    }
                } else {
                    absolutePosition = getAbsolutePosition(child, frame);
                }

                return {
                    x: absolutePosition.x,
                    y: absolutePosition.y,
                    width: child.width,
                    height: child.height,  
                };
            });

        let spiralOrigin: RelativeBounds = frame;

        if (isHierarchyItem(options?.parent?.item)) {
            const parentPos = getAbsolutePosition(options.parent.item, frame);
            spiralOrigin = {
                relativeTo: 'canvas_center',
                x: parentPos.x,
                y: parentPos.y,
                width: options.parent.item.width,
                height: options.parent.item.height,
            }
        }

        const attemptBounds = spiralSearch(item, existingItems, spiralOrigin);

        if (attemptBounds) {
            if (canBeContainedIn(attemptBounds, frame)) {
                return attemptBounds;
            }

            // resize frame after several failed attempts
            await expandFrameTowardsItem(frame, attemptBounds);
            return attemptBounds;
        }
    }

    return null;
};

export async function findFramePlacement(options?: ItemPlacementOptions): Promise<{ x: number; y: number }> {
    const x = options?.x ?? 0;
    const y = options?.y ?? 0;
    const height = options?.height ?? 200; // todo: move to config
    const width = options?.width ?? 200;

    // simplest case: fallback to Miro's computation
    const candidateEmptySpace = await miro.board.findEmptySpace({
        x,
        y,
        height,
        width,
    });

    return {
        x: candidateEmptySpace.x,
        y: candidateEmptySpace.y,
    };
};

// return position based on connector's origin
export function getConnectorPosition(connector: Connector, startItem: ConnectableItem, endItem: ConnectableItem, relativeParent?: HierarchyItemType): Position {
    const startAbsPos = getAbsolutePosition(startItem, relativeParent);
    const endAbsPos = getAbsolutePosition(endItem, relativeParent);

    const connectorStartPos = getSnapOffset(startAbsPos, startItem, connector.start?.snapTo);
    const connectorEndPos = getSnapOffset(endAbsPos, endItem, connector.end?.snapTo);

    return {
        x: (connectorStartPos.x + connectorEndPos.x) * 0.5,
        y: (connectorStartPos.y + connectorEndPos.y) * 0.5,
    };
}


// Assume all positions are absolute
export function calculateConnectorEndpoints(startItem: Rect, endItem: Rect): { start: Endpoint; end: Endpoint } {
    const endpoints: { start: Endpoint; end: Endpoint } = {
        start: {
            snapTo: 'auto',
        },
        end: {
            snapTo: 'auto'
        }
    };

    const startBounds = getSpatialBounds(startItem);
    const endBounds = getSpatialBounds(endItem);

    // bias towards x-hemispheres
    if (endBounds.xMin > startBounds.xMax) {
        endpoints.start.snapTo = 'right';
        endpoints.end.snapTo = 'left';
    } else if (endBounds.xMax < startBounds.xMin) {
        endpoints.start.snapTo = 'left';
        endpoints.end.snapTo = 'right';
    } else { // both start and end items are vertical aligned
        if (endBounds.yMin > startBounds.yMax) {
            endpoints.start.snapTo = 'bottom';
            endpoints.end.snapTo = 'top';
        } else if (endBounds.yMax < startBounds.yMin) {
            endpoints.start.snapTo = 'top';
            endpoints.end.snapTo = 'bottom';
        } // else: overlap, fallback to auto
    }

    return endpoints;
}
