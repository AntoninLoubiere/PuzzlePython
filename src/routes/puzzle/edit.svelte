<script lang="ts">
    import type { Puzzle } from '../../global';
    import { onMount } from 'svelte';
    import { createNewEmpty, getPuzzle, removePuzzle, savePuzzle } from '../../database/puzzles';
    import { userStore } from '../../store';
    import CodeBlocksListEdit from '../../components/CodeBlocksListEdit.svelte';
    import { goto } from '$app/navigation';

    let puzzlePromise: Promise<Puzzle | null> = new Promise(() => null);
    const dateFormater = new Intl.DateTimeFormat('fr', { dateStyle: 'full', timeStyle: 'short' });
    let puzzle: Puzzle = null;
    let loading = true;
    let error = false;
    let blocksId = null;
    let validError: string = '';
    let isNewPuzzle = false;
    let disabled = false;

    onMount(() => {
        loading = true;
        let url = new URL(document.location.href);
        const id = url.searchParams.get('id');
        userStore.subscribe(({ user }) => {
            loading = true;
            error = false;
            isNewPuzzle = id == 'new';
            puzzlePromise = isNewPuzzle
                ? Promise.resolve(user ? createNewEmpty(user.uid) : null)
                : getPuzzle(id);
            puzzlePromise
                .then((p) => {
                    puzzle = p;
                    blocksId = p.blocks.length + p.falseBlocks.length;
                })
                .catch(() => (error = true))
                .finally(() => (loading = false));
        });
    });

    function finish(mainMenuIfNew: boolean) {
        if (mainMenuIfNew && isNewPuzzle) {
            goto('/');
        } else {
            goto(`/puzzle/?id=${puzzle.id}`);
        }
    }

    function valid() {
        validError = '';
        disabled = true;
        savePuzzle(puzzle)
            .then(() => finish(false))
            .catch((e) => (validError = e.code))
            .finally(() => (disabled = false));
    }

    function remove() {
        validError = '';
        disabled = true;
        removePuzzle(puzzle)
            .then(() => goto('/'))
            .catch((e) => (validError = e.code))
            .finally(() => (disabled = false));
    }
</script>

<div class="m-4">
    {#if loading}
        <b>Chargement en cours</b>
    {:else if !error}
        {#if puzzle && puzzle.owner == $userStore.user.uid}
            <div>
                <div class="max-w-3xl mx-auto">
                    <input
                        type="text"
                        class="color-primary text-3xl font-bold w-full"
                        placeholder="Nom du puzzle"
                        bind:value={puzzle.name}
                    />
                    <h3 class="text-xl text-color-light">
                        Crée le {dateFormater.format(puzzle.creation_date.toDate())}
                    </h3>
                    <textarea
                        bind:value={puzzle.description}
                        class="w-full"
                        placeholder="Description"
                    />
                </div>
                <CodeBlocksListEdit
                    bind:blocks={puzzle.blocks}
                    bind:falseBlocks={puzzle.falseBlocks}
                    bind:blocksId
                />
                <div class="max-w-3xl mx-auto">
                    <div class="flex justify-between flex-col my-4 gap-2 md:flex-row">
                        <button
                            class="block w-full button-outline md:w-auto"
                            on:click={() => finish(true)}
                            {disabled}>Annuler</button
                        >
                        {#if !isNewPuzzle}<button
                                class="block w-full button-outline text-red-500 md:w-auto"
                                on:click={remove}
                                {disabled}>Supprimer</button
                            >{/if}
                        <button class="block w-full button md:w-auto" on:click={valid} {disabled}
                            >Valider</button
                        >
                    </div>
                    {#if validError}
                        <b class="text-red-500"
                            >Érreur lors de la sauvegarde du puzzle ({validError})</b
                        >
                    {/if}
                </div>
            </div>
        {:else if puzzle}
            <b class="text-red-500"
                >Vous n'êtes pas l'auteur de ce puzzle, vous ne pouvez pas modifier ce puzzle.
                Essayer de vous authentifier pour modifier ce puzzle.</b
            >
        {:else}
            <b class="text-red-500">Le puzzle n'existe pas, vérifier L'URL.</b>
        {/if}
    {:else}
        <b class="text-red-500">Érreur lors du chargement du puzzle</b>
    {/if}
</div>
