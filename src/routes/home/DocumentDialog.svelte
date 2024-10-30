<script lang="ts">
    import Cross from '$lib/icons/Cross.svelte';
    import Trash from '$lib/icons/Trash.svelte';
    import Dialog from '$lib/widgets/Dialog.svelte';
    import {resize} from '$lib/actions/resize';
    import ResizeInput from '$lib/widgets/ResizeInput.svelte';
    import SearchClientDialog from './SearchClientDialog.svelte';
    import SearchCompanyDialog from './SearchCompanyDialog.svelte';
    import {formatDateForInput} from '$lib/helpers/formatDate';
    import type {Clients} from '$lib/kysely/gen/public/Clients';
    import type {Companies} from '$lib/kysely/gen/public/Companies';
    import type {Company, Document} from '$lib/kysely/queries';
    import type {NewDocuments, PublicDocumentsLines} from '$lib/kysely/gen/public/Documents';

    type Props = {
        isOpen: boolean;
        selected?: Document;
        companies: Company[];
        onCreated: (document: Document) => void;
        onEdited: (document: Document) => void;
    };
    let {isOpen = $bindable(false), companies = $bindable(), selected, onEdited, onCreated}: Props = $props();

    type NewDocument = Omit<NewDocuments, 'createdAt' | 'updatedAt'> & {companyId?: number; company?: Companies; clientId?: number; client?: Clients; emittedAt: string};

    let isClientsOpen = $state(false);
    let isCompaniesOpen = $state(false);
    let document = $state<NewDocument>(
        selected
            ? {...selected, emittedAt: formatDateForInput(selected.emittedAt)}
            : {
                  clientId: 0,
                  companyId: 0,
                  emittedAt: formatDateForInput(new Date()),
                  name: '',
                  number: 0,
                  quantityBase: 0,
                  quantityLabel: '',
                  discountPrice: 0,
                  depositPercent: 0,
                  status: 'generated',
                  type: 'invoice',
                  lines: [],
                  note: '',
              },
    );

    let newLine = $state<PublicDocumentsLines[number]>({description: '', price: 0});

    function addOrRemoveLine(line: PublicDocumentsLines[number], index: number) {
        if (index === -1 && line.description.length > 0 && line.price > 0) {
            (document?.lines as PublicDocumentsLines).push({...line});
            newLine = {description: '', price: 0};
        } else if (index !== -1 && line.description.length === 0 && !line.price) {
            (document?.lines as PublicDocumentsLines).splice(index, 1);
        }
    }

    const aspectRatio = 595.28 / 841.89;
    let width = $state(0);
    const height = $derived(width / aspectRatio);
    const ratio = $derived(width / 595.28);
    function onResize(w: number, h: number) {
        width = w;
    }
    const disabled = $derived(document.name === '' || !document.clientId || !document.companyId);

    async function create() {
        const response = await fetch(`/api/documents`, {
            method: 'POST',
            body: JSON.stringify(document),
            headers: {'Content-Type': 'application/json'},
        });
        if (response.status === 200) {
            const {id: documentId} = await response.json();
            const document = await (await fetch(`/api/documents/${documentId}`)).json();
            onCreated(document);
            isOpen = false;
        } else {
            console.error(await response.json());
        }
    }

    async function edit() {
        const response = await fetch(`/api/documents/${selected!.id}`, {
            method: 'PUT',
            body: JSON.stringify(document),
            headers: {'Content-Type': 'application/json'},
        });
        if (response.status === 200) {
            const {id: documentId} = await response.json();
            const document = await (await fetch(`/api/documents/${documentId}`)).json();
            onEdited(document);
            isOpen = false;
        } else {
            console.error(await response.json());
        }
    }

    $effect(() => {
        (async () => {
            if (isOpen && !selected) {
                const response = await fetch(`/api/documents/new`);
                if (response.status === 200) {
                    const {client, invoiceSequence} = (await response.json()) as {client: Clients; invoiceSequence: number; quoteSequence: number};
                    document = {
                        number: invoiceSequence,
                        client,
                        clientId: client?.id,
                        company: companies[0],
                        companyId: companies[0]?.id,
                        emittedAt: formatDateForInput(new Date()),
                        name: '',
                        quantityBase: 600,
                        quantityLabel: 'jour',
                        status: 'generated',
                        type: 'invoice',
                        lines: [],
                        note: '',
                    };
                } else {
                    console.error(await response.json());
                }
            } else if (isOpen && selected) {
                document = {...selected, emittedAt: formatDateForInput(selected.emittedAt)};
            }
        })();
    });
</script>

