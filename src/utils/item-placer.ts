
export interface ItemPlacementOptions {
    x?: number | null;
    y?: number | null;
    height?: number | null;
    width?: number | null;
}

export async function findItemPlacement(options?: ItemPlacementOptions): Promise<{ x: number; y: number }> {
    const x = options?.x ?? 0;
    const y = options?.y ?? 0;
    const height = options?.height ?? 200; // todo: move to config
    const width = options?.width ?? 200;

    // simplest case: fallback to Miro's computation
    const candidateEmptySpace = await miro.board.findEmptySpace({
        x,
        y,
        height,
        width,
    });

    // next case is we want to place it relative to its siblings in that it spreads out
    // like a fan from their parent

    return {
        x: candidateEmptySpace.x,
        y: candidateEmptySpace.y,
    };
};
