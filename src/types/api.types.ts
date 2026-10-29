/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Contratos genéricos de API para Control Financiero de Clínica.
 * Usa MoneyAmount como string decimal para garantizar precisión financiera (Regla R17).
 */

export type MoneyAmount = string; // Cadenas decimales con formato "0.00"

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'DUPLICATE_REFERENCE'
  | 'INSUFFICIENT_RECEIVABLE_BALANCE'
  | 'PAYMENT_ALREADY_REVERSED'
  | 'IDEMPOTENCY_CONFLICT'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'SERVER_ERROR';

export interface ApiErrorPayload {
  code: ApiErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
  correlationId?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;
