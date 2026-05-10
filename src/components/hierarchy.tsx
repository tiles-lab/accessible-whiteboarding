import type { Frame, Item, StickyNote, Text } from '@mirohq/websdk-types';
import { HierarchyItem, HierarchyItemType, ItemType } from '@models/item';
import Tags from './tags';
import React from 'react';
import { getItemTypeConfig } from '@utils/items';
import { getColorConfig } from '@utils/colors';
import { openAddModal, openConnectModal, openDeleteModal, openEditModal } from '@utils/open-modal';
import { useEarcon } from '../hooks/useEarcon';
import { Accordion } from './accordion';

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
  onFocus?: React.FocusEventHandler | undefined;
}

const HierarchyListItem: React.FC<{ item: HierarchyItem }> = ({ item }) => {
  return (
    <li className="a11ywb-navigation-list__item" data-search-match={item.metadata.searchMatch}>
      <Hierarchy hierarchyItem={item} />
    </li>
  );
};

export const HierarchyBoard: React.FC<HierarchyBoardProps> = ({
  type,
  label,
  children,
  isFiltered,
}) => {
  const listItems = children ?? [];

  return (
    <Accordion
      id="a11ywb-board-accordion"
      defaultOpen
      detailsClassNames={['a11ywb-board']}
      summary={{
        text: `${type}: ${label}`,
      }}
      children={
        <>
          <section role="toolbar" aria-labelledby="button-group-add-item-to-board">
            <h2 id="button-group-add-item-to-board">Add Item to Board</h2>
            <button
              type="button"
              onClick={() =>
                openAddModal({
                  title: 'Add Frame',
                  frameFields: [
                    {
                      fieldName: 'title',
                      fieldType: 'text',
                      required: true,
                    },
                    {
                      fieldName: 'style.fillColor',
                      fieldType: 'color',
                    },
                    {
                      fieldName: 'width',
                      fieldType: 'number',
                      required: true,
                      inputProps: {
                        value: 700,
                      },
                    },
                    {
                      fieldName: 'height',
                      fieldType: 'number',
                      required: true,
                      inputProps: {
                        value: 500,
                      },
                    },
                  ],
                })
              }
            >
              Add Frame
            </button>

            <button
              type="button"
              onClick={() =>
                openAddModal({
                  title: 'Add Sticky Note',
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
                })
              }
            >
              Add Sticky Note
            </button>

            <button
              type="button"
              onClick={() =>
                openAddModal({
                  title: 'Add Text',
                  textFields: [
                    {
                      fieldName: 'content',
                      fieldType: 'extended_rich_text',
                      required: true,
                    },
                  ],
                })
              }
            >
              Add Text
            </button>
          </section>

          <div className="a11ywb-accordion__contents">
            {listItems.length > 0 && (
              <ul>
                {listItems.map((listItem) => (
                  <HierarchyListItem key={`board-child-${listItem.id}`} item={listItem} />
                ))}
              </ul>
            )}
            {isFiltered && listItems.length === 0 && <p>No items match search filters.</p>}

            {!isFiltered && listItems.length === 0 && <p>This board has no items.</p>}
          </div>
        </>
      }
    />
  );
};

interface GetItemLabelOptions {
  onFocus?: React.FocusEventHandler | undefined;
}

const getItemLabel = (
  hierarchyItem: HierarchyItem,
  options: GetItemLabelOptions = {},
): {
  headingLevel: 'h2' | 'h3';
  headingText: string | undefined;
  headingDescription?: string;
  node: React.ReactNode;
} => {
  const usesRichText =
    hierarchyItem?.label?.startsWith('<p>') ||
    hierarchyItem?.label?.startsWith('<ul>') ||
    hierarchyItem?.label?.startsWith('<ol>');
  const hasParent = 'parentId' in hierarchyItem?.item && Boolean(hierarchyItem?.item?.parentId);
  const itemTypeLabel = getItemTypeConfig(hierarchyItem.type)?.displayLabel;

  const { onFocus } = options;

  if (usesRichText && hasParent) {
    return {
      headingLevel: 'h3',
      headingText: itemTypeLabel,
      headingDescription: hierarchyItem.label,
      node: (
        <>
          <h3 onFocus={onFocus}>{itemTypeLabel}</h3>
          <div dangerouslySetInnerHTML={{ __html: hierarchyItem.label }} />
        </>
      ),
    };
  }

  if (!usesRichText && hasParent) {
    return {
      headingLevel: 'h3',
      headingText: `${itemTypeLabel}: ${hierarchyItem.label}`,
      node: (
        <>
          <h3 onFocus={onFocus}>
            {itemTypeLabel}: {hierarchyItem.label}
          </h3>
        </>
      ),
    };
  }

  if (usesRichText && !hasParent) {
    return {
      headingLevel: 'h2',
      headingText: itemTypeLabel,
      headingDescription: hierarchyItem.label,
      node: (
        <>
          <h2 onFocus={onFocus}>{itemTypeLabel}</h2>
          <div dangerouslySetInnerHTML={{ __html: hierarchyItem.label }} />
        </>
      ),
    };
  }

  return {
    headingLevel: 'h2',
    headingText: `${itemTypeLabel}: ${hierarchyItem.label}`,
    node: (
      <h2 onFocus={onFocus}>
        {itemTypeLabel}: {hierarchyItem.label}
      </h2>
    ),
  };
};

