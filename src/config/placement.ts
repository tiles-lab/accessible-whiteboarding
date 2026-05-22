export interface SpiralSearchOptions {
    startingRingSize?: number;
    ringMargin?: number;
    maxRingCount?: number;
}

export const SPIRAL_SEARCH_DEFAULT_OPTIONS: Required<SpiralSearchOptions> = {
    startingRingSize: 20,
    ringMargin: 20,
    maxRingCount: 10
}

export interface GridSearchOptions {
    itemsPerRow?: number;
    columnGap?: number;
    rowGap?: number;
}

export const GRID_SEARCH_DEFAULT_OPTIONS: Required<GridSearchOptions> = {
    itemsPerRow: 4,
    columnGap: 20,
    rowGap: 20,
};
