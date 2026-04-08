import type { Frame, Item, StickyNote, Text } from '@mirohq/websdk-types';
import { HierarchyItem, HierarchyItemType, ItemType } from '@models/item';
import Tags from './tags';
import React from 'react';
import { getItemTypeConfig } from '@utils/items';
import { getColorConfig } from '@utils/colors';
import { openAddModal, openConnectModal, openDeleteModal, openEditModal, openMoveModal } from '@utils/open-modal';

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
  isFiltered?: boolean;
}

export type TreeBoardItem = HierarchyItemType;

export interface TreeBoardItemProps {
  hierarchyItem: HierarchyItem<TreeBoardItem>;
  subtype?: string; // temp workaround for cluster
  children?: React.ReactNode; // custom data to display in the <summary>
}

const HierarchyListItem: React.FC<{ item: HierarchyItem }> = ({ item }) => {
  return (
    <li className="a11ywb-navigation-list__item" data-search-match={item.metadata.searchMatch}>
      <Hierarchy hierarchyItem={item} />
    </li>
  );
};

export const HierarchyBoard: React.FC<HierarchyBoardProps> = ({ type, label, children, isFiltered }) => {
  const listItems = children ?? [];

  return (
    <details className="a11ywb-board a11ywb-accordion" open={true}>
      <summary className="a11ywb-accordion-header">
        {type}: {label}
      </summary>

      <div className="a11ywb-accordion__contents">
        {listItems.length > 0 && (
          <ul>
            {listItems.map((listItem) => <HierarchyListItem key={`board-child-${listItem.id}`} item={listItem} />)}
          </ul>
        )}
        {isFiltered && listItems.length === 0 && <p>No items match search filters.</p>}

        {!isFiltered && listItems.length === 0 && <p>This board has no items.</p>}
      </div>
    </details>
  );
};

const getItemLabel = (hierarchyItem: HierarchyItem) => {
  const usesRichText =
    hierarchyItem?.label?.startsWith('<p>') ||
    hierarchyItem?.label?.startsWith('<ul>') ||
    hierarchyItem?.label?.startsWith('<ol>');
  const hasParent = 'parentId' in hierarchyItem?.item && Boolean(hierarchyItem?.item?.parentId);
  const itemTypeLabel = getItemTypeConfig(hierarchyItem.type)?.displayLabel;

  if (usesRichText && hasParent) {
    return (
      <>
        <h3>{itemTypeLabel}</h3>
        <div dangerouslySetInnerHTML={{ __html: hierarchyItem.label }} />
      </>
    );
  }

  if (!usesRichText && hasParent) {
    return (
      <>
        <h3>
          {itemTypeLabel}: {hierarchyItem.label}
        </h3>
      </>
    );
  }

  if (usesRichText && !hasParent) {
    return (
      <>
        <h2>{itemTypeLabel}</h2>
        <div dangerouslySetInnerHTML={{ __html: hierarchyItem.label }} />
      </>
    );
  }

  return (
    <h2>
      {itemTypeLabel}: {hierarchyItem.label}
    </h2>
  );
};

const BoardItem: React.FC<BoardItemProps<Item>> = ({ hierarchyItem, children }) => {
  return (
    <article className={`a11ywb-board-item a11ywb-board-item--type-${hierarchyItem.type}`}>
      {getItemLabel(hierarchyItem)}
      {children}
    </article>
  );
};

const TreeBoardItem: React.FC<TreeBoardItemProps> = ({ hierarchyItem, subtype, children }) => {
  const listItems = hierarchyItem.children ?? [];
  const metadata = hierarchyItem.metadata;

  return (
    <details
      className={`a11ywb-accordion a11ywb-board-item a11ywb-board-item--type-${hierarchyItem.type}`}
      open={!!metadata.searchMatch && metadata.searchMatch !== 'default'}
      data-subtype={subtype}
    >
      <summary className="a11ywb-accordion-header">
        {getItemLabel(hierarchyItem)}

        <div className="a11ywb-board-item__metadata">
          {metadata && (
            <>
              <p>{hierarchyItem.metadata?.treeChildCount} total sub-topics</p>
              <p>{hierarchyItem.metadata?.treeConnectionHeight} levels deep</p>
            </>
          )}
          {children}
        </div>
      </summary>

      <div className="a11ywb-accordion__contents">
        {listItems.length > 0 && (
          <ul>
            {listItems.length > 0 &&
              listItems.map((listItem) => <HierarchyListItem key={`${hierarchyItem.type}-${hierarchyItem.id}-child-${listItem.id}`} item={listItem} />)}
          </ul>
        )}
        {listItems.length === 0 && <p>There are no child items.</p>}
      </div>
    </details>
  );
};

