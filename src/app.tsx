import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { type Item } from '@mirohq/websdk-types';
import SampleItems from '@data/sample-items.json';
import { HierarchyBoard } from '@components/hierarchy';
import { ItemType } from '@models/item';
import { buildConnectorHierarchy } from '@utils/hierarchy-builder';
import { applyHierarchicalSearch, normalizeQuery } from '@utils/search';
import { openAddModal } from '@utils/open-modal';
import { useBoardItems } from './hooks/useBoardItems';

const fallbackData = SampleItems as Item[];

const App: React.FC = () => {
  const items = useBoardItems(fallbackData);

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
