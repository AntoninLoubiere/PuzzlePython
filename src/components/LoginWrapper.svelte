<script lang="ts">
    import { userStore } from '../store';
</script>

{#if !$userStore.firebaseControlled}
    Chargement en cours... Veuillez patienter.
{:else if $userStore.isLoggedIn}
    <slot />
{:else}
    <b>Veuillez vous connecter pour avoir accés à cette page</b>
{/if}
