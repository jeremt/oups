import {kysely} from '$lib/kysely/kysely';
import {sql} from 'kysely';
import type {Clients} from './gen/public/Clients';
import type {Companies} from './gen/public/Companies';
import type {DocumentType} from './gen/public/DocumentType';
import type {ConnectedUser} from '$lib/supabase/user';

export async function getCompanies(user: ConnectedUser) {
    const companies = await kysely
        .selectFrom('public.companies')
        .leftJoin('public.users', 'public.users.companyId', 'public.companies.id')
        .leftJoin('public.usersOrganizations', 'public.usersOrganizations.userId', 'public.users.id')
        .select([
            'public.companies.id',
            'public.companies.address',
            'public.companies.bic',
            'public.companies.createdAt',
            'public.companies.iban',
            'public.companies.invoiceSequence',
            'public.companies.logoUrl',
            'public.companies.name',
            'public.companies.quoteSequence',
            'public.companies.siren',
            'public.companies.updatedAt',
            'public.companies.email',
            'public.companies.phone',
        ])
        .where('public.users.id', '=', user.id)
        .execute();

    return companies;
}

export type Company = Awaited<ReturnType<typeof getCompanies>>[number];

export async function getDocuments(companyIds: number[], type: DocumentType) {
    if (companyIds.length === 0) {
        return [];
    }
    const documents = await kysely
        .selectFrom('public.documents')
        .select([
            'public.documents.id',
            'public.documents.status',
            'public.documents.lines',
            'public.documents.name',
            'public.documents.note',
            'public.documents.number',
            'public.documents.emittedAt',
            'public.documents.quantityBase',
            'public.documents.quantityLabel',
            'public.documents.organizationId',
            'public.documents.type',
            'public.documents.createdAt',
            'public.documents.updatedAt',
            'public.documents.companyId',
            'public.documents.clientId',
            sql<Companies>`json_agg(companies)->0`.as('company'),
            sql<Clients>`json_agg(clients)->0`.as('client'),
        ])
        .leftJoin('public.companies', 'public.companies.id', 'public.documents.companyId')
        .leftJoin('public.clients', 'public.clients.id', 'public.documents.clientId')
        .where('public.documents.companyId', 'in', companyIds)
        .where('type', '=', type)
        .groupBy('public.documents.id')
        .execute();

    return documents;
}

export type Document = Awaited<ReturnType<typeof getDocuments>>[number];
