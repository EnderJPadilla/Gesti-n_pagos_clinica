/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cliente HTTP Reutilizable y Centralizado para Control Financiero de Clínica.
 * Implementa fetch con AbortController, correlación de solicitudes (X-Correlation-Id),
 * timeout configurable y manejo robusto de errores sin exponer datos sensibles.
 */

import { apiConfig } from '../../config/api.config';
import { QueryParams } from '../../types/api.types';
import { ApiClientError } from './api-error';
import { buildQueryString } from './api-serialization';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: QueryParams;
  body?: any;
  timeoutMs?: number;
  idempotencyKey?: string;
  skipAuthHeader?: boolean;
}

export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeoutMs: number;

  constructor(config?: {
    baseUrl?: string;
    defaultHeaders?: Record<string, string>;
    defaultTimeoutMs?: number;
  }) {
    this.baseUrl = config?.baseUrl || apiConfig.baseUrl;
    this.defaultHeaders = config?.defaultHeaders || apiConfig.defaultHeaders;
    this.defaultTimeoutMs = config?.defaultTimeoutMs || apiConfig.timeoutMs;
  }

  /**
   * Genera un identificador aleatorio de correlación para auditoría de red
   */
  private generateCorrelationId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Ejecuta una solicitud HTTP con control de tiempo y manejo uniforme de errores
   */
  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const correlationId = this.generateCorrelationId();
    const timeoutMs = options.timeoutMs || this.defaultTimeoutMs;

    // Construcción de la URL con query params
    const queryString = buildQueryString(options.params);
    const url = `${this.baseUrl}${endpoint}${queryString}`;

    // Configuración de cabeceras
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      'X-Correlation-Id': correlationId,
      ...(options.headers as Record<string, string>),
    };

    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    // Configuración de timeout y abort controller
    const controller = new AbortController();
    let isTimeoutTriggered = false;

    const timeoutId = setTimeout(() => {
      isTimeoutTriggered = true;
      controller.abort();
    }, timeoutMs);

    // Si el llamador proporcionó su propio signal de cancelación
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    // Preparar el cuerpo si existe
    let requestBody: BodyInit | undefined;
    if (options.body !== undefined && options.body !== null) {
      if (typeof options.body === 'string') {
        requestBody = options.body;
      } else {
        requestBody = JSON.stringify(options.body);
      }
    }

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: requestBody,
        signal: controller.signal,
        credentials: options.credentials || 'same-origin',
      });

      clearTimeout(timeoutId);

      // Manejo de respuestas 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      // Lectura segura del cuerpo de la respuesta
      let responseData: any = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }
      } else {
        try {
          responseData = await response.text();
        } catch {
          responseData = null;
        }
      }

      if (!response.ok) {
        throw ApiClientError.fromHttpResponse(response, responseData, correlationId);
      }

      return responseData as T;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error instanceof ApiClientError) {
        throw error;
      }

      if (isTimeoutTriggered) {
        throw ApiClientError.fromTimeout(timeoutMs, correlationId);
      }

      if (error?.name === 'AbortError') {
        throw new ApiClientError({
          message: 'La solicitud fue cancelada.',
          code: 'NETWORK_ERROR',
          correlationId,
        });
      }

      throw ApiClientError.fromNetwork(error, correlationId);
    }
  }

  // Métodos de conveniencia
  public get<T>(endpoint: string, params?: QueryParams, options?: Omit<RequestOptions, 'method' | 'params'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET', params });
  }

  public post<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  public patch<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  public delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Instancia única del cliente HTTP para toda la aplicación
export const httpClient = new HttpClient();
