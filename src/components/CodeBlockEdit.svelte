<script lang="ts">
    import hljs from 'highlight.js';
    import python from 'highlight.js/lib/languages/python';
    import { createEventDispatcher } from 'svelte';
    import type { Block } from '../global';

    export let block: Block;
    export let indent: boolean;

    const TAB_WIDTH = 4;

    hljs.registerLanguage('python', python);

    const BLOCK_INDENT_WIDTH = 4;
    const MAX_INDENT = 10;
    let width: number;
    let edited = block.code == '';

    const dispatcher = createEventDispatcher();

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

    function sendDelete() {
        dispatcher('delete');
    }

    function onInputBlur() {
        edited = false;
        let indentSize: number;
        if (indent && (indentSize = countTab())) {
            block.indent = indentSize;
        }
        block.code = block.code.trim();
        dispatcher('update');
    }

    function countTab() {
        let spaces = 0;
        let tabs = 0;
        for (let i = 0; i < block.code.length; i++) {
            if (block.code[i] == ' ') {
                spaces += 1;
            } else if (block.code[i] == '\t') {
                tabs += 1;
            } else {
                break;
            }
        }

        return tabs + Math.round(spaces / TAB_WIDTH);
    }

    function onInput(event: KeyboardEvent) {
        if (event.key == 'Tab') {
            block.code = '\t' + block.code;
            event.preventDefault();
        } else if (event.key == 'Escape') {
            onInputBlur();
        }
    }
</script>

<div class="w-full group" bind:clientWidth={width} on:dblclick={() => (edited = true)}>
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
            class="h-6 w-6 inline hover:text-primary-variant mr-1 invisible group-hover:visible"
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
            class="bg-gray-200 dark:bg-gray-800 rounded-lg ring ring-transparent hover:ring-primary focus-within:ring-primary cursor-move inline-block flex-grow"
        >
            {#if edited}
                <!-- svelte-ignore a11y-autofocus -->
                <textarea
                    bind:value={block.code}
                    on:keydown={onInput}
                    on:blur={onInputBlur}
                    class="w-full focus:ring-transparent"
                    autofocus
                    placeholder="Code python"
                />
            {:else}
                <div class="flex items-center px-3 py-2">
                    <pre class="flex-grow">{@html hljs.highlight(block.code || ' ', {
                            language: 'python',
                        }).value}</pre>

                    <button on:click={() => (edited = true)}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 invisible group-hover:visible hover:text-primary-variant"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                            />
                        </svg>
                    </button>
                    <button on:click={sendDelete}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 invisible group-hover:visible hover:text-primary-variant"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>
            {/if}
        </div>
    </div>
</div>
