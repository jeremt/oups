// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { AuthUsersId } from './Users';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

/** Identifier type for auth.identities */
export type AuthIdentitiesId = string;

/**
 * Represents the table auth.identities
 * Auth: Stores identities associated to a user.
 */
export interface IdentitiesTable {
  id: ColumnType<AuthIdentitiesId, AuthIdentitiesId | undefined, AuthIdentitiesId>;

  providerId: ColumnType<string, string, string>;

  userId: ColumnType<AuthUsersId, AuthUsersId, AuthUsersId>;

  identityData: ColumnType<unknown, unknown, unknown>;

  provider: ColumnType<string, string, string>;

  lastSignInAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  createdAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  updatedAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  /** Auth: Email is a generated column that references the optional email property in the identity_data */
  email: ColumnType<string | null, never, never>;
}

export type Identities = Selectable<IdentitiesTable>;

export type NewIdentities = Insertable<IdentitiesTable>;

export type IdentitiesUpdate = Updateable<IdentitiesTable>;