const UnsupportedTypeBoardItem: React.FC<BoardItemProps<Item>> = ({ hierarchyItem }) => {
  return <BoardItem hierarchyItem={hierarchyItem} />;
};

const TextTypeBoardItem: React.FC<TextTypeBoardItemProps> = ({ hierarchyItem }) => {
  const hierarchyChildren = hierarchyItem.children ?? [];

  return (
    <BoardItem hierarchyItem={hierarchyItem}>
      <button
        id={`edit-${hierarchyItem.id}`}
        type="button"
        onClick={() =>
          openEditModal({
            item: hierarchyItem.item,
            title: 'Edit Text',
            fields: [
              {
                fieldName: 'content',
                currentValue: hierarchyItem.label,
                fieldType: 'extended_rich_text',
                required: true,
              },
            ],
          })
        }
      >
        Edit Text
      </button>
      <button
        id={`move-${hierarchyItem.id}`}
        type="button"
        onClick={() =>
          openMoveModal({
            item: hierarchyItem.item,
            title: 'Move Text',
          })
        }
      >
        Move Text
      </button>
      <button
        id={`connect-${hierarchyItem.id}`}
        type="button"
        onClick={() =>
          openConnectModal({
            item: hierarchyItem.item,
            title: 'Text Connections',
          })
        }
      >
        Text Connections
      </button>
      <button
        id={`delete-${hierarchyItem.id}`}
        type="button"
        onClick={() =>
          openDeleteModal({
            id: hierarchyItem.id,
            title: 'Delete Text',
          })
        }
      >
        Delete Text
      </button>

      <button
        type="button"
        onClick={() =>
          openAddModal({
            title: 'Add child Sticky Note',
            stickyNoteFields: [
              {
                fieldName: 'content',
                fieldType: 'rich_text',
                required: true,
              },
              {
                fieldName: 'style.fillColor',
                fieldType: 'color_map',
                defaultValue: hierarchyItem.item.style.fillColor,
              },
            ],
            hierarchyParentId: hierarchyItem.id,
            hierarchyItem,
          })
        }
      >
        Add child Sticky Note
      </button>

      <button
        type="button"
        onClick={() =>
          openAddModal({
            title: 'Add child Text',
            textFields: [
              {
                fieldName: 'content',
                fieldType: 'extended_rich_text',
                required: true,
              },
            ],
            hierarchyParentId: hierarchyItem.id,
            hierarchyItem,
          })
        }
      >
        Add child Text
      </button>

      {hierarchyChildren?.length ? (
        <ul>
          {hierarchyChildren.map((child) => (
            <li key={`${hierarchyItem.type}-${hierarchyItem.id}-child-${child.id}`}>
              <Hierarchy hierarchyItem={child} />
            </li>
          ))}
        </ul>
      ) : null}
    </BoardItem>
  );
};

