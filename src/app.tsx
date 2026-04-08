import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { type Item } from '@mirohq/websdk-types';
import SampleItems from '@data/sample-items.json';
import { HierarchyBoard } from '@components/hierarchy';
import { ItemType } from '@models/item';
import { buildConnectorHierarchy } from '@utils/hierarchy-builder';
import { useBoardItems } from './hooks/useBoardItems';

import {
  ALL_ITEM_TYPES,
  ALL_ITEM_TYPES_FILTER_OPTION,
  ITEM_TYPE_FILTER_OPTIONS,
} from '@config/search';

import { filterHierarchy, getSearchResultTotal, isDefaultFilter, normalizeQuery, SearchFilters } from '@utils/search';

const fallbackData = SampleItems as Item[];

const App: React.FC = () => {
  const items = useBoardItems(fallbackData);
  const [query, setQuery] = React.useState('');
  const [itemTypeFilter, setItemTypeFilter] = React.useState(ALL_ITEM_TYPES);

  const deferredQuery = React.useDeferredValue(query);

  const searchFilters: SearchFilters = {
    query: normalizeQuery(deferredQuery),
    filterByType: itemTypeFilter
  };

  const isFiltered = isDefaultFilter(searchFilters);

  const boardItems = React.useMemo(() => {
    return buildConnectorHierarchy(items);
  }, [items]);

  const hierarchyBoard = React.useMemo(() => {
    const filteredBoardItems = filterHierarchy(boardItems, searchFilters);

    const hierarchyRoot = {
      id: 'board',
      label: 'Board',
      type: 'board',
      children: filteredBoardItems,
    };

    return hierarchyRoot;
  }, [items, searchFilters.query, searchFilters.filterByType]);

  const navigableItemCount = boardItems.reduce((acc, child) => {
    acc += child.metadata.treeChildCount + 1;
    return acc;
  }, 0);

  const searchResultTotal = React.useMemo(() => {
    return getSearchResultTotal(hierarchyBoard.children);
  }, [hierarchyBoard.children, searchFilters.filterByType, searchFilters.query]);

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
            aria-describedby="search-results-count"
          />
        </label>

        <label htmlFor="item-type-filter">
          Filter by type:
          <select
            id="item-type-filter"
            aria-label="Filter items by type"
            value={itemTypeFilter}
            onChange={handleFilterByType}
          >
            <option value={ALL_ITEM_TYPES_FILTER_OPTION.type}>
              {ALL_ITEM_TYPES_FILTER_OPTION.displayLabel}
            </option>

            {ITEM_TYPE_FILTER_OPTIONS.map((option) => (
              <option key={option.type} value={option.type}>
                {option.displayLabel}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        id="search-results-count"
        className="a11ywb-app-search-results-count"
        aria-live="polite"
        aria-atomic="true"
        role="region"
      >
        {searchResultTotal} {searchResultTotal === 1 ? 'result' : 'results'}
      </div>

      <HierarchyBoard
        type={hierarchyBoard.type as ItemType}
        label={hierarchyBoard.label}
        children={hierarchyBoard.children}
        isFiltered={isFiltered}
      />
    </main>
  );
};

declare global {
  interface Window {
    __a11ywbRoot?: Root;
  }
}

const container = document.getElementById('a11ywb-root');

if (container) {
  window.__a11ywbRoot ??= createRoot(container);
}

function render() {
  if (window.__a11ywbRoot) {
    window.__a11ywbRoot.render(<App />);
}
}

render();

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    render();
  });
}
