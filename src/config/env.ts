/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Validación y lectura centralizada de variables de entorno para el frontend.
 * Previene el acceso disperso a import.meta.env y asegura valores por defecto seguros.
 */

export interface AppEnvConfig {
  apiBaseUrl: string;
  dataMode: 'mock' | 'api';
  authMode: 'demo' | 'api';
  requestTimeoutMs: number;
  appName: string;
}

/**
 * Lee y valida las variables de entorno de Vite
 */
function readEnvConfig(): AppEnvConfig {
  const env = (import.meta as any).env || {};

  // Modo de datos: 'mock' o 'api' (por defecto 'mock' mientras Codex desarrolla el backend)
  const rawDataMode = env.VITE_DATA_MODE || env.VITE_AUTH_MODE || 'mock';
  const dataMode: 'mock' | 'api' = rawDataMode === 'api' ? 'api' : 'mock';

  // Modo de autenticación
  const rawAuthMode = env.VITE_AUTH_MODE || rawDataMode || 'demo';
  const authMode: 'demo' | 'api' = rawAuthMode === 'api' ? 'api' : 'demo';

  // URL base de la API REST (provisional: /api/v1 o la definida en el entorno)
  const apiBaseUrl = (env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

  // Timeout para solicitudes HTTP (15 segundos por defecto)
  const requestTimeoutMs = Number(env.VITE_API_TIMEOUT_MS) || 15000;

  return {
    apiBaseUrl,
    dataMode,
    authMode,
    requestTimeoutMs,
    appName: 'Control Financiero de Clínica',
  };
}

export const envConfig = readEnvConfig();
