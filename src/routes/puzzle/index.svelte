<script lang="ts">
    import type { Block, DndEvent, Puzzle, Results as Result, Results } from '../../global';
    import { onMount } from 'svelte';
    import {
        deleteAllResults,
        getAllPuzzleResults,
        getPuzzle,
        getPuzzleResults,
        setPuzzleResults
    } from '../../database/puzzles';
    import { anonymousUserName, userId, userStore } from '../../store';
    import { getShuffledBlocks, isBlocksCorrect } from '../../utils';
    import CodeBlock from '../../components/CodeBlock.svelte';
    import { flip } from 'svelte/animate';
    import { cubicInOut } from 'svelte/easing';
    import { fly } from 'svelte/transition';
    import { dndzone } from 'svelte-dnd-action';
    import Modal from '../../components/Modal.svelte';

    const dateFormater = new Intl.DateTimeFormat('fr', { dateStyle: 'full', timeStyle: 'short' });
    let shuffle: boolean = false;
    let blocks: Block[] = [];
    let puzzle: Puzzle | null;
    let loading = true;
    let message: number = null;
    let resultsSent = 0; // 0 - none, 1 - without succeeding, 2 - with success
    let resultLoading = 1; // 0 - none, 1 - initializing, 2 - sending
    let result: Result = null;
    let resultModal = false;
    let disabled = false;

    let allResults: Results[] = [];
    $: authored = puzzle && $userStore.user?.uid == puzzle.owner;

    onMount(() => {
        message = null;
        puzzle = null;
        loading = true;
        let url = new URL(document.location.href);
        const puzzleId = url.searchParams.get('id');
        loading = true;
        getPuzzle(puzzleId).then((p) => {
            loading = false;
            puzzle = p;
            userStore.subscribe((_) => {
                if (p) {
                    allResults = [];
                    if ($userStore.user?.uid == puzzle.owner) {
                        shuffle = false;
                        getAllPuzzleResults(puzzleId).then((r) => (allResults = r));
                    } else {
                        shuffle = true;
                        resultLoading = 1;
                        resultsSent = 0;
                        result = null;
                        getPuzzleResults(puzzleId, $userId).then((r) => {
                            result = r;
                            resultsSent = r ? (r.success ? 2 : 1) : 0;
                            resultLoading = 0;
                        });
                    }
                    blocks = shuffle ? getShuffledBlocks(p) : Array.from(p.blocks);
                } else {
                    shuffle = false;
                    blocks = [];
                    resultLoading = 1;
                    resultsSent = 0;
                    result = null;
                }
            });
        });
    });

    function shuffleButtonClicked() {
        if (shuffle) {
            if (isBlocksCorrect(puzzle, blocks)) {
                shuffle = false;
                message = 1;
            } else {
                message = 0;
            }
        } else {
            blocks = getShuffledBlocks(puzzle);
            shuffle = true;
        }
    }

    function handleDND(event: CustomEvent) {
        blocks = event.detail.items;
    }

    function showSendResultModal() {
        if (resultsSent < 1) {
            resultModal = true;
        } else if (resultsSent < 2 && !shuffle) {
            sendResults(result.name);
        }
    }

    function sendResults(name?: string) {
        if (name || $anonymousUserName.length >= 3) {
            resultModal = false;
            if ((resultsSent < 2 && !shuffle) || resultsSent < 1) {
                resultLoading = 2;
                const success = !shuffle;
                const r = {
                    name: name || $anonymousUserName,
                    success
                };
                setPuzzleResults(puzzle.id, $userId, r)
                    .then(() => {
                        (resultsSent = success ? 2 : 1), (result = r);
                    })
                    .finally(() => (resultLoading = 0));
            }
        } else {
            resultModal = true;
        }
    }

    function resetResults() {
        if (!authored) return;

        disabled = true;
        deleteAllResults(puzzle)
            .then(() => (allResults = []))
            .finally(() => (disabled = false));
    }
</script>

