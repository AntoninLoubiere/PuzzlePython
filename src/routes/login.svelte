<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
    import errorMessages from '../config/error-messages.json';

    function onSubmit() {
        loading = true;
        errorCode = null;
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                goto('/' + encodeURI($page.query.get('redirect') || ''));
            })
            .catch((error) => {
                errorCode = error.code;
                console.error(error);
            })
            .finally(() => {
                loading = false;
            });
    }

    let email: string;
    let password: string;
    let errorCode: string;
    let loading = false;
</script>

<div class="border-primary border-4 rounded-xl max-w-md m-auto my-6 p-2 box-border">
    <h2 class="font-bold text-3xl uppercase color-primary text-center mb-2">Se connecter</h2>

    {#if errorCode}
        <div
            class="bg-red-200 dark:bg-red-300 text-black border-2 border-red-800 rounded-xl p-3 my-3"
        >
            <h3 class="font-bold text-red-900">ÉRREUR</h3>
            {errorMessages[errorCode] || errorMessages['default']}
        </div>
    {/if}

    <form on:submit|preventDefault={onSubmit} class="w-full">
        <label for="email" class="text-lg">Email :</label>
        <input type="email" name="email" class="input w-full mx-0" bind:value={email} />
        <label for="pasword" class="text-lg">Mot de passe :</label>
        <input type="password" name="password" class="input w-full mx-0" bind:value={password} />
        <button type="submit" class="button w-full mt-3 bg-primary-variant" disabled={loading}
            >Se connecter</button
        >
    </form>
</div>
