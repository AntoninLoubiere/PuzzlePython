<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { fade, fly } from 'svelte/transition';
    const dispatcher = createEventDispatcher();

    function onClose() {
        dispatcher('close');
    }
</script>

<div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-30 overflow-y-auto h-full w-full sm:p-4"
    transition:fade={{ duration: 500 }}
>
    <div
        class="relative top-0 sm:rounded-xl shadow-lg bg-white dark:bg-gray-900 mx-auto w-full max-w-3xl sm:max-w-max sm:w-3/5 min-w-1/3 px-4 py-3"
        transition:fly={{ y: -100, duration: 500 }}
        on:click|stopPropagation
    >
        <h2
            class="text-3xl text-center font-bold border-b-2 border-primary break-words max-w-screen"
        >
            <slot name="title" />
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-7 w-7 text-primary dark:text-white hover:fill-red-500 inline cursor-pointer float-right"
                viewBox="0 0 20 20"
                fill="currentColor"
                on:click={onClose}
            >
                <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                />
            </svg>
        </h2>
        <slot />
    </div>
</div>
