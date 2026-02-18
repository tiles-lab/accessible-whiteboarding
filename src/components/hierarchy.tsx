import type { Frame, Item, StickyNote, Text } from '@mirohq/websdk-types';
import { ConnectableItem, HierarchyItem, ItemType } from '@models/item';
import Tags from './tags';
import React from 'react';
import { getItemTypeConfig } from '@utils/items';
import { getColorConfig } from '@utils/colors';

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
  type: string;
  label: string;
  children?: HierarchyItem[];
}

export type TreeBoardItem = ConnectableItem;

export interface TreeBoardItemProps {
  hierarchyItem: HierarchyItem<TreeBoardItem>;
  subtype?: string; // temp workaround for cluster
  children?: React.ReactNode; // custom data to display in the <summary>
}

const HierarchyListItem: React.FC<{ item: HierarchyItem }> = ({ item }) => {
  return (
  <li className="a11ywb-navigation-list__item" data-search-match={item.metadata.searchMatch}>
    <Hierarchy hierarchyItem={item} />
  </li>);
};

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
          <ol>
            {listItems.length > 0 &&
              listItems.map(listItem => (
                <HierarchyListItem key={listItem.id} item={listItem} />
              ))}
          </ol>
        )}
        {listItems.length === 0 && <p>This board has no items.</p>}
      </div>
    </details>
  );
};

const BoardItem: React.FC<BoardItemProps<Item>> = ({ hierarchyItem, children }) => {
  const itemTypeLabel = getItemTypeConfig(hierarchyItem.type)?.displayLabel;

  return (
    <div className={`a11ywb-board-item a11ywb-board-item--type-${hierarchyItem.type}`}>
      <p>
        {itemTypeLabel}: {hierarchyItem.label ?? 'empty'}
      </p>

      {children}
    </div>
  );
}

const TreeBoardItem: React.FC<TreeBoardItemProps> = ({ hierarchyItem, subtype, children }) => {
  const listItems = hierarchyItem.children ?? [];
  const metadata = hierarchyItem.metadata;
  const itemTypeLabel = getItemTypeConfig(hierarchyItem.type)?.displayLabel;


  return (
    <details 
      className={`a11ywb-accordion a11ywb-board-item a11ywb-board-item--type-${hierarchyItem.type}`}
      open={!!metadata.searchMatch && metadata.searchMatch !== 'default'}
      data-subtype={subtype}>
      <summary className="a11ywb-accordion-header">
        <h2>
          {itemTypeLabel}: {hierarchyItem.label}
        </h2>

        <div className="a11ywb-board-item__metadata">
          
          {metadata && (<>
            <p>{hierarchyItem.metadata?.treeChildCount} total sub-topics</p>
            <p>{hierarchyItem.metadata?.treeConnectionHeight} levels deep</p>
          </>
          )}
          {children}
        </div>
      </summary>

      <div className="a11ywb-accordion__contents">
        {listItems.length > 0 && (
          <ol>
            {listItems.length > 0 &&
              listItems.map(listItem => (
                <HierarchyListItem key={listItem.id} item={listItem} />
              ))}
          </ol>
        )}
        {listItems.length === 0 && <p>There are no child items.</p>}
      </div>
    </details>
  );
};

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
  const colorKey = hierarchyItem.item?.style.fillColor;
  const colorLabel = getColorConfig(hierarchyItem.item)?.displayLabel;

  return (
    <TreeBoardItem hierarchyItem={hierarchyItem}>
        <span className="a11ywb-board-item__metadata-color" data-color={colorKey}>color: {colorLabel}</span>
        <Tags tags={hierarchyItem.tags} />
    </TreeBoardItem>
  );
};

const ClusterTypeBoardItem: React.FC<ClusterTypeBoardItemProps> = ({
  hierarchyItem,
}) => {
  return <TreeBoardItem hierarchyItem={hierarchyItem} subtype="cluster" />
};

const FrameTypeBoardItem: React.FC<FrameTypeBoardItemProps> = ({ hierarchyItem }) => {
  return <TreeBoardItem hierarchyItem={hierarchyItem} />
};

const Hierarchy: React.FC<HierarchyProps> = ({ hierarchyItem }) => {
  const { type } = hierarchyItem;

  if (type === ItemType.Frame) {
    if (hierarchyItem.label.startsWith('Cluster')) {
      return <ClusterTypeBoardItem hierarchyItem={hierarchyItem as HierarchyItem<Frame>} />;
    } else {
      return <FrameTypeBoardItem hierarchyItem={hierarchyItem as HierarchyItem<Frame>} />;
    }
  }

  if (type === ItemType.Text) {
    return <TextTypeBoardItem hierarchyItem={hierarchyItem as HierarchyItem<Text>} />;
  }

  if (type === ItemType.StickyNote) {
    return <StickyNoteTypeBoardItem hierarchyItem={hierarchyItem as HierarchyItem<StickyNote>} />;
  }

  return (
    <UnsupportedTypeBoardItem hierarchyItem={hierarchyItem} />
  );
};

export default Hierarchy;
