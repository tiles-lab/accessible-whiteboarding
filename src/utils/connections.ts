import { Item } from "@mirohq/websdk-types";
import { ConnectableItem } from "@models/item";
import { isFrame } from "./items";

export async function disconnectFromParent(item: ConnectableItem, parent: Item): Promise<void> {
    if (isFrame(parent)) {
        await parent.remove(item);
    }

    const connectors = await item.getConnectors();

    await Promise.all(connectors.map(connector => miro.board.remove(connector)));

    return;
}
