import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Tag,
  type Frame,
  type Item,
  type StickyNote,
  type Text,
} from '@mirohq/websdk-types';
import TitledSection from '@components/titled-section';
import SampleItems from '@data/sample-items.json';

async function listBoardItems(): Promise<Item[]> {
  return SampleItems as Item[];
}

function getLabel(item: Item): string {
  switch (item.type) {
    case 'sticky_note':
      return (item as StickyNote).content;
    case 'frame':
      return (item as Frame).title;
    case 'text':
      return (item as Text).content;
    default:
      return `Unsupported ${item.type}`;
  }
}

interface HierarchyItem {
  id: Item['id'];
  type: Item['type'];
  item: Item;
  tags?: Tag[];
  label: string;
}

type TagRecord = Record<Tag['id'], Tag>;

function getTags(item: Item, tagRecord: TagRecord): Tag[] {
  if (!Object.hasOwn(item, 'tagIds')) {
    return [];
  }

  return (item as StickyNote).tagIds
    .map(tagId => tagRecord[tagId])
    .filter(tag => !!tag);
}

const App: React.FC = () => {
  const [items, setItems] = React.useState<Item[]>([]);

  React.useEffect(() => {
    console.log('Listing board items...');
    listBoardItems().then(boardItems => {
      setItems(boardItems);
      console.log(`Found ${boardItems.length}`);
    });
  }, []);

  const tagRecord = React.useMemo(() => {
    return items
      .filter(item => item.type === 'tag')
      .reduce(
        (acc, item) => {
          if (item.type === 'tag') {
            acc[item.id] = item as Tag;
          }

          return acc;
        },
        {} as Record<Tag['id'], Tag>
      );
  }, [items]);

  const hierarchyItems: HierarchyItem[] = React.useMemo(() => {
    return items
      .filter(item => item.type !== 'tag')
      .map(item => {
        return {
          id: item.id,
          type: item.type,
          item,
          label: getLabel(item),
          tags: getTags(item, tagRecord),
        };
      });
  }, [tagRecord]);

  return (
    <div className="app-container">
      <TitledSection
        title={`List of Board Items (count: ${items.length})`}
        headingLevel="h1"
      >
        <table>
          <thead>
            <tr>
              <th style={{ width: '20px' }}></th>
              <th>Label</th>
              <th>Item Type</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {hierarchyItems.map((hierarchyItem, index) => (
              <tr key={hierarchyItem.id}>
                <td>{index + 1}</td>
                <td>{hierarchyItem.label}</td>
                <td>{hierarchyItem.type}</td>
                <td>
                  {(hierarchyItem.tags ?? []).map(tag => (
                    <span
                      className="a11ywb-tag"
                      data-tag-id={tag.id}
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.title}
                    </span>
                  ))}
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={100}>No items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </TitledSection>
    </div>
  );
};

const container = document.getElementById('a11ywb-root');
const root = container ? createRoot(container) : null;

function render() {
  root?.render(<App />);
}

render();

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    render();
  });
}
