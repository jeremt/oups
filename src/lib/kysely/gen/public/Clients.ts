// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

/** Identifier type for public.clients */
export type ClientsId = number & { __brand: 'ClientsId' };

/** Represents the table public.clients */
export default interface ClientsTable {
  id: ColumnType<ClientsId, never, never>;

  created_at: ColumnType<Date, Date | string | undefined, Date | string>;

  updated_at: ColumnType<Date, Date | string | undefined, Date | string>;

  name: ColumnType<string, string, string>;

  address: ColumnType<string, string, string>;

  email: ColumnType<string | null, string | null, string | null>;

  logo_url: ColumnType<string | null, string | null, string | null>;
}

export type Clients = Selectable<ClientsTable>;

export type NewClients = Insertable<ClientsTable>;

export type ClientsUpdate = Updateable<ClientsTable>;