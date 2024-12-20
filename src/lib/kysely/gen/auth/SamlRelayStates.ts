// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { AuthSsoProvidersId } from './SsoProviders';
import type { AuthFlowStateId } from './FlowState';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

/** Identifier type for auth.saml_relay_states */
export type AuthSamlRelayStatesId = string;

/**
 * Represents the table auth.saml_relay_states
 * Auth: Contains SAML Relay State information for each Service Provider initiated login.
 */
export interface SamlRelayStatesTable {
  id: ColumnType<AuthSamlRelayStatesId, AuthSamlRelayStatesId, AuthSamlRelayStatesId>;

  ssoProviderId: ColumnType<AuthSsoProvidersId, AuthSsoProvidersId, AuthSsoProvidersId>;

  requestId: ColumnType<string, string, string>;

  forEmail: ColumnType<string | null, string | null, string | null>;

  redirectTo: ColumnType<string | null, string | null, string | null>;

  createdAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  updatedAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  flowStateId: ColumnType<AuthFlowStateId | null, AuthFlowStateId | null, AuthFlowStateId | null>;
}

export type SamlRelayStates = Selectable<SamlRelayStatesTable>;

export type NewSamlRelayStates = Insertable<SamlRelayStatesTable>;

export type SamlRelayStatesUpdate = Updateable<SamlRelayStatesTable>;
