<script lang="ts">
    import { loadPuzzles } from '$lib/database/puzzles';

    import { userStore } from '$lib/store';
    import PuzzleList from '$lib/components/PuzzleList.svelte';
    import LoginWrapper from '$lib/components/LoginWrapper.svelte';

    let puzzles: Puzzle[] = [];
    $: if ($userStore.isLoggedIn) {
        loadPuzzles($userStore.user.uid).then((p) => (puzzles = p));
    } else {
        puzzles = [];
    }
</script>

<div class="m-4">
    <LoginWrapper>
        <PuzzleList {puzzles} />
    </LoginWrapper>
</div>
