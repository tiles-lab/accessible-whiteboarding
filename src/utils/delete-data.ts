import { Item } from "@mirohq/websdk-types";

type DeleteData = {
    id: Item['id']
    title: string
}

export const deleteData = async (props: DeleteData) => {
    if (await miro.board.ui.canOpenModal()) {
        await miro.board.ui.openModal<DeleteData>({
          data: props,
          url: 'modals/delete-dialog.html',
          width: 350,
          height: 150,
          fullscreen: false,
      });
    }
}