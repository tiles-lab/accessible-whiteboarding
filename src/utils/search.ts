import { HierarchyItem, HierarchyItemMetadata } from "@models/item";

export function normalizeQuery(text: string): string {
    // https://www.codecademy.com/resources/docs/javascript/strings/normalize
    const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return normalized;
}

export function getSearchableText(hierarchyItem: HierarchyItem): string {
    let query = `${hierarchyItem.label}`;

    const tags = hierarchyItem.tags ? hierarchyItem.tags
        .map(tag => tag.title).join(' ') : '';

    query += tags;

    return normalizeQuery(query);
}

export function applyHierarchicalSearch(
  items: HierarchyItem[],
  normalizedQuery: string, // assumes query is normalized already
  isChildOfMatch = false
): boolean {
    const isQueryEmpty = /^\s*$/.test(normalizedQuery); 

    for (const item of items) {
        const isParentOfMatch = applyHierarchicalSearch(item.children, normalizedQuery);
        const isSelfMatch = getSearchableText(item).includes(normalizedQuery);

        let searchMatch: HierarchyItemMetadata['searchMatch'];

        if (isQueryEmpty) {
            searchMatch = 'default';
        } else if (isSelfMatch) {
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
            normalizedQuery,
            searchMatch === 'match-self',
        );
    }

    return items.some(item => !!item.metadata.searchMatch);
}
