<script lang="ts">
    let {form} = $props();
</script>

<main>
    <h1>Oups.</h1>
    <div class="subtitle">Gestionnaire de factures & devis<br />pour éviter les erreurs 😅</div>
    <form method="post">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="email" value={form?.email} />
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" />
        <button class="btn" type="submit" style:margin-top="0.5rem">Login</button>
    </form>
    {#if form && form.status === 'invalid'}
        Provide both email & password
    {/if}
    {#if form && form.status === 'login_failed'}
        Login failed: {form.message}
    {/if}
</main>

<style>
    main {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 1rem;
        flex-direction: column;
        & h1 {
            font-size: 4rem;
            margin: 0;
        }
        & .subtitle {
            color: var(--color-fg-1);
            text-align: center;
        }
        & form {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            width: 20rem;
        }
    }
</style>
