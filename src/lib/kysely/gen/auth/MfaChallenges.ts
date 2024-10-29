// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { AuthMfaFactorsId } from './MfaFactors';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

/** Identifier type for auth.mfa_challenges */
export type AuthMfaChallengesId = string;

/**
 * Represents the table auth.mfa_challenges
 * auth: stores metadata about challenge requests made
 */
export default interface MfaChallengesTable {
  id: ColumnType<AuthMfaChallengesId, AuthMfaChallengesId, AuthMfaChallengesId>;

  factorId: ColumnType<AuthMfaFactorsId, AuthMfaFactorsId, AuthMfaFactorsId>;

  createdAt: ColumnType<Date, Date | string, Date | string>;

  verifiedAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  ipAddress: ColumnType<string, string, string>;

  otpCode: ColumnType<string | null, string | null, string | null>;

  webAuthnSessionData: ColumnType<unknown | null, unknown | null, unknown | null>;
}

export type MfaChallenges = Selectable<MfaChallengesTable>;

export type NewMfaChallenges = Insertable<MfaChallengesTable>;

export type MfaChallengesUpdate = Updateable<MfaChallengesTable>;
