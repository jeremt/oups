import {POCKETBASE_BASE_URL, POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD} from '$env/static/private';
import PocketBase, {type RecordService} from 'pocketbase';

export interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    avatar: string;
    company: string;
    created: string;
    updated?: string;
    //
    expand?: {
        company: Company;
    };
}
export interface Client {
    id: string;
    name: string;
    email?: string;
    address: string;
    company_id: string;
    created: string;
    updated?: string;
    //
    expand?: {
        company: Company;
    };
}

export interface Company {
    id: string;
    name: string;
    logo: string;
    address: string;
    bic: string;
    iban: string;
    siren: string;
    phone: string;
    email: string;
    current_quote_number: number;
    current_invoice_number: number;
    created: string;
    updated?: string;
}

export interface Organization {
    id: string;
    name: string;
    logo: string;
    user_ids: number[];
    created: string;
    updated?: string;
    //
    expand?: {
        user_ids: User[];
    };
}

export type InvoiceStatus = 'generated' | 'sent' | 'paid' | 'declared';
export interface Line {
    price: number;
    quantity?: number;
    description: string;
}
export interface Invoice {
    id: string;
    name: string;
    number: number;
    emission_date: string;
    status: InvoiceStatus;
    client_id: string;
    company_id: string;
    organization_id: string;
    lines: Line[];
    quantity_label: string;
    created: string;
    updated?: string;
    //
    expand?: {
        company_id: Company;
        client_id: Client;
        organization_id: Organization;
    };
}

export type QuoteStatus = 'generated' | 'sent' | 'accepted' | 'declined';
export interface Quote {
    id: string;
    name: string;
    number: number;
    emission_date: string;
    status: InvoiceStatus;
    client_id: string;
    company_id: string;
    organization_id: string;
    lines: Line[];
    quantity_label: string;
    created: string;
    updated?: string;
    //
    expand?: {
        company_id: Company;
        client_id: Client;
        organization_id: Organization;
    };
}

export interface TypedPocketBase extends PocketBase {
    collection(idOrName: string): RecordService; // default fallback for any other collection
    collection(idOrName: 'invoices'): RecordService<Invoice>;
    collection(idOrName: 'clients'): RecordService<Client>;
    collection(idOrName: 'quotes'): RecordService<Quote>;
    collection(idOrName: 'companies'): RecordService<Company>;
    collection(idOrName: 'organization'): RecordService<Organization>;
}

let _pb_admin: TypedPocketBase | undefined;

export const pb = async () => new PocketBase(POCKETBASE_BASE_URL) as TypedPocketBase;
export const pb_admin = async () => {
    if (!_pb_admin) {
        _pb_admin = await pb();
        await _pb_admin.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
    }
    return _pb_admin;
};
