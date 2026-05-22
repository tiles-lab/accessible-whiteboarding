import { Frame, Item, StickyNote, Text } from '@mirohq/websdk-types';
import { ItemsProps } from '@mirohq/websdk-types/core/builder/types';
import { ConnectableItem, HierarchyItem } from './item';

type NestedKeyOf<T> = {
  [K in keyof T & string]: NonNullable<T[K]> extends object
    ? K | `${K}.${NestedKeyOf<NonNullable<T[K]>>}`
    : K;
}[keyof T & string];

type AddFormField<T extends Frame | StickyNote | Text> = {
  fieldName: NestedKeyOf<ItemsProps<T>>;
  fieldType:
    | 'text'
    | 'color'
    | 'color_map'
    | 'number'
    | 'parent'
    | 'rich_text'
    | 'extended_rich_text';
  required?: boolean;
  inputProps?: Record<string, string | number | boolean>;
  defaultValue?: string | number | boolean;
};

type EditFormField<T extends Item> = {
  fieldName: NestedKeyOf<ItemsProps<T>>;
  defaultValue?: string | number | boolean;
  currentValue?: string | number | boolean;
  fieldType:
    | 'text'
    | 'color'
    | 'color_map'
    | 'number'
    | 'rich_text'
    | 'extended_rich_text'
    | 'parent';
  required?: boolean;
  inputProps?: Record<string, string | number | boolean>;
};

export type AddModalProperties = {
  action: 'add';
  title: string;
  frameFields?: AddFormField<Frame>[];
  stickyNoteFields?: AddFormField<StickyNote>[];
  textFields?: AddFormField<Text>[];
  hierarchyItem?: HierarchyItem;
  hierarchyParentId?: ConnectableItem['id'];
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
  hierarchyParentId?: ConnectableItem['id'];
};

export type EditModalProperties<T extends Item = Item> = {
  action: 'edit';
  title: string;
  item: T;
  fields: EditFormField<T>[];
  hierarchyParentId?: ConnectableItem['id'];
};

export type ModalProperties =
  | AddModalProperties
  | ConnectModalProperties
  | DeleteModalProperties
  | EditModalProperties;
