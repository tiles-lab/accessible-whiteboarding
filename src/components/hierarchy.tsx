import type { Frame, Item, StickyNote, Text } from '@mirohq/websdk-types';
import { HierarchyItem } from '@models/item';
import Tags from './tags';

export interface HierarchyProps {
  item: HierarchyItem<Item>;
}

export interface TextTypeBoardItemProps {
  item: HierarchyItem<Text>;
}

export interface StickyNoteTypeBoardItemProps {
  item: HierarchyItem<StickyNote>;
}

export interface FrameTypeBoardItemProps {
  item: HierarchyItem<Frame>;
}

export interface ClusterTypeBoardItemProps {
  item: HierarchyItem<Frame>;
}

const TextTypeBoardItem: React.FC<TextTypeBoardItemProps> = ({ item }) => {
  return (
    <div className="a11ywb-board-item a11ywb-board-item--text-type">
      <h4>
        (type: {item.type}) {item.label}
      </h4>
    </div>
  );
};

const StickyNoteTypeBoardItem: React.FC<StickyNoteTypeBoardItemProps> = ({
  item,
}) => {
  return (
    <div className="a11ywb-board-item a11ywb-board-item--sticky-note-type">
      <h3>
        (type: {item.type}) {item.label}
      </h3>

      <Tags tags={item.tags} />
    </div>
  );
};

export interface HierarchyBoardProps {
  type: string;
  label: string;
  children?: HierarchyItem<Item>[];
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
        (type: {type}) {label}
      </summary>

      <div className="a11ywb-accordion__contents">
        {listItems.length > 0 && (
          <ol>
            {listItems.length > 0 &&
              listItems.map(listItem => (
                <li key={listItem.id}>
                  <Hierarchy item={listItem} />
                </li>
              ))}
          </ol>
        )}
        {listItems.length === 0 && <p>This board has no items.</p>}
      </div>
    </details>
  );
};

const ClusterTypeBoardItem: React.FC<ClusterTypeBoardItemProps> = ({
  item,
}) => {
  const listItems = item.children ?? [];

  return (
    <details className="a11ywb-accordion a11ywb-board-item a11ywb-board-item--cluster-type">
      <summary className="a11ywb-accordion-header">
        <h2>(type: cluster) {item.label}</h2>
      </summary>

      <div className="a11ywb-accordion__contents">
        {listItems.length > 0 && (
          <ol>
            {listItems.length > 0 &&
              listItems.map(listItem => (
                <li key={listItem.id}>
                  <Hierarchy item={listItem} />
                </li>
              ))}
          </ol>
        )}
        {listItems.length === 0 && <p>This frame has no items.</p>}
      </div>
    </details>
  );
};

const FrameTypeBoardItem: React.FC<FrameTypeBoardItemProps> = ({ item }) => {
  const listItems = item.children ?? [];

  return (
    <details className="a11ywb-accordion a11ywb-board-item a11ywb-board-item--frame-type">
      <summary className="a11ywb-accordion-header">
        <h2>
          (type: {item.type}) {item.label}
        </h2>
      </summary>

      <div className="a11ywb-accordion__contents">
        {listItems.length > 0 && (
          <ol>
            {listItems.length > 0 &&
              listItems.map(listItem => (
                <li key={listItem.id}>
                  <Hierarchy item={listItem} />
                </li>
              ))}
          </ol>
        )}
        {listItems.length === 0 && <p>This frame has no items.</p>}
      </div>
    </details>
  );
};

const Hierarchy: React.FC<HierarchyProps> = ({ item }) => {
  const { type } = item;

  if (type === 'frame') {
    if (item.label.startsWith('Cluster')) {
      return <ClusterTypeBoardItem item={item as HierarchyItem<Frame>} />;
    } else {
      return <FrameTypeBoardItem item={item as HierarchyItem<Frame>} />;
    }
  }

  if (type === 'text') {
    return <TextTypeBoardItem item={item as HierarchyItem<Text>} />;
  }

  if (type === 'sticky_note') {
    return <StickyNoteTypeBoardItem item={item as HierarchyItem<StickyNote>} />;
  }

  return (
    <div className="a11ywb-board-item--unsupported-type">
      <h5>
        (type: {item.type}) {item.label}
      </h5>
    </div>
  );
};

export default Hierarchy;