const BoardItem: React.FC<BoardItemProps<Item>> = ({ hierarchyItem, children }) => {
  return (
    <article className={`a11ywb-board-item a11ywb-board-item--type-${hierarchyItem.type}`}>
      {getItemLabel(hierarchyItem).node}
      {children}
    </article>
  );
};

const TreeBoardItem: React.FC<TreeBoardItemProps> = ({
  hierarchyItem,
  subtype,
  children,
  onFocus,
}) => {
  const listItems = hierarchyItem.children ?? [];
  const metadata = hierarchyItem.metadata;

  const itemSummary = getItemLabel(hierarchyItem, { onFocus });

  const accordionId = `${hierarchyItem.type}-${hierarchyItem.id}`

  return (
    <Accordion
      id={accordionId}
      defaultOpen={!!metadata.searchMatch && metadata.searchMatch !== 'default'}
      data-subtype={subtype}
      detailsClassNames={['a11ywb-board-item', `a11ywb-board-item--type-${hierarchyItem.type}`]}
      summary={{
        text: itemSummary.headingText,
        headingLevel: itemSummary.headingLevel,
        description: itemSummary.headingDescription,
        focusAction: onFocus,
        content: (
          <div role="status" className="a11ywb-board-item__metadata">
            {metadata && (
              <>
                <p>{hierarchyItem.metadata?.treeChildCount} total sub-topics</p>
                <p>{hierarchyItem.metadata?.treeConnectionHeight} levels deep</p>
              </>
            )}
            {children}
          </div>
        ),
      }}
    >
      <div className="a11ywb-accordion__contents">
        {listItems.length > 0 && (
          <ul>
            {listItems.length > 0 &&
              listItems.map((listItem) => (
                <HierarchyListItem
                  key={`${hierarchyItem.type}-${hierarchyItem.id}-child-${listItem.id}`}
                  item={listItem}
                />
              ))}
          </ul>
        )}
        {listItems.length === 0 && <p>There are no child items.</p>}
      </div>
    </Accordion>
  );
};

const UnsupportedTypeBoardItem: React.FC<BoardItemProps<Item>> = ({ hierarchyItem }) => {
  return <BoardItem hierarchyItem={hierarchyItem} />;
};

const TextTypeBoardItem: React.FC<TextTypeBoardItemProps> = ({ hierarchyItem }) => {
  const hierarchyChildren = hierarchyItem.children ?? [];

  return (
    <BoardItem hierarchyItem={hierarchyItem}>

      <div role="toolbar" aria-label="Text Actions">
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
                {
                  fieldName: 'parentId',
                  currentValue: hierarchyItem.item.parentId ?? '',
                  fieldType: 'parent',
                },
              ],
            })
          }
        >
          Edit Text
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
      </div>

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

  const { onFocus } = useEarcon({ category: hierarchyItem.item });

  return (
    <TreeBoardItem hierarchyItem={hierarchyItem} onFocus={onFocus}>
      <span className="a11ywb-board-item__metadata-color" data-color={colorKey}>
        color: {colorLabel}
      </span>
      <Tags tags={hierarchyItem.tags} />


      <div role="toolbar" aria-label="Sticky Note Actions">
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
                {
                  fieldName: 'parentId',
                  currentValue: hierarchyItem.item.parentId ?? '',
                  fieldType: 'parent',
                },
              ],
            })
          }
        >
          Edit Sticky Note
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
      </div>
    </TreeBoardItem>
  );
};

const ClusterTypeBoardItem: React.FC<ClusterTypeBoardItemProps> = ({ hierarchyItem }) => {
  return <TreeBoardItem hierarchyItem={hierarchyItem} subtype="cluster" />;
};

const FrameTypeBoardItem: React.FC<FrameTypeBoardItemProps> = ({ hierarchyItem }) => {
  return (
    <TreeBoardItem hierarchyItem={hierarchyItem}>
      <div role="toolbar" aria-label="Frame Actions">
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
      </div>
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
