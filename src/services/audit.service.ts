/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Servicio del dominio de Auditoría y Trazabilidad.
 * Separa la implementación HTTP REST de la simulación en memoria.
 */

import { apiConfig } from '../config/api.config';
import { httpClient } from '../lib/api/api-client';
import { mockApiAdapter } from '../mocks/mock-api-adapter';
import { AuditLog } from '../types';

export interface IAuditService {
  getAuditLogs(): Promise<AuditLog[]>;
}

export class HttpAuditService implements IAuditService {
  getAuditLogs(): Promise<AuditLog[]> {
    return httpClient.get<AuditLog[]>(apiConfig.endpoints.audit.logs);
  }
}

export class MockAuditService implements IAuditService {
  getAuditLogs(): Promise<AuditLog[]> {
    return mockApiAdapter.getAuditLogs();
  }
}

export const auditService: IAuditService = apiConfig.isMockMode
  ? new MockAuditService()
  : new HttpAuditService();
