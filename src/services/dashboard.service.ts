/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Servicio del dominio del Dashboard Gerencial.
 * Separa la implementación HTTP REST de la simulación en memoria.
 */

import { apiConfig } from '../config/api.config';
import { httpClient } from '../lib/api/api-client';
import { mockApiAdapter } from '../mocks/mock-api-adapter';
import { DashboardSummary, Payment, PeriodFilter, TopDebtor } from '../types';

export interface IDashboardService {
  getDashboardSummary(params?: { period?: PeriodFilter; from?: string; to?: string }): Promise<DashboardSummary>;
  getTopDebtors(): Promise<TopDebtor[]>;
  getRecentPayments(limit?: number): Promise<Payment[]>;
}

export class HttpDashboardService implements IDashboardService {
  getDashboardSummary(params?: { period?: PeriodFilter; from?: string; to?: string }): Promise<DashboardSummary> {
    return httpClient.get<DashboardSummary>(apiConfig.endpoints.dashboard.summary, params as any);
  }

  getTopDebtors(): Promise<TopDebtor[]> {
    return httpClient.get<TopDebtor[]>(apiConfig.endpoints.dashboard.topDebtors);
  }

  getRecentPayments(limit = 5): Promise<Payment[]> {
    return httpClient.get<Payment[]>(apiConfig.endpoints.dashboard.recentPayments, { limit });
  }
}

export class MockDashboardService implements IDashboardService {
  getDashboardSummary(params?: { period?: PeriodFilter; from?: string; to?: string }): Promise<DashboardSummary> {
    return mockApiAdapter.getDashboardSummary(params);
  }

  getTopDebtors(): Promise<TopDebtor[]> {
    return mockApiAdapter.getTopDebtors();
  }

  getRecentPayments(limit = 5): Promise<Payment[]> {
    return mockApiAdapter.getRecentPayments(limit);
  }
}

export const dashboardService: IDashboardService = apiConfig.isMockMode
  ? new MockDashboardService()
  : new HttpDashboardService();
