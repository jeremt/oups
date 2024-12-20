// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { PublicCompaniesId } from './Companies';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

/** Identifier type for public.clients */
export type PublicClientsId = number;

/** Represents the table public.clients */
export interface ClientsTable {
  id: ColumnType<PublicClientsId, never, never>;

  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

  updatedAt: ColumnType<Date, Date | string | undefined, Date | string>;

  name: ColumnType<string, string, string>;

  address: ColumnType<string, string, string>;

  email: ColumnType<string | null, string | null, string | null>;

  logoUrl: ColumnType<string | null, string | null, string | null>;

  companyId: ColumnType<PublicCompaniesId, PublicCompaniesId, PublicCompaniesId>;
}

export type Clients = Selectable<ClientsTable>;

export type NewClients = Insertable<ClientsTable>;

export type ClientsUpdate = Updateable<ClientsTable>;
