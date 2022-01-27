<script lang="ts">
    export let puzzle: Puzzle;

    const dateFormater = new Intl.DateTimeFormat('fr', { dateStyle: 'medium', timeStyle: 'short' });
</script>

<a href="/puzzle/?id={puzzle.id}">
    <div
        class="bg-gray-200 dark:bg-gray-800 py-2 px-4 rounded-lg ring ring-transparent
        hover:ring-primary focus:ring-primary outline-none cursor-pointer my-3"
        tabindex="0"
    >
        <h4 class="text-2xl font-semibold">{puzzle.name}</h4>
        <div class="text-color-light flex flex-wrap justify-between gap-2">
            <span>{dateFormater.format(puzzle.creation_date.toDate())}</span>
            <span>{puzzle.blocks.length} blocs</span>
            <span>{puzzle.id}</span>
        </div>
    </div>
</a>
