/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Barril de exportación central de todos los contratos y tipos del dominio.
 */

export * from './api.types';
export * from './user.types';
export * from './auth.types';
export * from './payer.types';
export * from './receivable.types';
export * from './payment.types';
export * from './dashboard.types';
export * from './audit.types';

// Alias para compatibilidad con código existente
export type PaginatedResult<T> = import('./api.types').PaginatedResponse<T>;
export type ApiError = import('./api.types').ApiErrorPayload;
