import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { type Item } from '@mirohq/websdk-types';
import SampleItemsConceptMap from '@data/sample-items-concept-map.json';
import SampleItems from '@data/sample-items.json';
import { HierarchyBoard } from '@components/hierarchy';
import { ItemType } from '@models/item';
import { buildConnectorHierarchy } from '@utils/hierarchy-builder';
import { applyHierarchicalSearch, normalizeQuery } from '@utils/search';
import { openAddModal } from '@utils/open-modal';

const fallbackData = SampleItems as Item[];
// const fallbackData = SampleItemsConceptMap as Item[];

async function listBoardItems(): Promise<Item[]> {
  return new Promise((resolve) => {
    miro.board
      .get()
      .then((items) => resolve(items))
      .catch(() => resolve(fallbackData));

    setTimeout(() => resolve(fallbackData), 50);
  });
}

const App: React.FC = () => {
  const [items, setItems] = React.useState<Item[]>([]);

  React.useEffect(() => {
    console.log('Listing board items...');
    listBoardItems().then((boardItems) => {
      setItems(boardItems);
      console.log(`Found ${boardItems.length}`);
    });
  }, []);

  React.useEffect(() => {
    window.addEventListener('storage', () => {
      const updatedItems = window.sessionStorage.getItem('updated_miro_items');
      if (updatedItems) {
        try {
          const parsedItems: Item[] = JSON.parse(updatedItems);
          const parsedIds: Item['id'][] = parsedItems.map((item) => item.id);

          if (parsedItems) {
            setItems([...items.filter((item) => !parsedIds.includes(item.id)), ...parsedItems]);
          }
        } catch (e) {
          console.error('Error parsing updated item: ', e);
        }
      }
    });

    miro.board.ui.on('items:create', async (event) => {
      setItems([...items, ...event.items]);
    });

    miro.board.ui.on('items:delete', async (event) => {
      setItems(items.filter((item) => item.id !== event.items?.[0]?.id));
    });
  }, [items]);

  const hierarchyBoard = React.useMemo(() => {
    const children = buildConnectorHierarchy(items);

    const hierarchyRoot = {
      id: 'board',
      label: 'Board',
      type: 'board',
      children,
    };

    return hierarchyRoot;
  }, [items]);

  const navigableItemCount = hierarchyBoard.children.reduce((acc, child) => {
    acc += child.metadata.treeChildCount + 1;
    return acc;
  }, 0);

  const [query, setQuery] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalizedQuery = normalizeQuery(e.target.value);

    setQuery(normalizedQuery);
    applyHierarchicalSearch(hierarchyBoard.children, normalizedQuery);
  };

  return (
    <main className="a11ywb-app-container">
      <h1 className="a11ywb-app-title">List of Navigable Items (count: {navigableItemCount})</h1>

      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search by label, tag, color"
      />

      <HierarchyBoard
        type={hierarchyBoard.type as ItemType}
        label={hierarchyBoard.label}
        children={hierarchyBoard.children}
      />

      <h2>Add Item to Board</h2>
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
              {
                fieldName: 'parentId',
                fieldType: 'parent',
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
              {
                fieldName: 'parentId',
                fieldType: 'parent',
              },
            ],
          })
        }
      >
        Add Text
      </button>
    </main>
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
