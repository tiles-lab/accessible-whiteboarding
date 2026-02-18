import type { Frame, Item, StickyNote, Text } from '@mirohq/websdk-types';
import { HierarchyItem, ItemNames, ItemType } from '@models/item';
import Tags from './tags';
import { editData } from '@utils/edit-data';
import { deleteData } from '@utils/delete-data';
import { moveData } from '@utils/move-data';
import { connectData } from '@utils/connect-data';

export interface HierarchyProps {
  hierarchyItem: HierarchyItem<Item>;
}

export interface BoardItemProps<T extends Item = Item> {
  hierarchyItem: HierarchyItem<T>;
  children?: React.ReactNode;
}

export interface TextTypeBoardItemProps {
  hierarchyItem: HierarchyItem<Text>;
}

export interface StickyNoteTypeBoardItemProps {
  hierarchyItem: HierarchyItem<StickyNote>;
}

export interface FrameTypeBoardItemProps {
  hierarchyItem: HierarchyItem<Frame>;
}

export interface ClusterTypeBoardItemProps {
  hierarchyItem: HierarchyItem<Frame>;
}

export interface HierarchyBoardProps {
  type: ItemType;
  label: string;
  children?: HierarchyItem[];
}


export const HierarchyBoard: React.FC<HierarchyBoardProps> = ({
  type,
  label,
  children,
}) => {
  const listItems = children ?? [];

  return (
    <details className="a11ywb-board a11ywb-accordion" open={true}>
      <summary className="a11ywb-accordion-header">
        {type}: {label}
      </summary>

      <div className="a11ywb-accordion__contents">
        {listItems.length > 0 && (
          <ul>
            {listItems.length > 0 &&
              listItems.map(listItem => (
                <li key={listItem.id}>
                  <Hierarchy hierarchyItem={listItem} />
                </li>
              ))}
          </ul>
        )}
        {listItems.length === 0 && <p>This board has no items.</p>}
      </div>
    </details>
  );
};

const BoardItem: React.FC<BoardItemProps<Item>> = ({ hierarchyItem, children }) => {
  const getHeading = () => {
    if (hierarchyItem?.item) {
      if ('parentId' in hierarchyItem.item) {
        if (hierarchyItem.item?.parentId && Boolean(hierarchyItem.item?.parentId)) {
          return <h3>{hierarchyItem.type}</h3>
        }
      }
    }

    return <h2>{hierarchyItem.type}</h2>
  }

  return (
    <article className={`a11ywb-board-item a11ywb-board-item--type-${hierarchyItem.type}`}>
      {getHeading()}
        {hierarchyItem?.label?.startsWith('<p>')
          ? <div dangerouslySetInnerHTML={{ __html: hierarchyItem.label }} />
          : <p>{hierarchyItem.label ?? 'Empty'}</p>
        }
      {children}
    </article>
  );
}

const UnsupportedTypeBoardItem: React.FC<BoardItemProps<Item>> = ({ hierarchyItem }) => {
  return (
    <BoardItem hierarchyItem={hierarchyItem} />
  );
};

const TextTypeBoardItem: React.FC<TextTypeBoardItemProps> = ({ hierarchyItem }) => {
  const hierarchyChildren = hierarchyItem.children ?? []

  return (
    <BoardItem hierarchyItem={hierarchyItem}>
      <button type="button" onClick={() => editData({
        item: hierarchyItem.item,
        title: "Edit Text",
        fields: [
          {
            fieldName: 'content',
            currentValue: hierarchyItem.label,
            fieldType: 'text',
            required: true
          }
        ]
      })}>Edit Text</button>
      <button type="button" onClick={() => moveData({
        item: hierarchyItem.item,
        title: "Move Text",
      })}>Move Text</button>
      <button type="button" onClick={() => connectData({
        item: hierarchyItem.item,
        title: "Text Connections"
      })}>Text Connections</button>
      <button type="button" onClick={() => deleteData({
        id: hierarchyItem.id,
        title: 'Delete Text'
      })}>Delete Text</button>

      {hierarchyChildren?.length ?
      <ul>
        {hierarchyChildren.map(child => (<li key={child.id}><Hierarchy hierarchyItem={child}/></li>))}
      </ul>
     : null}
    </BoardItem>
  );
};

