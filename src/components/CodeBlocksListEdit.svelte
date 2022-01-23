<script lang="ts">
    import type { Block } from 'src/global';
    import { onMount } from 'svelte';
    import { dndzone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';
    import { cubicInOut } from 'svelte/easing';
    import CodeBlockEdit from './CodeBlockEdit.svelte';

    const FLIP_DURATION = 500;
    const DND_FLIP_DURATION = 300;

    export let blocks: Block[];
    export let falseBlocks: Block[];
    export let blocksId: number;

    function codeHandleDND(event: CustomEvent) {
        blocks = event.detail.items;
    }

    function sortItems() {
        falseBlocks = falseBlocks.sort((a: Block, b: Block) => a.code.localeCompare(b.code));
    }

    function availableHandleDND(event: CustomEvent) {
        event.detail.items.sort((a: Block, b: Block) => a.code.localeCompare(b.code));
        falseBlocks = event.detail.items;
    }

    function removeBlock(block: Block) {
        blocks = blocks.filter((b) => b != block);
    }

    function removeFalseBlock(block: Block) {
        falseBlocks = falseBlocks.filter((b) => b != block);
    }

    function newBlock() {
        blocks = [
            ...blocks,
            {
                id: blocksId++,
                code: '',
                indent: 0,
            },
        ];
    }

    function newFalseBlock() {
        falseBlocks = [
            ...falseBlocks,
            {
                id: blocksId++,
                code: '',
                indent: 0,
            },
        ];
    }

    onMount(sortItems);
</script>

<div class="my-2 flex flex-col justify-center gap-6 md:flex-row md:gap-2">
    <div class="max-w-3xl md:max-w-xl flex-grow min-h-full flex flex-col">
        <h3 class="color-primary text-2xl uppercase font-semibold">Faux blocs:</h3>
        <div
            class="-ml-14 py-6 flex-grow"
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
                    <CodeBlockEdit
                        {block}
                        indent={false}
                        on:update={sortItems}
                        on:delete={() => removeFalseBlock(block)}
                    />
                </div>
            {:else}
                <div>Aucun faux bloc.</div>
            {/each}
        </div>
        <button
            class="border-2 border-dashed border-gray-500 text-color-light w-full
                    py-2 px-4 text-center flex items-center justify-center mt-4 rounded-lg cursor-pointer
                    hover:border-transparent hover:ring hover:ring-primary hover:bg-gray-200 hover:dark:bg-gray-800
                    hover:text-black hover:dark:text-white
                    focus:border-transparent focus:ring focus:ring-primary focus:bg-gray-200 focus:dark:bg-gray-800
                    focus:text-black focus:dark:text-white focus:outline-none"
            on:click={newFalseBlock}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 inline"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                />
            </svg>
            <span class="mx-2 uppercase text-xl">Nouveau bloc de code</span>
        </button>
    </div>

    <div class="max-w-3xl flex-grow min-h-full flex flex-col">
        <h3 class="color-primary text-2xl uppercase font-semibold">Code:</h3>
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
                    <CodeBlockEdit {block} indent={true} on:delete={() => removeBlock(block)} />
                </div>
            {:else}
                <div>Aucun bloc de code !</div>
            {/each}
        </div>
        <button
            class="border-2 border-dashed border-gray-500 text-color-light
                    py-2 px-4 text-center flex items-center justify-center mt-4 rounded-lg cursor-pointer w-full
                    hover:border-transparent hover:ring hover:ring-primary hover:bg-gray-200 hover:dark:bg-gray-800
                    hover:text-black hover:dark:text-white
                    focus:border-transparent focus:ring focus:ring-primary focus:bg-gray-200 focus:dark:bg-gray-800
                    focus:text-black focus:dark:text-white focus:outline-none"
            on:click={newBlock}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 inline"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                />
            </svg>
            <span class="mx-2 uppercase text-xl">Nouveau bloc de code</span>
        </button>
    </div>
</div>
