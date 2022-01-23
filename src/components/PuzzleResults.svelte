<script lang="ts">
    import { anonymousUserName, userId, userStore } from '../store';
    import type { Puzzle, Results } from '../global';
    import { createEventDispatcher } from 'svelte';
    import { deleteAllResults, setPuzzleResults } from '../database/puzzles';
    import Modal from './Modal.svelte';
    export let shuffle: boolean;
    export let puzzle: Puzzle;

    export let allResults: Results[];
    export let result: Results;
    export let resultsSent: number; // 0 - none, 1 - without succeeding, 2 - with success
    export let resultLoading: number;

    let resultModal = false;
    let disabled = false;
    $: authored = puzzle && $userStore.user?.uid == puzzle.owner;

    function resetResults() {
        if (!authored || !allResults.length) return;

        disabled = true;
        deleteAllResults(puzzle)
            .then(() => (allResults = []))
            .finally(() => (disabled = false));
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
                    success,
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
</script>

<div>
    {#if authored}
        <div class="my-4">
            <h3 class="color-primary text-3xl font-bold text-center">Réponses</h3>
            <div class="grid grid-cols-2 gap-1">
                <span class="text-2xl font-bold color-primary text-center my-2">Nom</span>
                <span class="text-2xl font-bold color-primary text-center my-2">Résultat</span>
                {#each allResults as result (result)}
                    <span class="font-bold">{result.name}</span>
                    <span class="text-red-500" class:text-green-500={result.success}
                        >{result.success ? 'Réussi' : 'Pas terminé'}</span
                    >
                {:else}
                    <span class="font-bold col-start-1 col-end-2"> Aucune réponse </span>
                {/each}
            </div>
        </div>
        <button
            class="button my-2 w-full"
            on:click={resetResults}
            disabled={disabled || !allResults.length}
        >
            Réinitialiser les réponses
        </button>
    {:else}
        <button
            class="button-outline my-4 w-full md:w-auto"
            disabled={resultsSent >= 2 || (resultsSent >= 1 && shuffle) || resultLoading > 0}
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
                {resultLoading == 1 ? 'Chargement en cours' : 'Envoie en cours'}, veuillez
                patienter...
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
            <button class="button w-full sm:w-auto" on:click={() => sendResults()}>Envoyer</button>
            <button class="button-outline w-full sm:w-auto" on:click={() => (resultModal = false)}
                >Annuler</button
            >
        </div>
    </Modal>
{/if}
