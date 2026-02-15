import type { Frame, Item, StickyNote, Text } from '@mirohq/websdk-types';
import { HierarchyItem, ItemNames, ItemType } from '@models/item';
import Tags from './tags';

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
  return (
    <div className={`a11ywb-board-item a11ywb-board-item--type-${hierarchyItem.type}`}>
      <p>{hierarchyItem.type}:</p>
        {hierarchyItem?.label?.startsWith('<p>')
          ? <div dangerouslySetInnerHTML={{ __html: hierarchyItem.label }} />
          : <p>{hierarchyItem.label ?? 'Empty'}</p>
        }
      {children}
    </div>
  );
}

const UnsupportedTypeBoardItem: React.FC<BoardItemProps<Item>> = ({ hierarchyItem }) => {
  return (
    <BoardItem hierarchyItem={hierarchyItem} />
  );
};

const TextTypeBoardItem: React.FC<TextTypeBoardItemProps> = ({ hierarchyItem }) => {
  return (
    <BoardItem hierarchyItem={hierarchyItem} />
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