<div class="m-4">
    {#if loading}
        <b>Chargement en cours</b>
    {:else if puzzle}
        <div class="max-w-3xl mx-auto">
            <h2
                class="color-primary text-3xl uppercase text-center flex justify-between items-center gap-3 font-bold"
            >
                {#if $userStore.isLoggedIn}
                    <a
                        href="/"
                        class="text-xl text-color-light hover:ring hover:ring-primary hover:text-primary py-1 px-2 rounded-lg focus:outline-none focus:ring-primary focus:ring focus:text-primary"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-7 w-7 inline align-text-bottom"
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
                        <span class="-ml-1 hidden md:inline"> RETOUR </span>
                    </a>
                {/if}
                {puzzle.name}
                {#if authored}
                    <a
                        href="/puzzle/edit?id={puzzle.id}"
                        class="text-xl text-color-light hover:ring hover:ring-primary hover:text-primary py-1 px-2 rounded-lg focus:outline-none focus:ring-primary focus:ring focus:text-primary"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-7 w-7 inline align-bottom"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                            />
                        </svg>
                        <span class="hidden md:inline">ÉDITER</span>
                    </a>
                {:else}
                    <span />
                {/if}
            </h2>
            {#if authored}
                <h3 class="text-xl text-color-light">
                    Crée le {dateFormater.format(puzzle.creation_date.toDate())}
                </h3>
            {/if}
            <p class="my-2">
                {puzzle.description}
            </p>
            <p class="my-2 text-color-light text-justify">
                Remettez les lignes de codes ci-dessous dans l'ordre en les glissant et en les
                déposant à la bonne place et en les <b>indentant correctement</b> (en utilisant les flèches à gauche des morceaux de code).
            </p>
            <div
                class="my-4"
                use:dndzone={{ items: blocks }}
                on:consider={handleDND}
                on:finalize={handleDND}
            >
                {#each blocks as block (block.id)}
                    <div class="m-2" animate:flip={{ duration: 500, easing: cubicInOut }}>
                        <CodeBlock {block} />
                    </div>
                {/each}
            </div>
            <div>
                <button
                    class="button w-full"
                    on:click={shuffleButtonClicked}
                    class:bg-primary-variant={shuffle}>{shuffle ? 'Valider' : 'Mélanger'}</button
                >
                {#if authored}
                    <div class="my-4">
                        <h3 class="color-primary text-3xl font-bold text-center">Réponses</h3>
                        <div class="grid grid-cols-2 gap-1">
                            <span class="text-2xl font-bold color-primary text-center my-2"
                                >Nom</span
                            >
                            <span class="text-2xl font-bold color-primary text-center my-2"
                                >Résultat</span
                            >
                            {#each allResults as result (result)}
                                <span class="font-bold">{result.name}</span>
                                <span class="text-red-500" class:text-green-500={result.success}
                                    >{result.success ? 'Réussi' : 'Pas terminé'}</span
                                >
                            {:else}
                                <span class="font-bold col-start-1 col-end-2">
                                    Aucune réponse
                                </span>
                            {/each}
                        </div>
                    </div>
                    <button class="button my-2 w-full" on:click={resetResults} {disabled}>
                        Réinitialiser les réponses
                    </button>
                {:else}
                    <button
                        class="button-outline my-4 w-full md:w-auto"
                        disabled={resultsSent >= 2 ||
                            (resultsSent >= 1 && shuffle) ||
                            resultLoading > 0}
                        on:click={showSendResultModal}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 align-text-bottom inline"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                        </svg>
                        Envoyer ses résultats
                    </button>
                    {#if resultLoading > 0}
                        <span class="mx-2 text-lg">
                            {resultLoading == 1 ? 'Chargement en cours' : 'Envoie en cours'},
                            veuillez patienter...
                        </span>
                    {:else if resultsSent >= 2}
                        <span class="mx-2 text-lg text-green-500"> Résultats envoyés. </span>
                    {:else if resultsSent >= 1 && shuffle}
                        <span class="mx-2 text-lg text-orange-500">
                            Réussissez le puzzle pour pouvoir renvoyer vos résultats.
                        </span>
                    {:else if !shuffle}
                        <span class="mx-2 text-lg text-red-500"> Résultats non envoyés. </span>
                    {/if}
                {/if}
            </div>
            {#if message == 0}
                <p class="text-red-500 text-lg" in:fly={{ x: -200 }}>
                    Ce n'est pas la bonne réponse réessayez.
                </p>
            {:else if message == 1}
                <p class="text-green-500  text-lg" in:fly={{ x: -200 }}>C'est la bonne réponse !</p>
            {/if}
        </div>
    {:else}
        <b class="text-red-500">Le puzzle n'existe pas, vérifier L'URL.</b>
    {/if}
    {#if resultModal}
        <Modal on:close={() => (resultModal = false)}>
            <span slot="title">Envoyer les résultats</span>
            <div class="my-2">
                Nom à envoyer avec les résultats :
                <!-- svelte-ignore a11y-autofocus -->
                <input
                    type="text"
                    class="w-full"
                    placeholder="Nom Prénom"
                    bind:value={$anonymousUserName}
                    required
                    autofocus
                    minlength="3"
                />
            </div>
            <div class="flex flex-col gap-2 sm:flex-row-reverse">
                <button class="button w-full sm:w-auto" on:click={() => sendResults()}
                    >Envoyer</button
                >
                <button
                    class="button-outline w-full sm:w-auto"
                    on:click={() => (resultModal = false)}>Annuler</button
                >
            </div>
        </Modal>
    {/if}
</div>
