import { POCKETBASE_BASE_URL } from '$env/static/private';
import PocketBase, { type RecordService } from 'pocketbase';

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
	created: string;
	updated?: string;
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

interface TypedPocketBase extends PocketBase {
	collection(idOrName: string): RecordService; // default fallback for any other collection
	collection(idOrName: 'invoices'): RecordService<Invoice>;
	collection(idOrName: 'clients'): RecordService<Client>;
	collection(idOrName: 'quotes'): RecordService<Quote>;
	collection(idOrName: 'companies'): RecordService<Company>;
	collection(idOrName: 'organization'): RecordService<Organization>;
}

export const pb = new PocketBase(POCKETBASE_BASE_URL) as TypedPocketBase;
