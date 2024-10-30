// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

/** Identifier type for auth.sso_providers */
export type AuthSsoProvidersId = string;

/**
 * Represents the table auth.sso_providers
 * Auth: Manages SSO identity provider information; see saml_providers for SAML.
 */
export default interface SsoProvidersTable {
  id: ColumnType<AuthSsoProvidersId, AuthSsoProvidersId, AuthSsoProvidersId>;

  /** Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code. */
  resourceId: ColumnType<string | null, string | null, string | null>;

  createdAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  updatedAt: ColumnType<Date | null, Date | string | null, Date | string | null>;
}

export type SsoProviders = Selectable<SsoProvidersTable>;

export type NewSsoProviders = Insertable<SsoProvidersTable>;

export type SsoProvidersUpdate = Updateable<SsoProvidersTable>;