<Dialog {isOpen} onrequestclose={() => (isOpen = false)}>
    <div class="editor">
        <header>
            <button aria-label="Retour" class="icon" style:margin-right="auto" onclick={() => (isOpen = false)}>
                <Cross />
            </button>
            {#if selected}
                <a role="button" href="/api/documents/{selected.id}/pdf">Télécharger</a>
                <button class="btn" onclick={edit} {disabled}>Editer</button>
            {:else}
                <button class="btn" onclick={create} {disabled}>Créer</button>
            {/if}
        </header>
        <div class="invoice" use:resize={onResize} style:--ratio={ratio} style:height="{height}px">
            {#if document?.company}
                {@const company = document.company}
                <div
                    class="company"
                    onclick={() => (isCompaniesOpen = true)}
                    role="button"
                    tabindex="0"
                    onkeydown={e => {
                        if (e.key === 'Enter') {
                            isCompaniesOpen = true;
                        }
                    }}
                >
                    {#if company.name}<div class="name">{company.name}</div>{/if}
                    {#if company.address}<div class="address">{company.address}</div>{/if}
                    {#if company.phone}<div>{company.phone}</div>{/if}
                    {#if company.email}<div class="email">{company.email}</div>{/if}
                    {#if company.siren}<div>SIREN : {company.siren}</div>{/if}
                </div>
                <div class="date">Date d'émission : <input type="date" class="invisible" bind:value={document.emittedAt} /></div>
            {/if}
            {#if document?.clientId}
                {@const client = document.client}
                <div
                    class="client"
                    onclick={() => (isClientsOpen = true)}
                    role="button"
                    tabindex="0"
                    onkeydown={e => {
                        if (e.key === 'Enter') {
                            isClientsOpen = true;
                        }
                    }}
                >
                    {#if client?.name}<div class="name">{client.name}</div>{/if}
                    {#if client?.email}<div>{client.email}</div>{/if}
                    {#if client?.address}<div>{client.address}</div>{/if}
                </div>
            {/if}
            <div class="infos">
                <div class="title">Facture nº{document.number} : <input type="text" class="invisible" placeholder="Titre" bind:value={document.name} /></div>
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style:width="calc(var(--ratio) * 100px)">Prix</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each document.lines as PublicDocumentsLines as line, i}
                            <tr>
                                <td>
                                    <ResizeInput
                                        rows={1}
                                        bind:value={line.description}
                                        onchange={() => addOrRemoveLine(line, i)}
                                        class="invisible editable-description"
                                        placeholder="Description"
                                    />
                                </td>
                                <td
                                    ><div class="editable-price">
                                        <input bind:value={line.price} onchange={() => addOrRemoveLine(line, i)} type="number" class="invisible" placeholder="500" /> €
                                    </div>
                                </td>
                                <td style:padding="0" style:border="none" style:width="{10 * ratio}px"
                                    ><button class="remove-line icon" style:color="var(--color-fg-2)" onclick={() => (document.lines as PublicDocumentsLines).splice(i, 1)}
                                        ><Trash --size="{ratio * 12}px" /></button
                                    ></td
                                >
                            </tr>
                        {/each}
                        <tr>
                            <td>
                                <ResizeInput
                                    rows={1}
                                    bind:value={newLine.description}
                                    onchange={() => addOrRemoveLine(newLine, -1)}
                                    class="invisible editable-description"
                                    placeholder="Description"
                                />
                            </td>
                            <td>
                                <div class="editable-price">
                                    <input bind:value={newLine.price} onchange={() => addOrRemoveLine(newLine, -1)} type="number" class="invisible" placeholder="500" /> €
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div style:font-weight="bold" style:text-align="right" style:margin-top="{20 * ratio}px">
                    Total (HT) : {(document.lines as PublicDocumentsLines).reduce((total, line) => total + line.price, 0)} €
                </div>
                <div style:text-align="right">TVA Non applicable</div>
                {#if document.company}
                    {@const company = document.company}
                    <div class="payment-title">Informations de paiement</div>
                    <div class="payment-infos">BIC : {company.bic}<br />IBAN : {company.iban}</div>
                {/if}
            </div>
        </div>
        <!-- /.invoice -->
        <div class="config">
            <label for="quantityBase">Ajouter une colonne pour quantifier chaque ligne en fonction d'un prix de base :</label>
            <div>
                <input id="quantityBase" type="number" style:width="5rem" bind:value={document.quantityBase} placeholder="600" />
                <label for="quantityLabel" style:font-size="1rem">€ /</label>
                <input id="quantityLabel" style:width="5rem" type="text" bind:value={document.quantityLabel} placeholder="Jours" />
            </div>
            <label for="discountPrice">Ajouter un prix arbitraire pour le total avec réduction (0 est ignoré) :</label>
            <div>
                <input id="discountPrice" type="number" style:width="5rem" bind:value={document.discountPrice} placeholder="600" />
                <span style:font-size="1rem">€</span>
            </div>
            <label for="depositPercent">Ajouter un % d'acompte en fonction du prix total :</label>
            <div>
                <input id="depositPercent" type="number" style:width="5rem" bind:value={document.depositPercent} placeholder="30" />
                <span style:font-size="1rem">%</span>
            </div>
            <label for="note">Ajouter des notes & infos supplémentaires sur cette facture :</label>
            <ResizeInput bind:value={document.note} placeholder="Erreurs éventuelles, situation spécifiques, etc." />
        </div>
    </div>
</Dialog>
<SearchClientDialog bind:isOpen={isClientsOpen} onSelect={client => (document.client = client)} />
<SearchCompanyDialog bind:isOpen={isCompaniesOpen} onSelect={company => (document.company = company)} {companies} />

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
    .config {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.5rem 1rem 0;
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
        & input,
        & :global(textarea) {
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
        align-items: center;
        gap: 0.2rem;

        & :global(input.day),
        & :global(input.month) {
            width: calc(16px * var(--ratio));
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
                padding: 0 calc(8px * var(--ratio));
                height: calc(25px * var(--ratio));
                border-width: calc(1px * var(--ratio));
                border-color: var(--color-white-2);

                & .editable-price {
                    height: 100%;
                    padding-top: calc(5px * var(--ratio));
                    & input[type='number'] {
                        font-size: calc(12px * var(--ratio));
                        width: calc(60px * var(--ratio));
                    }
                }
                & :global(textarea) {
                    margin-top: calc(5px * var(--ratio));
                    width: 100%;
                    font-size: calc(12px * var(--ratio));
                }
            }
        }
    }
    .payment-title {
        font-weight: bold;
        font-size: calc(14px * var(--ratio));
    }
</style>
