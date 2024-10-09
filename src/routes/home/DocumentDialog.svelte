<script lang="ts">
    import {formatDate} from '$lib/helpers/formatDate';
    import type {Client, Company, Invoice} from '$lib/pocketbase/pocketbase';
    import Dialog from '$lib/widgets/Dialog.svelte';
    import {resize} from '$lib/helpers/resize';

    type Props = {
        isOpen: boolean;
    };
    let {isOpen = $bindable(false)}: Props = $props();

    const invoice = {
        id: 'osef-invoice',
        client_id: 'osef-client',
        company_id: 'osef-company',
        created: new Date().toString(),
        emission_date: new Date().toString(),
        lines: [
            {price: 3200, description: 'Encadrement'},
            {price: 150, description: 'Réunions'},
            {price: 540, description: 'Mentorats'},
            {
                price: 12000,
                description: `Un truc un peu compliqué :
- qui doit être sur plusieurs lignes
- pour tout expliquer dans le détail
- ça passe en vrai`,
            },
            {price: 540, description: 'Mentorats'},
        ],
        name: 'Encadrement',
        number: 15,
        status: 'generated',
        expand: {
            client_id: {
                id: 'osef-client',
                created: new Date().toString(),
                name: 'Ada Tech School',
                address: '28 rue du Petit Musc\n75004 Paris',
                company_id: 'osef-company',
            },
            company_id: {
                id: 'osef-company',
                current_invoice_number: 14,
                current_quote_number: 1,
                created: new Date().toString(),
                name: 'M JÉRÉMIE TABOADA ALVAREZ',
                address: '11 rue de Pommard\n75012 Paris',
                bic: 'AGRIFRPP882',
                iban: 'FR76 1820 6000 5165 0085 3209 021',
                siren: '853 291 268',
                email: 'taboada.jeremie@gmail.com',
                phone: '06 24 91 22 44',
            },
        },
    } as Invoice;

    const aspectRatio = 595.28 / 841.89;
    let width = $state(0);
    let height = $derived(width / aspectRatio);
    let ratio = $derived(width / 595.28);
    function onResize(w: number, h: number) {
        width = w;
    }
</script>

<Dialog {isOpen} onrequestclose={() => (isOpen = false)}>
    <div class="editor">
        <header>
            <button aria-label="Back" class="icon" onclick={() => (isOpen = false)}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M1.22179 16.7782C2.00279 17.5592 3.26915 17.5592 4.05016 16.7782L8.99992 11.8284L13.9498 16.7782C14.7308 17.5592 15.9971 17.5592 16.7782 16.7782C17.5592 15.9971 17.5592 14.7308 16.7782 13.9498L11.8284 8.99999L16.7781 4.05026C17.5591 3.26921 17.5591 2.00288 16.7781 1.22183C15.9971 0.440785 14.7307 0.440785 13.9497 1.22183L8.99998 6.17157L4.05022 1.22185C3.26921 0.440799 2.00285 0.440799 1.22179 1.22185C0.440781 2.0029 0.440781 3.26923 1.22179 4.05027L6.17155 9L1.22179 13.9498C0.44072 14.7308 0.44072 15.9971 1.22179 16.7782Z"
                        fill="var(--color-fg)"
                    />
                </svg>
            </button>
            <a role="button" style:margin-left="auto" href="/api/invoices/id/pdf">Download PDF</a>
            <button class="btn">Sauvegarder</button>
        </header>
        <div class="invoice" use:resize={onResize} style:--ratio={ratio} style:height="{height}px">
            {#if invoice.expand?.company_id}
                {@const company = invoice.expand.company_id}
                <div class="company">
                    {#if company.name}<div class="name">{company.name}</div>{/if}
                    {#if company.address}<div class="address">{company.address}</div>{/if}
                    {#if company.phone}<div>{company.phone}</div>{/if}
                    {#if company.email}<div class="email">{company.email}</div>{/if}
                    {#if company.siren}<div>SIREN : {company.siren}</div>{/if}
                </div>
                <div class="date">Date d'émission : {formatDate(new Date())}</div>
            {/if}
            {#if invoice.expand?.client_id}
                {@const client = invoice.expand.client_id}
                <div class="client">
                    {#if client.name}<div class="name">{client.name}</div>{/if}
                    {#if client.email}<div>{client.email}</div>{/if}
                    {#if client.address}<div>{client.address}</div>{/if}
                </div>
            {/if}
            <div class="infos">
                <div class="title">Facture nº{invoice.number} : {invoice.name}</div>
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style:width="calc(var(--ratio) * 100px)">Prix</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each invoice.lines as { description, price }}
                            <tr>
                                <td>{description}</td>
                                <td>{price} €</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
                <div style:font-weight="bold" style:text-align="right" style:margin-top="{20 * ratio}px">
                    Total (HT) : {invoice.lines.reduce((total, line) => total + line.price, 0)} €
                </div>
                <div style:text-align="right">TVA Non applicable</div>
                {#if invoice.expand?.company_id}
                    {@const company = invoice.expand.company_id}
                    <div class="payment-title">Informations de paiement</div>
                    <div class="payment-infos">BIC : {company.bic}<br />IBAN : {company.iban}</div>
                {/if}
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
        position: relative;
        color: var(--color-black);
        font-size: calc(12px * var(--ratio));
        padding: calc(50px * var(--ratio));
        line-height: calc(20px * var(--ratio));
        background-color: white;
        box-shadow: 0 0.2rem 2rem hsla(0, 0%, 0%, 0.3);
        width: 100%;
        white-space: pre-line;
    }
    .company {
        display: flex;
        flex-direction: column;
        width: fit-content;
        cursor: pointer;
        &:hover {
            outline: 0.1rem solid var(--color-primary);
        }
        & .name {
            font-weight: bold;
        }
        & .address {
            margin-bottom: calc(12px * var(--ratio));
        }
        & .email {
            margin-bottom: calc(12px * var(--ratio));
        }
    }
    .client {
        position: absolute;
        top: calc(150px * var(--ratio));
        right: calc(50px * var(--ratio));
        display: flex;
        flex-direction: column;
        text-align: end;
        margin-top: auto;
        & .name {
            font-weight: bold;
        }
    }
    .infos {
        position: absolute;
        top: calc(260px * var(--ratio));
        width: calc(100% - 2 * 50px * var(--ratio));
        & .title {
            font-size: calc(20px * var(--ratio));
            font-weight: bold;
            padding-bottom: 0.5rem;
        }
        & table {
            width: 100%;
            & th,
            & td {
                padding: 0 calc(8px * var(--ratio));
                height: calc(25px * var(--ratio));
                border-width: calc(1px * var(--ratio));
            }
        }
    }
    .payment-title {
        font-weight: bold;
        font-size: calc(14px * var(--ratio));
    }
</style>
