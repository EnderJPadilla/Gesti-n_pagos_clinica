/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Utilidades de serialización para parámetros de consulta (query params),
 * fechas y cadenas de importes monetarios.
 */

import { QueryParams } from '../../types/api.types';

/**
 * Convierte un objeto de parámetros en una cadena de búsqueda codificada URL (query string).
 * Descarta valores nulos, indefinidos o cadenas vacías.
 */
export function buildQueryString(params?: QueryParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    if (typeof value === 'boolean') {
      searchParams.set(key, String(value));
    } else if (typeof value === 'number') {
      searchParams.set(key, String(value));
    } else {
      searchParams.set(key, String(value).trim());
    }
  });

  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

/**
 * Valida y normaliza un importe en formato decimal "0.00"
 */
export function normalizeMoneyAmount(amount: string | number): string {
  if (typeof amount === 'number') {
    return amount.toFixed(2);
  }
  const clean = String(amount || '0').replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return '0.00';
  return parsed.toFixed(2);
}