const StickyNoteTypeBoardItem: React.FC<StickyNoteTypeBoardItemProps> = ({
  hierarchyItem,
}) => {
  const color = hierarchyItem.item?.style.fillColor;

  const hierarchyChildren = hierarchyItem.children ?? [];

  return (
    <BoardItem hierarchyItem={hierarchyItem}>

      <span className="a11ywb-board-item__metadata-color" data-color={color}>color: {color}</span>

      <Tags tags={hierarchyItem.tags} />

      <button type="button" onClick={() => editData({
        item: hierarchyItem.item,
        title: "Edit Sticky Note",
        fields: [
          {
            fieldName: 'content',
            currentValue: hierarchyItem.label,
            fieldType: 'text',
            required: true
          },
          {
            fieldName: 'style.fillColor',
            currentValue: hierarchyItem.item.style.fillColor,
            fieldType: 'color_map',
            required: false
          }
        ]
      })}>Edit Sticky Note</button>
      <button type="button" onClick={() => moveData({
        item: hierarchyItem.item,
        title: "Move Sticky Note",
      })}>Move Sticky Note</button>
      <button type="button" onClick={() => connectData({
        item: hierarchyItem.item,
        title: "Sticky Note Connections"
      })}>Sticky Note Connections</button>
      <button type="button" onClick={() => deleteData({
        id: hierarchyItem.id,
        title: 'Delete Sticky Note'
      })}>Delete Sticky Note</button>

     {hierarchyChildren?.length ?
      <ul>
        {hierarchyChildren.map(child => (<li key={child.id}><Hierarchy hierarchyItem={child}/></li>))}
      </ul>
     : null}
    </BoardItem>
  );
};

const ClusterTypeBoardItem: React.FC<ClusterTypeBoardItemProps> = ({
  hierarchyItem,
}) => {
  const listItems = hierarchyItem.children ?? [];

  return (
    <details className="a11ywb-accordion a11ywb-board-item a11ywb-board-item--type-cluster">
      <summary className="a11ywb-accordion-header">
        <h2>cluster: {hierarchyItem.label}</h2>
      </summary>

      <div className="a11ywb-accordion__contents">
        {listItems.length > 0 && (
          <ul>
            {listItems.length > 0 &&
              listItems.map(listItem => (
                <li key={listItem.id}>
                  <Hierarchy hierarchyItem={listItem} />
                </li>
              ))}
          </ul>
        )}
        {listItems.length === 0 && <p>This frame has no items.</p>}
      </div>
    </details>
  );
};

const FrameTypeBoardItem: React.FC<FrameTypeBoardItemProps> = ({ hierarchyItem }) => {
  const listItems = hierarchyItem.children ?? [];

  return (
    <details className="a11ywb-accordion a11ywb-board-item a11ywb-board-item--type-frame">
      <summary className="a11ywb-accordion-header">
        <h2>
          {hierarchyItem.type}: {hierarchyItem.label}
        </h2>
      </summary>

      <button type="button" onClick={() => editData({
        item: hierarchyItem.item,
        title: "Edit Frame",
        fields: [
          {
            fieldName: 'title',
            currentValue: hierarchyItem.label,
            fieldType: 'text',
            required: true
          }
        ]
      })}>Edit Frame</button>
      <button type="button" onClick={() => deleteData({
        id: hierarchyItem.id,
        title: 'Delete Frame'
      })}>Delete Frame</button>

      <div className="a11ywb-accordion__contents">
        {listItems.length > 0 && (
          <ul>
            {listItems.length > 0 &&
              listItems.map(listItem => (
                <li key={listItem.id}>
                  <Hierarchy hierarchyItem={listItem} />
                </li>
              ))}
          </ul>
        )}
        {listItems.length === 0 && <p>This frame has no items.</p>}
      </div>
    </details>
  );
};

const Hierarchy: React.FC<HierarchyProps> = ({ hierarchyItem }) => {
  const { type } = hierarchyItem;

  if (type === ItemNames.frame) {
    if (hierarchyItem.label.startsWith('Cluster')) {
      return <ClusterTypeBoardItem hierarchyItem={hierarchyItem as HierarchyItem<Frame>} />;
    } else {
      return <FrameTypeBoardItem hierarchyItem={hierarchyItem as HierarchyItem<Frame>} />;
    }
  }

  if (type === ItemNames.text) {
    return <TextTypeBoardItem hierarchyItem={hierarchyItem as HierarchyItem<Text>} />;
  }

  if (type === ItemNames.stickyNote) {
    return <StickyNoteTypeBoardItem hierarchyItem={hierarchyItem as HierarchyItem<StickyNote>} />;
  }

  return (
    <UnsupportedTypeBoardItem hierarchyItem={hierarchyItem} />
  );
};

export default Hierarchy;
