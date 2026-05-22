import { HierarchyItem, HierarchyItemMetadata, ItemType } from "@models/item";
import { isStickyNote } from "./items";
import { getColorConfig } from "./colors";
import { ALL_ITEM_TYPES, ALL_ITEM_TYPES_FILTER_OPTION } from '@config/search';

export interface SearchFilters {
    query?: string; // assumes query is normalized already, so normalize outside,
    filterByType: typeof ALL_ITEM_TYPES_FILTER_OPTION['type'] | ItemType
};

export function normalizeQuery(text: string): string {
    // https://www.codecademy.com/resources/docs/javascript/strings/normalize
    const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return normalized;
}

export function getSearchableText(hierarchyItem: HierarchyItem): string {
    const queryBuilder: string[] = [];

    queryBuilder.push(hierarchyItem.label);

    if (isStickyNote(hierarchyItem.item)) {
        const tagsQuery = hierarchyItem.tags ? hierarchyItem.tags
            .map(tag => tag.title)
            .filter(Boolean)
            .join(' ') : '';

        queryBuilder.push(tagsQuery);

        const color = getColorConfig(hierarchyItem.item);

        if (color) {
            queryBuilder.push(color.displayLabel);
        }
    }

    const query = queryBuilder.join(' ');

    return normalizeQuery(query);
}

export function isDefaultFilter(searchFilters: SearchFilters): boolean {
    const { query, filterByType } = searchFilters;

    return isQueryWhitespace(query) && filterByType === ALL_ITEM_TYPES;
}

export function isQueryWhitespace(query?: string): boolean {
    return !query || /^\s*$/.test(query);
}

export function isTextMatch(hierarchyItem: HierarchyItem, query: string = ''): boolean {
    if (isQueryWhitespace(query)) {
        return true;
    }

    const searchableText = getSearchableText(hierarchyItem);

    const queryTerms = query.split(/\s+/).filter(Boolean);

    return queryTerms.every(queryTerm => searchableText.includes(queryTerm));
}

/**
 * This version rewrites the original tree structure
 * to flatten the list and only display direct matches or descendants of direct matches
 */
export function filterHierarchy(
    items: HierarchyItem[],
    searchOptions: SearchFilters,
): HierarchyItem[] {

    const { query, filterByType } = searchOptions;

    const isMatchAll = isDefaultFilter(searchOptions);

    if (isMatchAll) {
        return [...items ];
    }

    const results = items.flatMap(item => {
        const isMatchType = filterByType === ALL_ITEM_TYPES || item.type === filterByType;
        const isMatchSelf = isMatchType && (isTextMatch(item, query));

        const filteredChildren = filterHierarchy(item.children, searchOptions);

        if (isMatchSelf) {
            return item;
        }

        if (filteredChildren.length > 0) {
            return filteredChildren;
        }

        // no matches in tree
        return [];
    })

    return results;
}

/**
 * This method does not rewrite the original hierarchy and only hides non-matches through CSS
 * The whole tree of a direct match, whether an ancestor or a descendant are included
 */
export function applyHierarchicalSearch(
  items: HierarchyItem[],
  searchOptions: {
    normalizedQuery: string,
    filterByType: typeof ALL_ITEM_TYPES_FILTER_OPTION['type'] | ItemType
  }, 
  isChildOfMatch = false
): boolean {
    const { normalizedQuery, filterByType } = searchOptions;

    const isQueryEmpty = /^\s*$/.test(normalizedQuery); 

    for (const item of items) {
        const isParentOfMatch = applyHierarchicalSearch(item.children, searchOptions);
        const isSelfMatch = isTextMatch(item, normalizedQuery);

        let searchMatch: HierarchyItemMetadata['searchMatch'];

        const isTypeMatch = filterByType === ALL_ITEM_TYPES || item.type === filterByType;

        if (isQueryEmpty && isTypeMatch) {
            searchMatch = 'default';
        } else if ((isSelfMatch || isQueryEmpty) && isTypeMatch) {
            searchMatch = 'match-self';
        } else if (isParentOfMatch || isChildOfMatch) {
            searchMatch = 'match-parent';
        } else {
            searchMatch = false;
        }

        item.metadata.searchMatch = searchMatch;

        // second time for handling non-matching children but whose parents are a search match
        applyHierarchicalSearch(
            item.children,
            searchOptions,
            searchMatch === 'match-self',
        );
    }

    return items.some(item => !!item.metadata.searchMatch);
}

export function getSearchResultTotal(items: HierarchyItem[]): number {
    let total = 0;

    items.forEach(item => {
        if (item.metadata.searchMatch === undefined || item.metadata.searchMatch) {
            total++;
        }

        total += getSearchResultTotal(item.children);
    })
    return total;
}
