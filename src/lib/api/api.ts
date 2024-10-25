import Clients from '$lib/kysely/gen/public/Clients';
import Companies, {CompaniesId} from '$lib/kysely/gen/public/Companies';
import {UsersId} from '$lib/kysely/gen/public/Users';
import {kysely} from '$lib/kysely/kysely';
import {ConnectedUser} from '$lib/supabase/user';
import {sql} from 'kysely';

export async function getCompanies(user: ConnectedUser) {
    const companies = await kysely
        .selectFrom('companies')
        .leftJoin('users', 'users.company_id', 'companies.id')
        .leftJoin('users_organizations', 'users_organizations.user_id', 'users.id')
        .select([
            'companies.id',
            'companies.address',
            'companies.bic',
            'companies.created_at',
            'companies.iban',
            'companies.invoice_sequence',
            'companies.logo_url',
            'companies.name',
            'companies.quote_sequence',
            'companies.siren',
            'companies.updated_at',
        ])
        .where('users.id', '=', user.id as UsersId)
        .execute();

    return companies;
}

export async function getInvoices(companyIds: number[]) {
    if (companyIds.length === 0) {
        return [];
    }

    const invoices = await kysely
        .selectFrom('documents')
        .select([
            'documents.id',
            'documents.status',
            'documents.lines',
            'documents.name',
            'documents.note',
            'documents.number',
            'documents.emitted_at',
            'documents.quantity_base',
            'documents.quantity_label',
            'documents.organization_id',
            'documents.type',
            'documents.created_at',
            'documents.updated_at',
            'documents.company_id',
            'documents.client_id',
            sql<Companies>`json_agg(companies)->0`.as('company'),
            sql<Clients>`json_agg(clients)->0`.as('client'),
        ])
        .leftJoin('companies', 'companies.id', 'documents.company_id')
        .leftJoin('clients', 'clients.id', 'documents.client_id')
        .where('documents.company_id', 'in', companyIds as CompaniesId[])
        .where('type', '=', 'invoice')
        .groupBy('documents.id')
        .execute();

    return invoices;
}
