<script lang="ts">
    import { onMount } from 'svelte';
    import { getAllPuzzleResults, getPuzzle, getPuzzleResults } from '$lib/database/puzzles';
    import { userId, userStore } from '$lib/store';
    import { getShuffledBlocks, isBlocksCorrect } from '$lib/utils';
    import CodeBlocksList from '$lib/components/CodeBlocksList.svelte';
    import PuzzleResults from '$lib/components/PuzzleResults.svelte';
    import type { Unsubscriber } from 'svelte/store';

    const dateFormater = new Intl.DateTimeFormat('fr', { dateStyle: 'full', timeStyle: 'short' });
    let shuffle = false;
    let blocks: Block[] = [];
    let falseBlocks: Block[] = [];
    let puzzleHasFalseBlocks = false;
    let puzzle: Puzzle | null;
    let currentPuzzleUnsubsriber: Unsubscriber = null;
    let loading = true;
    let message: number = null; // 0 Wrong 1 Good
    let messageTimeoutId: number = null;
    let allResults: Results[] = [];
    let resultsSent = 0; // 0 - none, 1 - without succeeding, 2 - with success
    let resultLoading = 1; // 0 - none, 1 - initializing, 2 - sending
    let result: Results = null;

    $: authored = puzzle && $userStore.user?.uid == puzzle.owner;
    $: validButtonText =
        message != null
            ? message
                ? 'Correct !'
                : 'Incorrect !'
            : shuffle
            ? 'Valider'
            : puzzleHasFalseBlocks
            ? 'Réinitialiser'
            : 'Mélanger';

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
            puzzleHasFalseBlocks = p.falseBlocks.length > 0;
            currentPuzzleUnsubsriber = userStore.subscribe(() => {
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
                    [blocks, falseBlocks] = shuffle
                        ? getShuffledBlocks(p)
                        : [Array.from(p.blocks), Array.from(p.falseBlocks)];
                } else {
                    shuffle = false;
                    blocks = [];
                    resultLoading = 1;
                    resultsSent = 0;
                    result = null;
                }
            });
        });

        return () => {
            if (currentPuzzleUnsubsriber != null) {
                currentPuzzleUnsubsriber();
            }
        };
    });

    function shuffleButtonClicked() {
        if (shuffle) {
            if (messageTimeoutId != null) clearTimeout(messageTimeoutId);
            if (isBlocksCorrect(puzzle, blocks)) {
                shuffle = false;
                message = 1;
            } else {
                message = 0;
            }
            setTimeout(() => (message = null), 3000);
        } else {
            [blocks, falseBlocks] = getShuffledBlocks(puzzle);
            shuffle = true;
        }
    }
</script>

<div class="m-4">
    {#if loading}
        <b>Chargement en cours</b>
    {:else if puzzle}
        <div>
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
                <p class="my-2 text-justify">
                    {puzzle.description}
                </p>
                <p class="my-2 text-color-light text-justify">
                    Remettez les lignes de codes ci-dessous dans le bon ordre et en les <b
                        >indentant correctement</b
                    >.
                    <details>
                        <summary><u>Aide - Contrôles: comment utiliser l'application ?</u></summary>
                        <ul class="list-disc text-black dark:text-white">
                            <li>Vous devez remettre les lignes de code dans le bonne ordre.</li>
                            {#if puzzleHasFalseBlocks}
                                <li>
                                    <b>Glissez déposez</b> les blocs de la section « blocs de codes
                                    disponibles » dans la section « code »; vous pouvez aussi
                                    <b>double-cliquez</b> un bloc pour le faire changer de partie.
                                </li>
                            {/if}
                            <li>
                                <b>Glissez déposez</b> les blocs pour les remettre dans l'ordre (c'est
                                à dire cliquez sur un bloc et tout en maintenant le clic / le doigt,
                                déplacez la souris / le doigt à l'endroit désiré puis relachez pour déplacer
                                le bloc).
                            </li>
                            <li>
                                Indentez les blocs en <b>survolant</b> avec la souris ou en
                                <b>cliquant</b>
                                sur le bloc puis
                                <b>cliquez</b> sur une des deux flèche qui s'affiche à gauche du bloc
                                pour indenter ou désindenter le bloc.
                            </li>
                            <li>
                                Validez votre réponse en <b>cliquant</b> sur le bouton « valider », il
                                afficheras si le code est correct ou non.
                            </li>
                            <li>
                                Envoyez vos résultas en <b>cliquant</b> sur le bouton correspondant tout
                                en bas de la page. Vous pouvez envoyer vos résultas sans avoir réussi
                                et vous pouvez renvoyer vos résultas après avoir fini le puzzle.
                            </li>
                        </ul>
                    </details>
                </p>
            </div>

            <CodeBlocksList bind:blocks bind:falseBlocks {puzzleHasFalseBlocks} />

            <div class="mx-auto max-w-3xl">
                <button
                    class="button w-full"
                    on:click={shuffleButtonClicked}
                    class:bg-primary-variant={shuffle && message == null}
                    class:bg-red-500={message == 0}
                    class:bg-green-500={message == 1}
                >
                    {validButtonText}
                </button>
                <PuzzleResults
                    {puzzle}
                    {shuffle}
                    {result}
                    {allResults}
                    {resultsSent}
                    {resultLoading}
                />
            </div>
        </div>
    {:else}
        <b class="text-red-500">Le puzzle n'existe pas, vérifier L'URL.</b>
    {/if}
</div>
