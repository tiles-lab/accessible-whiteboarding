import { Frame, Item, StickyNote, Text } from '@mirohq/websdk-types';
import { ItemsProps } from '@mirohq/websdk-types/core/builder/types';

export type EditableItems = Frame | StickyNote | Text;

type NestedKeyOf<T> = {
  [K in keyof T & string]: NonNullable<T[K]> extends object
    ? K | `${K}.${NestedKeyOf<NonNullable<T[K]>>}`
    : K;
}[keyof T & string];

type AddFormField<T extends EditableItems> = {
  fieldName: NestedKeyOf<ItemsProps<T>>;
  fieldType: 'text' | 'color' | 'color_map' | 'number' | 'parent';
  required?: boolean;
  inputProps?: Record<string, string | number | boolean>;
};

type EditFormField<T extends EditableItems> = AddFormField<T> & {
  currentValue?: string | number | boolean;
};

export type AddModalProperties = {
  action: 'add';
  title: string;
  frameFields?: AddFormField<Frame>[];
  stickyNoteFields?: AddFormField<StickyNote>[];
  textFields?: AddFormField<Text>[];
};

export type ConnectModalProperties = {
  action: 'connect';
  title: string;
  item: Item;
};

export type DeleteModalProperties = {
  action: 'delete';
  title: string;
  id: Item['id'];
};

export type EditModalProperties<T extends EditableItems = EditableItems> = {
  action: 'edit';
  title: string;
  item: T;
  fields: EditFormField<T>[];
};

export type ModalProperties =
  | AddModalProperties
  | ConnectModalProperties
  | DeleteModalProperties
  | EditModalProperties;
