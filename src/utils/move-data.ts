import { Item } from "@mirohq/websdk-types"

type MoveData<T extends Item> = {
    item: T
    title: string
}

export const moveData = async <T extends Item> (props: MoveData<T>) => {
    if (await miro.board.ui.canOpenModal()) {
        await miro.board.ui.openModal<MoveData<T>>({
            data: props,
            url: 'modals/move-dialog.html',
            width: 600,
            height: 400,
            fullscreen: false
        })
    }
}