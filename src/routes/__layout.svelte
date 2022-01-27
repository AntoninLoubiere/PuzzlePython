<script>
    import { page } from '$app/stores';
    import { userStore } from '$lib/store';

    import '../app.css';
    import { auth } from '$lib/middleware/auth';
    import { goto } from '$app/navigation';
    function loginCallback() {
        goto(
            '/login?redirect=' +
                encodeURIComponent($page.path.substring(1) + document.location.search)
        );
    }
</script>

<header class="pl-4 sticky top-0 bg-primary dark:bg-primary-dark text-white h-10 z-10">
    <nav class="grid grid-cols-3 items-center justify-between h-full">
        {#if $userStore.isLoggedIn}
            <span class="order-1 whitespace-nowrap">{$userStore.user.email.split('@')[0]}</span>
            <button
                class="uppercase bg-primary dark:bg-primary-dark hover:bg-primary-variant focus-visible:bg-primary-variant h-full px-3 order-3 font-semibold justify-self-end whitespace-nowrap"
                on:click={() => auth.signOut()}
            >
                Se déconnecter
            </button>
        {:else if $page.path != '/login'}
            <span class="order-1" />
            <a
                href="/login"
                class="order-3 h-full justify-self-end"
                on:click|preventDefault={loginCallback}
            >
                <button
                    class="px-3 uppercase bg-primary dark:bg-primary-dark hover:bg-primary-variant focus-visible:bg-primary-variant h-full font-semibold whitespace-nowrap"
                >
                    Se connecter
                </button>
            </a>
        {:else}
            <span class="order-1" />
            <span class="order-3" />
        {/if}
        <a
            href="/"
            class="order-2 uppercase tracking-widest underline justify-self-center whitespace-nowrap invisible md:visible"
            >Python Puzzles</a
        >
    </nav>
</header>

<slot />

<style>
</style>
