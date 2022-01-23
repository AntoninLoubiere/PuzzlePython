<script lang="ts">
    import hljs from 'highlight.js';
    import python from 'highlight.js/lib/languages/python';
    import type { Block } from '../global';

    export let block: Block;
    export let indent: boolean;

    hljs.registerLanguage('python', python);

    const BLOCK_INDENT_WIDTH = 4;
    const MAX_INDENT = 10;
    let width: number;

    function decrementIndent() {
        if (block.indent > 0) {
            block.indent -= 1;
        }
    }

    function incrementIndent() {
        if (block.indent < MAX_INDENT - 1) {
            block.indent += 1;
        }
    }

    $: code = hljs.highlight(block.code || ' ', { language: 'python' }).value;
    $: if (!indent) {
        block.indent = 0;
    }
</script>

<div class="w-full group" bind:clientWidth={width} on:dblclick>
    <div
        style="--move-x: min({indent && BLOCK_INDENT_WIDTH * block.indent}ch, calc(({width /
            MAX_INDENT}) * {block.indent}px));
                transform: translateX(var(--move-x));
                width: calc(100% - var(--move-x));"
        class="flex items-center transition-all"
    >
        <button
            class="h-6 w-6 inline hover:text-primary-variant invisible"
            class:group-hover:visible={indent}
            class:text-neutral-500={block.indent <= 0}
            class:hover:text-neutral-500={block.indent <= 0}
            on:click={decrementIndent}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                />
            </svg>
        </button>
        <button
            class="h-6 w-6 inline hover:text-primary-variant mr-1 invisible"
            class:group-hover:visible={indent}
            class:text-neutral-500={block.indent >= MAX_INDENT - 1}
            class:hover:text-neutral-500={block.indent >= MAX_INDENT - 1}
            on:click={incrementIndent}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                />
            </svg>
        </button>
        <div
            class="bg-gray-200 dark:bg-gray-800 rounded-lg hover:ring hover:ring-primary cursor-move inline-block flex-grow px-3 py-2"
        >
            <pre>{@html code}</pre>
        </div>
    </div>
</div>
