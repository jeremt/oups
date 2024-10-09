<script lang="ts">
    import {formatDate} from '$lib/helpers/formatDate';
    import type {Client, Company} from '$lib/pocketbase/pocketbase';
    import Dialog from '$lib/widgets/Dialog.svelte';

    type Props = {
        isOpen: boolean;
        client: Client;
        company: Company;
    };
    const lines = [{description: 'Encadrement', price: 500}];
    let {isOpen = $bindable(false), company, client}: Props = $props();
</script>

<Dialog {isOpen} onrequestclose={() => (isOpen = false)}>
    <div class="editor">
        <header>
            <button aria-label="Back" class="icon" onclick={() => (isOpen = false)}>
                <svg width="9" height="16" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M8.77848 0.214981C8.48311 -0.0716602 8.00423 -0.0716602 7.70886 0.21498L0.238016 7.46512C0.232456 7.47021 0.226957 7.47539 0.221519 7.48066C0.0616633 7.6358 -0.0116771 7.84309 0.00149882 8.04609C0.012571 8.21833 0.08592 8.3875 0.221547 8.51912C0.226664 8.52409 0.231836 8.52897 0.237061 8.53376L7.70883 15.7848C8.0042 16.0714 8.48308 16.0714 8.77845 15.7848C9.07381 15.4982 9.07381 15.0334 8.77845 14.7468L1.82618 7.99991L8.77848 1.253C9.07384 0.966358 9.07384 0.501621 8.77848 0.214981Z"
                        fill="currentColor"
                    />
                </svg>
            </button>
            <a role="button" style:margin-left="auto" href="/api/invoices/id/pdf">Download PDF</a>
            <button class="btn">Sauvegarder</button>
        </header>
        <div class="invoice">
            <div class="company">
                {#if company.name}<div class="name">{company.name}</div>{/if}
                {#if company.address}<div class="address">{company.address}</div>{/if}
                {#if company.phone}<div>{company.phone}</div>{/if}
                {#if company.email}<div>{company.email}</div>{/if}
                {#if company.siren}<div>SIREN : {company.siren}</div>{/if}
                <div class="date">Date d'émission : {formatDate(new Date())}</div>
            </div>
            <div class="client">
                {#if client.name}<div>{client.name}</div>{/if}
                {#if client.email}<div>{client.email}</div>{/if}
                {#if client.address}<div>{client.address}</div>{/if}
            </div>
            <div class="infos">
                <div class="title">Facture nº14 : MVP Plateforme échange de logements avec un nom super long</div>
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Prix</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each lines as { description, price }}
                            <tr>
                                <td>{description}</td>
                                <td>{price} €</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
                <div class="payment-title">Informations de paiement</div>
                <div class="payment-infos">IBAN : {company.iban}<br />BIC : {company.bic}</div>
            </div>
        </div>
    </div>
</Dialog>

<style>
    .editor {
        display: flex;
        flex-direction: column;
        & header {
            display: flex;
            width: 100%;
            gap: 1rem;
            align-items: center;
            margin-bottom: 1rem;
        }
    }

    .invoice {
        padding: 2rem;
        gap: 1rem;
        background-color: white;
        box-shadow: 0 0.2rem 2rem hsla(0, 0%, 0%, 0.3);
        line-height: 1.5rem;
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        grid-template-rows: repeat(3, 1fr);
        white-space: pre-line;
    }
    .company {
        display: flex;
        flex-direction: column;
        grid-column-end: 5;
        grid-column-start: 1;
        grid-row: 1;
        & .name {
            font-weight: bold;
            font-size: 1.2rem;
        }
        & .address {
            margin-bottom: 1.5rem;
        }
        & .date {
            margin-top: 1.5rem;
        }
    }
    .client {
        display: flex;
        flex-direction: column;
        grid-column-start: 8;
        grid-column-end: 13;
        grid-row: 1;
        text-align: end;
        margin-top: auto;
    }
    .infos {
        grid-column-start: 1;
        grid-column-end: 13;
        grid-row: 2;
        & .title {
            font-size: 1.5rem;
            padding-bottom: 0.5rem;
        }
        & table {
            width: 100%;
        }
    }
</style>
