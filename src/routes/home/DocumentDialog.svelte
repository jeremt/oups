<script lang="ts">
    import Cross from '$lib/icons/Cross.svelte';
    import Trash from '$lib/icons/Trash.svelte';
    import Dialog from '$lib/widgets/Dialog.svelte';
    import {resize} from '$lib/helpers/resize';
    import {formatDate} from '$lib/helpers/formatDate';
    import type {Line, Invoice} from '$lib/pocketbase/pocketbase';
    import DateInput from '$lib/widgets/DateInput.svelte';

    type Props = {
        isOpen: boolean;
    };
    let {isOpen = $bindable(false)}: Props = $props();

    let mode = $state<'add' | 'edit'>('add');
    let invoice = $state<Invoice>({
        id: 'osef-invoice',
        client_id: 'osef-client',
        company_id: 'osef-company',
        created: new Date().toString(),
        emission_date: formatDate(new Date()),
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
    });
    let newLine = $state<Line>({description: '', price: 0});
    function addOrRemoveLine(line: Line, index: number) {
        if (index === -1 && line.description.length > 0 && line.price > 0) {
            invoice.lines.push({...line});
            newLine = {description: '', price: 0};
        } else if (index !== -1 && line.description.length === 0 && !line.price) {
            invoice.lines.splice(index, 1);
        }
    }

    const aspectRatio = 595.28 / 841.89;
    let width = $state(0);
    let height = $derived(width / aspectRatio);
    let ratio = $derived(width / 595.28);
    function onResize(w: number, h: number) {
        width = w;
    }

    function add() {
        console.log(invoice);
    }
</script>

<Dialog {isOpen} onrequestclose={() => (isOpen = false)}>
    <div class="editor">
        <header>
            <button aria-label="Back" class="icon" onclick={() => (isOpen = false)}>
                <Cross />
            </button>
            <input type="number" style:width="5rem" placeholder="600" />
            <label for="quantityLabel" style:font-size="1rem">€ /</label>
            <input id="quantityLabel" style:width="5rem" type="text" placeholder="Jours" />
            <a role="button" style:margin-left="auto" href="/api/invoices/id/pdf">Télécharger</a>
            {#if mode === 'add'}
                <button class="btn" onclick={add}>Créer</button>
            {/if}
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
                <div class="date">Date d'émission : <DateInput bind:date={invoice.emission_date} /></div>
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
                <div class="title">Facture nº{invoice.number} : <input type="text" class="invisible" placeholder="Titre" bind:value={invoice.name} /></div>
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style:width="calc(var(--ratio) * 100px)">Prix</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each invoice.lines as line, i}
                            <tr>
                                <td
                                    ><input
                                        bind:value={line.description}
                                        onchange={() => addOrRemoveLine(line, i)}
                                        type="text"
                                        class="invisible editable-description"
                                        placeholder="Description"
                                    /></td
                                >
                                <td
                                    ><div class="editable-price">
                                        <input bind:value={line.price} onchange={() => addOrRemoveLine(line, i)} type="number" class="invisible" placeholder="500" /> €
                                    </div>
                                </td>
                                <td style:padding="0" style:border="none" style:width="{10 * ratio}px"
                                    ><button class="remove-line icon" style:color="var(--color-fg-2)" onclick={() => invoice.lines.splice(i, 1)}
                                        ><Trash --size="{ratio * 12}px" /></button
                                    ></td
                                >
                            </tr>
                        {/each}
                        <tr>
                            <td
                                ><input
                                    bind:value={newLine.description}
                                    onchange={() => addOrRemoveLine(newLine, -1)}
                                    type="text"
                                    class="invisible editable-description"
                                    placeholder="Description"
                                /></td
                            >
                            <td
                                ><div class="editable-price">
                                    <input bind:value={newLine.price} onchange={() => addOrRemoveLine(newLine, -1)} type="number" class="invisible" placeholder="500" /> €
                                </div></td
                            >
                        </tr>
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
        <!-- /.invoice -->
        <textarea style:margin-top="1rem" placeholder="Information supplémentaires sur la facture"></textarea>
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
        & input {
            color: inherit;
        }
    }
    .company {
        display: flex;
        flex-direction: column;
        width: fit-content;
        cursor: pointer;
        transition: 0.3s outline;
        border-radius: 0.3rem;
        outline: 2px solid transparent;
        &:hover {
            outline: 2px solid var(--color-primary);
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
        border-radius: 0.3rem;
        outline: 2px solid transparent;
        cursor: pointer;
        transition: 0.3s outline;
        &:hover {
            outline: 2px solid var(--color-primary);
        }
        & .name {
            font-weight: bold;
        }
    }
    .date {
        display: flex;
        gap: 0.2rem;

        & :global(input.day),
        & :global(input.month) {
            width: calc(12px * var(--ratio));
        }
        & :global(input.year) {
            width: calc(40px * var(--ratio));
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
            display: flex;
            align-items: center;
            gap: 0.2rem;
            & input[type='text'].invisible {
                font-weight: inherit;
                font-size: inherit;
                flex-grow: 1;
            }
        }
        & table {
            width: calc(100% + 40px * var(--ratio));
            & th,
            & td {
                & input {
                    font-size: calc(12px * var(--ratio));
                }
                padding: 0 calc(8px * var(--ratio));
                height: calc(25px * var(--ratio));
                border-width: calc(1px * var(--ratio));
                border-color: var(--color-white-2);
            }
        }
    }
    .payment-title {
        font-weight: bold;
        font-size: calc(14px * var(--ratio));
    }
    .editable-description {
        width: 100%;
    }
    .editable-price {
        display: flex;
        align-items: center;
        & input[type='number'] {
            width: 3.8rem;
        }
    }
</style>
