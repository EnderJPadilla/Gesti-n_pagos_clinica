/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Fachada de compatibilidad regresiva para el cliente de API.
 * Los servicios de dominio se encuentran modularizados en src/services/*.service.ts
 * y el cliente HTTP unificado en src/lib/api/api-client.ts.
 */

export * from './index';
export { httpClient } from '../lib/api/api-client';
export { ApiClientError } from '../lib/api/api-error';
