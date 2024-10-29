<script lang="ts">
    let {form} = $props();
</script>

<svelte:head>
    <title>Oups</title>
    <meta name="description" content="Gestionnaire de factures & devis pour éviter les erreurs 😅" />
    <meta property="og:title" content="Oups" />
    <meta property="og:site_name" content="Oups" />
    <meta property="og:image" content="/thumbnail.png" />
    <meta property="og:url" content="https://oups.vercel.app" />
    <meta property="og:description" content="Gestionnaire de factures & devis pour éviter les erreurs 😅" />
    <meta property="twitter:title" content="Oups" />
    <meta property="twitter:description" content="Gestionnaire de factures & devis pour éviter les erreurs 😅" />
    <meta property="twitter:image" content="/thumbnail.png" />
</svelte:head>

<main>
    <h1>Oups.</h1>
    <div class="subtitle">Gestionnaire de factures & devis<br />pour éviter les erreurs 😅</div>
    <form method="post">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" placeholder="picsou@disney.fr" autocomplete="email" value={form?.email} />
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" />
        <button class="btn" type="submit" style:margin-top="0.5rem">Login</button>
    </form>

    <div style:color="var(--color-error)">
        {#if form && form.status === 'invalid'}
            L'email & le mot de passe sont requis.
        {/if}
        {#if form && form.status === 'login_failed'}
            La connexion a échouée ({form.message}).
        {/if}
    </div>
    <small style:max-width="20rem" style:color="var(--color-fg-2)" style:text-align="center">
        Ce projet est (pour le moment) prévu pour un usage personnel, mais le code est <a href="https://github.com/jeremt/oups" target="_blank">open source</a>, donc vous pouvez
        héberger vous-même une version du projet !
    </small>
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
