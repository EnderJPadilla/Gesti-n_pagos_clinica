/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Servicio del dominio de Pagadores (EPS, Aseguradoras, Particulares).
 * Separa la implementación HTTP REST de la simulación en memoria.
 */

import { apiConfig } from '../config/api.config';
import { httpClient } from '../lib/api/api-client';
import { mockApiAdapter } from '../mocks/mock-api-adapter';
import {
  CreatePayerDto,
  Payer,
  UpdatePayerDto,
  UserRole,
} from '../types';

export interface IPayersService {
  getPayers(params?: { search?: string; type?: string; isActive?: boolean }): Promise<Payer[]>;
  getPayerById(id: string): Promise<Payer>;
  createPayer(dto: CreatePayerDto, actor?: string, role?: UserRole): Promise<Payer>;
  updatePayer(id: string, dto: UpdatePayerDto, actor?: string, role?: UserRole): Promise<Payer>;
}

export class HttpPayersService implements IPayersService {
  getPayers(params?: { search?: string; type?: string; isActive?: boolean }): Promise<Payer[]> {
    return httpClient.get<Payer[]>(apiConfig.endpoints.payers.list, params);
  }

  getPayerById(id: string): Promise<Payer> {
    return httpClient.get<Payer>(apiConfig.endpoints.payers.detail(id));
  }

  createPayer(dto: CreatePayerDto): Promise<Payer> {
    return httpClient.post<Payer>(apiConfig.endpoints.payers.create, dto);
  }

  updatePayer(id: string, dto: UpdatePayerDto): Promise<Payer> {
    return httpClient.patch<Payer>(apiConfig.endpoints.payers.update(id), dto);
  }
}

export class MockPayersService implements IPayersService {
  getPayers(params?: { search?: string; type?: string; isActive?: boolean }): Promise<Payer[]> {
    return mockApiAdapter.getPayers(params);
  }

  getPayerById(id: string): Promise<Payer> {
    return mockApiAdapter.getPayerById(id);
  }

  createPayer(dto: CreatePayerDto, actor?: string, role?: UserRole): Promise<Payer> {
    return mockApiAdapter.createPayer(dto, actor, role);
  }

  updatePayer(id: string, dto: UpdatePayerDto, actor?: string, role?: UserRole): Promise<Payer> {
    return mockApiAdapter.updatePayer(id, dto, actor, role);
  }
}

export const payersService: IPayersService = apiConfig.isMockMode
  ? new MockPayersService()
  : new HttpPayersService();
