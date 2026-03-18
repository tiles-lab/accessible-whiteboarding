import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { type Item } from '@mirohq/websdk-types';
import SampleItems from '@data/sample-items.json';
import { HierarchyBoard } from '@components/hierarchy';
import { ItemType } from '@models/item';
import { buildConnectorHierarchy } from '@utils/hierarchy-builder';
import { openAddModal } from '@utils/open-modal';
import { useBoardItems } from './hooks/useBoardItems';

import { applyHierarchicalSearch, getSearchResultTotal, normalizeQuery } from '@utils/search';
import { ALL_ITEM_TYPES, ALL_ITEM_TYPES_FILTER_OPTION, ITEM_TYPE_FILTER_OPTIONS } from '@config/search';

const fallbackData = SampleItems as Item[];

const App: React.FC = () => {
  const items = useBoardItems(fallbackData);
  const [query, setQuery] = React.useState('');
  const [itemTypeFilter, setItemTypeFilter] = React.useState(ALL_ITEM_TYPES);

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
  
  const searchResultTotal = React.useMemo(() => {
    const normalizedQuery = normalizeQuery(query);
    applyHierarchicalSearch(hierarchyBoard.children, { normalizedQuery, filterByType: itemTypeFilter });

    return getSearchResultTotal(hierarchyBoard.children);
  }, [hierarchyBoard.children, query, itemTypeFilter]);

  // Update the callback to only set query state
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  
  const handleFilterByType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemTypeFilter(e.target.value);
  };

  return (
    <main className="a11ywb-app-container">
      <h1 className="a11ywb-app-title">List of Navigable Items (count: {navigableItemCount})</h1>

      <div role="search">
        <label htmlFor="search-input">
          Search:
          <input
            id="search-input"
            type="search" 
            value={query} 
            onChange={handleSearch} 
            placeholder="Search by label, tag, color"
            aria-describedby="search-results-count" />
        </label>

        <label htmlFor="item-type-filter">
          Filter by type:
          <select
            id="item-type-filter" 
            aria-label="Filter items by type"
            value={itemTypeFilter}
            onChange={handleFilterByType}>
              <option value={ALL_ITEM_TYPES_FILTER_OPTION.type}>
                {ALL_ITEM_TYPES_FILTER_OPTION.displayLabel}
              </option>

              {ITEM_TYPE_FILTER_OPTIONS.map(option => (
                <option 
                  key={option.type}
                  value={option.type}>{option.displayLabel}</option>
                ))
              }
          </select>
        </label>
      </div>

      <div 
        id="search-results-count"
        className="a11ywb-app-search-results-count" 
        aria-live="polite" 
        aria-atomic="true"
        role="region">{searchResultTotal} {searchResultTotal === 1 ? 'result' : 'results'}</div>

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
