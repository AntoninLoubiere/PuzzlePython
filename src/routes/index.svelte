<script lang="ts">
    import type { Puzzle } from '../global';

    import { loadPuzzles } from '../database/puzzles';

    import { userStore } from '../store';
    import PuzzleList from '../components/PuzzleList.svelte';
    import LoginWrapper from '../components/LoginWrapper.svelte';

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
