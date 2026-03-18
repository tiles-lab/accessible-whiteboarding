import { HierarchyItem, HierarchyItemMetadata, ItemType } from "@models/item";
import { isStickyNote } from "./items";
import { getColorConfig } from "./colors";
import { ALL_ITEM_TYPES, ALL_ITEM_TYPES_FILTER_OPTION } from '@config/search';

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

export function isMatch(hierarchyItem: HierarchyItem, query: string = ''): boolean {
    if (!query) {
        return true;
    }

    const searchableText = getSearchableText(hierarchyItem);

    const queryTerms = query.split(/\s+/).filter(Boolean);

    return queryTerms.every(queryTerm => searchableText.includes(queryTerm));
}

export function applyHierarchicalSearch(
  items: HierarchyItem[],
  searchOptions: {
    normalizedQuery: string, // assumes query is normalized already, so normalize outside,
    filterByType: typeof ALL_ITEM_TYPES_FILTER_OPTION['type'] | ItemType
  }, 
  isChildOfMatch = false
): boolean {
    const { normalizedQuery, filterByType } = searchOptions;

    const isQueryEmpty = /^\s*$/.test(normalizedQuery); 

    for (const item of items) {
        const isParentOfMatch = applyHierarchicalSearch(item.children, searchOptions);
        const isSelfMatch = isMatch(item, normalizedQuery);

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
