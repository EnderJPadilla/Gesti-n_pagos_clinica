/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Configuración centralizada de la API REST.
 * Define la URL base, encabezados comunes, políticas de timeout y diccionario
 * de rutas provisionales sujetas a confirmación por parte de Codex.
 */

import { envConfig } from './env';

export interface ApiEndpoints {
  auth: {
    login: string;
    logout: string;
    me: string;
  };
  payers: {
    list: string;
    detail: (id: string) => string;
    create: string;
    update: (id: string) => string;
  };
  receivables: {
    list: string;
    detail: (id: string) => string;
    create: string;
    update: (id: string) => string;
  };
  payments: {
    list: string;
    detail: (id: string) => string;
    create: string;
    reversals: (id: string) => string;
    allocations: (id: string) => string;
  };
  dashboard: {
    summary: string;
    topDebtors: string;
    recentPayments: string;
  };
  audit: {
    logs: string;
  };
}

export const apiConfig = {
  baseUrl: envConfig.apiBaseUrl,
  dataMode: envConfig.dataMode,
  authMode: envConfig.authMode,
  timeoutMs: envConfig.requestTimeoutMs,
  isMockMode: envConfig.dataMode === 'mock',

  defaultHeaders: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },

  /**
   * Rutas provisionales de la API REST acordadas en la especificación inicial.
   * Están claramente centralizadas aquí para que cuando Codex entregue los contratos finales,
   * solo sea necesario cambiar las rutas en este archivo sin tocar los componentes.
   */
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      me: '/auth/me',
    },
    payers: {
      list: '/payers',
      detail: (id: string) => `/payers/${id}`,
      create: '/payers',
      update: (id: string) => `/payers/${id}`,
    },
    receivables: {
      list: '/receivables',
      detail: (id: string) => `/receivables/${id}`,
      create: '/receivables',
      update: (id: string) => `/receivables/${id}`,
    },
    payments: {
      list: '/payments',
      detail: (id: string) => `/payments/${id}`,
      create: '/payments',
      reversals: (id: string) => `/payments/${id}/reversals`,
      allocations: (id: string) => `/payments/${id}/allocations`,
    },
    dashboard: {
      summary: '/dashboard/summary',
      topDebtors: '/dashboard/top-debtors',
      recentPayments: '/dashboard/recent-payments',
    },
    audit: {
      logs: '/audit-logs',
    },
  } as ApiEndpoints,
};
