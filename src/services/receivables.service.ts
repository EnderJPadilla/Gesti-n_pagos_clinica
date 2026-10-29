/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Servicio del dominio de Cuentas por Cobrar.
 * Separa la implementación HTTP REST de la simulación en memoria.
 */

import { apiConfig } from '../config/api.config';
import { httpClient } from '../lib/api/api-client';
import { mockApiAdapter } from '../mocks/mock-api-adapter';
import {
  CreateReceivableDto,
  PaginatedResponse,
  Receivable,
  ReceivablesFilterParams,
  UpdateReceivableDto,
  UserRole,
} from '../types';

export interface IReceivablesService {
  getReceivables(params?: ReceivablesFilterParams): Promise<PaginatedResponse<Receivable>>;
  getReceivableById(id: string): Promise<Receivable>;
  createReceivable(dto: CreateReceivableDto, actor?: string, role?: UserRole): Promise<Receivable>;
  updateReceivable(id: string, dto: UpdateReceivableDto, actor?: string, role?: UserRole): Promise<Receivable>;
}

export class HttpReceivablesService implements IReceivablesService {
  getReceivables(params?: ReceivablesFilterParams): Promise<PaginatedResponse<Receivable>> {
    return httpClient.get<PaginatedResponse<Receivable>>(
      apiConfig.endpoints.receivables.list,
      params as any
    );
  }

  getReceivableById(id: string): Promise<Receivable> {
    return httpClient.get<Receivable>(apiConfig.endpoints.receivables.detail(id));
  }

  createReceivable(dto: CreateReceivableDto): Promise<Receivable> {
    return httpClient.post<Receivable>(apiConfig.endpoints.receivables.create, dto);
  }

  updateReceivable(id: string, dto: UpdateReceivableDto): Promise<Receivable> {
    return httpClient.patch<Receivable>(apiConfig.endpoints.receivables.update(id), dto);
  }
}

export class MockReceivablesService implements IReceivablesService {
  getReceivables(params?: ReceivablesFilterParams): Promise<PaginatedResponse<Receivable>> {
    return mockApiAdapter.getReceivables(params);
  }

  getReceivableById(id: string): Promise<Receivable> {
    return mockApiAdapter.getReceivableById(id);
  }

  createReceivable(dto: CreateReceivableDto, actor?: string, role?: UserRole): Promise<Receivable> {
    return mockApiAdapter.createReceivable(dto, actor, role);
  }

  updateReceivable(id: string, dto: UpdateReceivableDto, actor?: string, role?: UserRole): Promise<Receivable> {
    return mockApiAdapter.updateReceivable(id, dto, actor, role);
  }
}

export const receivablesService: IReceivablesService = apiConfig.isMockMode
  ? new MockReceivablesService()
  : new HttpReceivablesService();
