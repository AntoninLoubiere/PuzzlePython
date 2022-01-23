<script lang="ts">
    import type { Block } from 'src/global';
    import { dndzone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';
    import { cubicInOut } from 'svelte/easing';
    import CodeBlock from './CodeBlock.svelte';

    const FLIP_DURATION = 500;
    const DND_FLIP_DURATION = 300;

    export let blocks: Block[];
    export let falseBlocks: Block[];
    export let puzzleHasFalseBlocks: boolean;

    function codeHandleDND(event: CustomEvent) {
        blocks = event.detail.items;
    }

    function availableHandleDND(event: CustomEvent) {
        event.detail.items.sort((a: Block, b: Block) => a.code.localeCompare(b.code));
        falseBlocks = event.detail.items;
    }

    function moveBlockToBlocks(block: Block) {
        falseBlocks = falseBlocks.filter((b) => b != block);
        blocks = [...blocks, block];
    }

    function moveBlockToFalseBlocks(block: Block) {
        blocks = blocks.filter((b) => b != block);
        falseBlocks = [...falseBlocks, block].sort((a: Block, b: Block) =>
            a.code.localeCompare(b.code)
        );
    }
</script>

<div class="my-2 flex flex-col justify-center gap-6 md:flex-row md:gap-2">
    {#if puzzleHasFalseBlocks}
        <div class="max-w-3xl md:max-w-xl flex-grow min-h-full flex flex-col">
            <h3 class="color-primary text-2xl uppercase font-semibold">
                Blocs de code disponibles:
            </h3>
            <div
                class="py-6 flex-grow"
                use:dndzone={{
                    items: falseBlocks,
                    flipDurationMs: DND_FLIP_DURATION,
                    dragDisabled: !falseBlocks.length,
                }}
                on:consider={availableHandleDND}
                on:finalize={availableHandleDND}
            >
                {#each falseBlocks as block (block.id)}
                    <div class="m-2" animate:flip={{ duration: FLIP_DURATION, easing: cubicInOut }}>
                        <CodeBlock
                            {block}
                            indent={false}
                            on:dblclick={() => moveBlockToBlocks(block)}
                        />
                    </div>
                {:else}
                    <div>Aucun bloc de code restant.</div>
                {/each}
            </div>
        </div>
    {/if}

    <div class="max-w-3xl flex-grow min-h-full flex flex-col">
        {#if puzzleHasFalseBlocks}
            <h3 class="color-primary text-2xl uppercase font-semibold">Code:</h3>
        {/if}
        <div
            class="py-6 flex-grow"
            use:dndzone={{
                items: blocks,
                flipDurationMs: DND_FLIP_DURATION,
                dragDisabled: !blocks.length,
            }}
            on:consider={codeHandleDND}
            on:finalize={codeHandleDND}
        >
            {#each blocks as block (block.id)}
                <div class="m-2" animate:flip={{ duration: FLIP_DURATION, easing: cubicInOut }}>
                    <CodeBlock
                        {block}
                        indent={true}
                        on:dblclick={() => moveBlockToFalseBlocks(block)}
                    />
                </div>
            {:else}
                <div>
                    {puzzleHasFalseBlocks
                        ? 'Déplacez les blocs de code de la partie « blocs de code disponibles » pour commencer à écrire votre code.'
                        : 'Aucun bloc de code'}
                </div>
            {/each}
        </div>
    </div>
</div>
