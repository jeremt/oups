// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { AuthUsersId } from './Users';
import type { default as FactorType } from './FactorType';
import type { default as FactorStatus } from './FactorStatus';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

/** Identifier type for auth.mfa_factors */
export type AuthMfaFactorsId = string;

/**
 * Represents the table auth.mfa_factors
 * auth: stores metadata about factors
 */
export default interface MfaFactorsTable {
  id: ColumnType<AuthMfaFactorsId, AuthMfaFactorsId, AuthMfaFactorsId>;

  userId: ColumnType<AuthUsersId, AuthUsersId, AuthUsersId>;

  friendlyName: ColumnType<string | null, string | null, string | null>;

  factorType: ColumnType<FactorType, FactorType, FactorType>;

  status: ColumnType<FactorStatus, FactorStatus, FactorStatus>;

  createdAt: ColumnType<Date, Date | string, Date | string>;

  updatedAt: ColumnType<Date, Date | string, Date | string>;

  secret: ColumnType<string | null, string | null, string | null>;

  phone: ColumnType<string | null, string | null, string | null>;

  lastChallengedAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  webAuthnCredential: ColumnType<unknown | null, unknown | null, unknown | null>;

  webAuthnAaguid: ColumnType<string | null, string | null, string | null>;
}

export type MfaFactors = Selectable<MfaFactorsTable>;

export type NewMfaFactors = Insertable<MfaFactorsTable>;

export type MfaFactorsUpdate = Updateable<MfaFactorsTable>;
