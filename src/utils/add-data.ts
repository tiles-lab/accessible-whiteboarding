import { Frame, StickyNote, Text } from "@mirohq/websdk-types"
import { ItemsProps } from "@mirohq/websdk-types/core/builder/types"
import { NestedKeyOf } from "./edit-data"

type FormField<T extends Frame | StickyNote | Text> = {
    fieldName: NestedKeyOf<ItemsProps<T>>
    fieldType: 'text' | 'color' | 'color_map' | 'number'
    required?: boolean
    inputProps?: Record<string, string | number | boolean>
}

type AddData = {
    frameFields?: FormField<Frame>[]
    stickyNoteFields?: FormField<StickyNote>[]
    textFields?: FormField<Text>[]
    title: string
}

export const addData = async (props: AddData) => {
    if (await miro.board.ui.canOpenModal()) {
        await miro.board.ui.openModal<AddData>({
          data: props,
          url: 'modals/add-dialog.html',
          width: 600,
          height: 400,
          fullscreen: false,
      });
    }
}