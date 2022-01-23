import type { Block, Puzzle } from './global';

export function isBlocksCorrect(puzzle: Puzzle, blocks: Block[]): boolean {
    if (puzzle.blocks.length != blocks.length) {
        return false;
    }
    return !puzzle.blocks.some((b, i) => b.id != blocks[i].id || b.indent != blocks[i].indent);
}

export function getShuffledBlocks(puzzle: Puzzle): Block[][] {
    const blocks = puzzle.blocks
        .map((b) => {
            return { ...b };
        })
        .concat(
            puzzle.falseBlocks.map((b) => {
                return { ...b };
            })
        );
    blocks.forEach((b) => (b.indent = 0));
    if (puzzle.falseBlocks.length) {
        blocks.sort((a, b) => a.code.localeCompare(b.code));
        return [[], blocks];
    }
    do {
        for (let i = 0; i < blocks.length; i++) {
            const coord = Math.floor(Math.random() * blocks.length);
            const bl = blocks[i];
            blocks[i] = blocks[coord];
            blocks[coord] = bl;
        }
    } while (blocks.length && isBlocksCorrect(puzzle, blocks));
    return [blocks, []];
}

export function randomString(length = 20): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
}
