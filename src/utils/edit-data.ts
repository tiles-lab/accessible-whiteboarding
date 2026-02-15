import { Item } from "@mirohq/websdk-types"
import { ItemsProps } from "@mirohq/websdk-types/core/builder/types"

// Gives us access to nested properties, like style.fillColor
type NestedKeyOf<T> = {
  [K in keyof T & string]:
    NonNullable<T[K]> extends object
      ? K | `${K}.${NestedKeyOf<NonNullable<T[K]>>}`
      : K
}[keyof T & string]

type FormField<T extends Item> = {
    fieldName: NestedKeyOf<ItemsProps<T>>
    currentValue?: string
    fieldType: 'text' | 'color'
    required?: boolean
    inputProps?: any
}

type EditData<T extends Item> = {
    item: T
    fields: FormField<T>[]
    title: string
}

export const editData = async <T extends Item> (props: EditData<T>) => {
    if (await miro.board.ui.canOpenModal()) {
        await miro.board.ui.openModal<EditData<T>>({
          data: props,
          url: 'modals/edit-dialog.html',
          width: 600,
          height: 400,
          fullscreen: false,
      });
    }
}