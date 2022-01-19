<script lang="ts">
    import type { Puzzle as PuzzleType } from 'src/global';
    import Puzzle from './Puzzle.svelte';

    export let puzzles: PuzzleType[];
</script>

<div class="m-auto max-w-xl">
    <h2 class="text-3xl font-semibold uppercase color-primary text-center m-3">Vos puzzles</h2>
    <ul>
        {#each puzzles as puzzle (puzzle.id)}
            <li><Puzzle {puzzle} /></li>
        {/each}
        <a
            class="border-2 border-dashed border-gray-500 text-color-light
                    py-2 px-4 text-center flex items-center justify-center mt-4 rounded-lg cursor-pointer
                    hover:border-transparent hover:ring hover:ring-primary hover:bg-gray-200 hover:dark:bg-gray-800
                    hover:text-black hover:dark:text-white
                    focus:border-transparent focus:ring focus:ring-primary focus:bg-gray-200 focus:dark:bg-gray-800
                    focus:text-black focus:dark:text-white focus:outline-none"
            tabindex="0"
            href="/puzzle/edit?id=new"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
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
            <span class="mx-2 uppercase text-xl">Nouveau puzzle</span>
        </a>
    </ul>
</div>