const StickyNoteTypeBoardItem: React.FC<StickyNoteTypeBoardItemProps> = ({ hierarchyItem }) => {
  const colorKey = hierarchyItem.item?.style.fillColor;
  const colorLabel = getColorConfig(hierarchyItem.item)?.displayLabel;

  return (
    <TreeBoardItem hierarchyItem={hierarchyItem}>
      <span className="a11ywb-board-item__metadata-color" data-color={colorKey}>
        color: {colorLabel}
      </span>
      <Tags tags={hierarchyItem.tags} />

      <button
        id={`edit-${hierarchyItem.id}`}
        type="button"
        onClick={() =>
          openEditModal({
            item: hierarchyItem.item,
            title: 'Edit Sticky Note',
            fields: [
              {
                fieldName: 'content',
                currentValue: hierarchyItem.label,
                fieldType: 'rich_text',
                required: true,
              },
              {
                fieldName: 'style.fillColor',
                currentValue: hierarchyItem.item.style.fillColor,
                fieldType: 'color_map',
                required: false,
              },
            ],
          })
        }
      >
        Edit Sticky Note
      </button>

      <button
        id={`move-${hierarchyItem.id}`}
        type="button"
        onClick={() =>
          openMoveModal({
            item: hierarchyItem.item,
            title: 'Move Sticky Note',
          })
        }
      >
        Move Sticky Note
      </button>

      <button
        id={`connect-${hierarchyItem.id}`}
        type="button"
        onClick={() =>
          openConnectModal({
            item: hierarchyItem.item,
            title: 'Sticky Note Connections',
          })
        }
      >
        Sticky Note Connections
      </button>

      <button
        id={`delete-${hierarchyItem.id}`}
        type="button"
        onClick={() =>
          openDeleteModal({
            id: hierarchyItem.id,
            title: 'Delete Sticky Note',
          })
        }
      >
        Delete Sticky Note
      </button>

      <button
        type="button"
        onClick={() =>
          openAddModal({
            title: 'Add child Sticky Note',
            stickyNoteFields: [
              {
                fieldName: 'content',
                fieldType: 'rich_text',
                required: true,
              },
              {
                fieldName: 'style.fillColor',
                fieldType: 'color_map',
                defaultValue: hierarchyItem.item.style.fillColor,
              },
            ],
            hierarchyParentId: hierarchyItem.id,
            hierarchyItem,
          })
        }
      >
        Add child Sticky Note
      </button>

      <button
        type="button"
        onClick={() =>
          openAddModal({
            title: 'Add child Text',
            textFields: [
              {
                fieldName: 'content',
                fieldType: 'extended_rich_text',
                required: true,
              },
            ],
            hierarchyParentId: hierarchyItem.id,
            hierarchyItem,
          })
        }
      >
        Add child Text
      </button>
    </TreeBoardItem>
  );
};

const ClusterTypeBoardItem: React.FC<ClusterTypeBoardItemProps> = ({ hierarchyItem }) => {
  return <TreeBoardItem hierarchyItem={hierarchyItem} subtype="cluster" />;
};

const FrameTypeBoardItem: React.FC<FrameTypeBoardItemProps> = ({ hierarchyItem }) => {
  return (
    <TreeBoardItem hierarchyItem={hierarchyItem}>
      <button
        id={`edit-${hierarchyItem.id}`}
        type="button"
        onClick={() =>
          openEditModal({
            item: hierarchyItem.item,
            title: 'Edit Frame',
            fields: [
              {
                fieldName: 'title',
                currentValue: hierarchyItem.label,
                fieldType: 'text',
                required: true,
              },
            ],
          })
        }
      >
        Edit Frame
      </button>

      <button
        id={`delete-${hierarchyItem.id}`}
        type="button"
        onClick={() =>
          openDeleteModal({
            id: hierarchyItem.id,
            title: 'Delete Frame',
          })
        }
      >
        Delete Frame
      </button>
      <button
        type="button"
        onClick={() =>
          openAddModal({
            title: 'Add Sticky Note in Frame',
            stickyNoteFields: [
              {
                fieldName: 'content',
                fieldType: 'rich_text',
                required: true,
              },
              {
                fieldName: 'style.fillColor',
                fieldType: 'color_map',
              },
            ],
            hierarchyParentId: hierarchyItem.id,
            hierarchyItem,
          })
        }
      >
        Add Sticky Note in Frame
      </button>

      <button
        type="button"
        onClick={() =>
          openAddModal({
            title: 'Add Text in Frame',
            textFields: [
              {
                fieldName: 'content',
                fieldType: 'extended_rich_text',
                required: true,
              },
            ],
            hierarchyParentId: hierarchyItem.id,
            hierarchyItem,
          })
        }
      >
        Add Text in Frame
      </button>
    </TreeBoardItem>
  );
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

  return <UnsupportedTypeBoardItem hierarchyItem={hierarchyItem} />;
};

export default Hierarchy;
