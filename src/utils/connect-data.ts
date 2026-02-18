import { Item } from "@mirohq/websdk-types"

type ConnectData<T extends Item> = {
    item: T
    title: string
}

export const connectData = async <T extends Item> (props: ConnectData<T>) => {
    if (await miro.board.ui.canOpenModal()) {
        await miro.board.ui.openModal<ConnectData<T>>({
            data: props,
            url: 'modals/connections-dialog.html',
            width: 600,
            height: 400,
            fullscreen: false
        })
    }
}